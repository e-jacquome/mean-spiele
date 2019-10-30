/* eslint-disable max-classes-per-file,max-lines */
import * as uuidv4 from 'uuid/v4';
import { Header, SignOptions, Signature, decode, sign, verify } from 'jws';
import { JWT_CONFIG, SALT_ROUNDS, alg, logger } from '../../shared';
import { compare, hash } from 'bcrypt';
import { Request } from 'express';
import { RolesService } from './roles.service';
import { UsersService } from './users.service';
import { join } from 'path';
import { readFileSync } from 'fs';

export class AuthorizationInvalidError implements Error {
    name = 'AuthorizationInvalidError';

    constructor(public message: string) {
        logger.silly('AuthorizationInvalidError.constructor()');
    }
}

export class TokenInvalidError implements Error {
    name = 'TokenInvalidError';

    constructor(public message: string) {
        logger.silly('TokenInvalidError.constructor()');
    }
}

export class TokenExpiredError implements Error {
    name = 'TokenExpiredError';

    constructor(public message: string) {
        logger.silly('TokenExpiredError.constructor()');
    }
}

export interface LoginResult {
    token: string;
    token_type: string; // eslint-disable-line camelcase
    expires_in: number; // eslint-disable-line camelcase
    roles?: Array<string>;
}

export class AuthService {
    private static readonly MILLIS_PER_SECOND = 1000;

    private static readonly RSA_PRIVATE_KEY = readFileSync(
        join(__dirname, 'jwt', 'rsa.pem'),
    );
    private static readonly RSA_PUBLIC_KEY = readFileSync(
        join(__dirname, 'jwt', 'rsa.public.pem'),
    );
    private static readonly ECDSA_PRIVATE_KEY = readFileSync(
        join(__dirname, 'jwt', 'ecdsa.pem'),
    );
    private static readonly ECDSA_PUBLIC_KEY = readFileSync(
        join(__dirname, 'jwt', 'ecdsa.public.pem'),
    );

    private readonly rolesService = new RolesService();
    private readonly usersService = new UsersService();

    // eslint-disable-next-line max-lines-per-function,max-statements
    async login(req: Request) {
        logger.silly(`body: ${JSON.stringify(req.body)}`);
        const { username }: { username: string } = req.body;
        logger.silly(`username: ${username}`);
        if (username === undefined) {
            return undefined;
        }
        const user = this.usersService.findByUsername(username);
        logger.silly(`user: ${JSON.stringify(user)}`);

        const { password }: { password: string } = req.body;
        logger.silly(`password: ${password}`);
        const passwordCheck = await this.checkPassword(user, password);
        if (!passwordCheck) {
            return undefined;
        }

        const header: Header = { alg };
        // akt. Datum in Sek. seit 1.1.1970 UTC
        const nowSeconds = this.nowSeconds();
        const payload = {
            // issued at (in Sek. seit 1.1.1970 UTC)
            iat: nowSeconds,
            // issuer
            iss: JWT_CONFIG.issuer,
            // subject (ID aus LDAP oder Active Directory, NICHT username o.ae.)
            sub: user._id,
            // JWT ID (hier: als generierte UUIDv4)
            jti: uuidv4(),
            // expiration time
            exp: nowSeconds + JWT_CONFIG.expiration,
            // nbf = not before
        };
        logger.silly(`payload: ${JSON.stringify(payload)}`);

        let secretOrPrivateKey: string | Buffer | undefined;
        if (this.isHMAC()) {
            secretOrPrivateKey = JWT_CONFIG.secret;
        } else if (this.isRSA()) {
            secretOrPrivateKey = AuthService.RSA_PRIVATE_KEY;
        } else if (this.isECDSA()) {
            secretOrPrivateKey = AuthService.ECDSA_PRIVATE_KEY;
        }
        const signOptions: SignOptions = {
            header,
            payload,
            secret: secretOrPrivateKey as string | Buffer,
            encoding: JWT_CONFIG.encoding,
        };
        const token = sign(signOptions);

        /* eslint-disable camelcase,@typescript-eslint/camelcase */
        const loginResult: LoginResult = {
            token,
            token_type: JWT_CONFIG.bearer,
            expires_in: JWT_CONFIG.expiration,
            roles: user.roles,
        };
        /* eslint-enable camelcase,@typescript-eslint/camelcase */

        logger.silly(`loginResult: ${JSON.stringify(loginResult)}`);
        return loginResult;
    }

    /* eslint-disable max-lines-per-function,max-statements */
    validateJwt(req: Request) {
        // Die "Field Names" beim Request Header unterscheiden nicht zwischen
        // Gross- und Kleinschreibung (case-insensitive)
        // https://tools.ietf.org/html/rfc7230
        // http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2
        const auth = req.header('Authorization');

        // Keine "Timing Attack" durch zeichenweises Vergleichen, wenn
        // unterschiedliche Antwortzeiten bei 403 entstehen
        // https://snyk.io/blog/node-js-timing-attack-ccc-ctf
        // Eine von Error abgeleitete Klasse hat die Property "message"
        if (auth === undefined) {
            logger.silly(
                'AuthService.validateJwt(): Kein Header-Field Authorization',
            );
            throw new AuthorizationInvalidError(
                'Kein Header-Field Authorization',
            );
        }
        logger.silly(`AuthService.validateJwt(): Authorization = ${auth}`);

        // Destructuring
        const [scheme, tokenString] = auth.split(' ');
        if (tokenString === undefined) {
            logger.silly(
                'AuthService.validateJwt(): Fehler beim Header-Field ' +
                    `Authorization: ${JSON.stringify(auth)}`,
            );
            throw new AuthorizationInvalidError(
                `Fehler beim Header-Field Authorization: ${JSON.stringify(
                    auth,
                )}`,
            );
        }

        // "Bearer" ist case-insensitiv
        // https://tools.ietf.org/html/rfc6750#page-7
        if (RegExp(`^${JWT_CONFIG.bearer}$`, 'iu').exec(scheme) === null) {
            logger.silly(
                'AuthService.validateJwt(): Das Schema beim Header-Field ' +
                    `Authorization muss ${JWT_CONFIG.bearer} sein`,
            );
            // Eine von Error abgeleitete Klasse hat die Property "message"
            throw new TokenInvalidError(
                'Das Schema beim Header-Field Authorization muss ' +
                    `${JWT_CONFIG.bearer} sein`,
            );
        }

        const [, payloadBase64, signatureBase64] = tokenString.split('.');
        if (signatureBase64 === undefined) {
            logger.silly(
                'AuthService.validateJwt(): Der Token besteht nicht aus 3 Teilen.',
            );
            throw new TokenInvalidError(
                'Der Token besteht nicht aus 3 Teilen.',
            );
        }
        if (payloadBase64.trim() === '') {
            logger.silly(
                'AuthService.validateJwt(): Die Payload des Tokens ist leer.',
            );
            throw new TokenInvalidError('Die Payload des Tokens ist leer.');
        }

        let tokenDecoded: Signature | null = null;
        try {
            tokenDecoded = decode(tokenString);
            // Optional catch binding parameters
        } catch {
            logger.silly(
                'AuthService.validateJwt(): Der JWT-Token kann nicht decodiert werden',
            );
            throw new TokenInvalidError(
                'Der JWT-Token kann nicht decodiert werden',
            );
        }
        if (tokenDecoded === null) {
            logger.silly(
                'AuthService.validateJwt(): Decodieren des Token-Strings liefert kein Token-Objekt',
            );
            throw new TokenInvalidError(
                'Decodieren des Token-Strings liefert kein Token-Objekt',
            );
        }
        logger.silly(
            'AuthService.validateJwt(): Der JWT-Token wurde decodiert: ' +
                `${JSON.stringify(tokenDecoded)}`,
        );

        // Destructuring
        const { header, payload } = tokenDecoded;
        if (header.alg !== alg) {
            logger.silly(
                `AuthService.validateJwt(): Falscher Algorithmus im Header: ${header.alg}`,
            );
            throw new TokenInvalidError(
                `Falscher Algorithmus im Header: ${header.alg}`,
            );
        }

        let secretOrPublicKey: string | Buffer | undefined;
        if (this.isHMAC()) {
            secretOrPublicKey = JWT_CONFIG.secret;
        } else if (this.isRSA()) {
            secretOrPublicKey = AuthService.RSA_PUBLIC_KEY;
        } else if (this.isECDSA()) {
            secretOrPublicKey = AuthService.ECDSA_PUBLIC_KEY;
        }

        let valid = true;
        try {
            valid = verify(tokenString, header.alg, secretOrPublicKey as
                | string
                | Buffer);
        } catch {
            logger.silly(
                'AuthService.validateJwt(): Der Token-String ist mit ' +
                    `${header.alg} nicht verifizierbar`,
            );
            throw new TokenInvalidError(
                `Der Token-String ist mit ${header.alg} nicht verifizierbar`,
            );
        }
        if (!valid) {
            throw new TokenInvalidError(`Ungueltiger Token: ${tokenString}`);
        }

        logger.silly(`AuthService.validateJwt(): payload: ${payload}`);
        const { exp, iss, sub } = JSON.parse(payload);
        if (
            exp === undefined ||
            typeof exp !== 'number' ||
            this.nowSeconds() >= exp
        ) {
            logger.silly(
                'AuthService.validateJwt(): Der Token ist abgelaufen: ' +
                    `exp=${exp}, now=${this.nowSeconds()}`,
            );
            throw new TokenExpiredError(`Abgelaufener Token: ${exp}`);
        }
        logger.silly(`exp=${exp}`);
        logger.silly(`iss=${iss}`);
        logger.silly(`sub=${sub}`);

        if (iss !== JWT_CONFIG.issuer) {
            logger.silly(`AuthService.validateJwt(): Falscher issuer: ${iss}`);
            throw new TokenInvalidError(`Falscher issuer: ${iss}`);
        }

        const user = this.usersService.findById(sub);
        if (user === undefined) {
            logger.silly(`AuthService.validateJwt(): Falsche User-Id: ${sub}`);
            throw new TokenInvalidError(`Falsche User-Id: ${sub}`);
        }

        // Request-Objekt um userId erweitern:
        // fuer die spaetere Ermittlung der Rollen nutzen
        const tmp: any = req;
        tmp.userId = sub;
        logger.debug(`AuthService.validateJwt(): userId: ${sub}`);
    }
    /* eslint-enable max-lines-per-function,max-statements */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    isLoggedIn(_: Request) {
        logger.debug('AuthService.isLoggedIn(): ok');
        return true;
    }
    /* eslint-enable @typescript-eslint/no-unused-vars */

    hasAnyRole(req: Request, roles: Array<string>) {
        const tmp = req as any;
        const user = this.usersService.findById(tmp.userId);
        const rolesNormalized = this.rolesService.getNormalizedRoles(roles);
        const result = this.userHasAnyRole(user, rolesNormalized);
        logger.debug(`AuthService.hasAnyRole(): ${result}`);
        return result;
    }

    userHasAnyRole(user: any, roles: Array<string>) {
        if (user === undefined || user.roles === undefined) {
            return false;
        }
        if (roles.length === 0) {
            return true;
        }

        const userRoles = user.roles as Array<string>;
        return roles.filter(role => userRoles.includes(role)).length !== 0;
    }

    async checkPassword(user: any, password: string) {
        if (user === undefined) {
            logger.debug('AuthService.checkPassword(): Kein User-Objekt');
            return Promise.resolve(false);
        }

        const result = await compare(password, user.password);
        logger.debug(`AuthService.checkPassword(): ${result}`);
        return result;
    }

    register(req: Request) {
        const body: any = { req };
        logger.debug(`AuthService.register(): ${body.username}`);
        const password = { body };
        logger.debug(`AuthService.register(): ${password}`);

        return hash(password, SALT_ROUNDS, (_, encrypted) =>
            // encrypted enthaelt den Hashwert *und* Salt
            logger.error(`encrypted: ${encrypted}`),
        );
    }

    private nowSeconds() {
        return Math.floor(Date.now() / AuthService.MILLIS_PER_SECOND);
    }

    // HMAC = Keyed-Hash MAC (= Message Authentication Code)
    private isHMAC() {
        return alg.startsWith('HS');
    }

    // RSA = Ron Rivest, Adi Shamir, Leonard Adleman
    private isRSA() {
        return alg.startsWith('RS');
    }

    // ECDSA = elliptic curve digital signature algorithm
    private isECDSA() {
        return alg.startsWith('ES');
    }
}
