import { join } from 'path';
import { logger } from '../../shared';
import { readFileSync } from 'fs';

export class RolesService {
    private static readonly ROLES: Array<string> = JSON.parse(
        readFileSync(join(__dirname, 'json', 'roles.json'), 'utf-8'),
    );

    findAllRoles() {
        return RolesService.ROLES;
    }

    getNormalizedRoles(roles: Array<string>) {
        if (roles === undefined || roles.length === 0) {
            logger.debug('RolesService.getNormalizedRoles(): undefinded || []');
            return [];
        }

        const normalizedRoles = roles.filter(
            r => this.getNormalizedRole(r) !== undefined,
        );
        logger.debug(`RolesService.getNormalizedRoles(): ${normalizedRoles}`);
        return normalizedRoles;
    }

    private getNormalizedRole(role: string) {
        if (role === undefined) {
            return undefined;
        }

        return this.findAllRoles().find(
            r => r.toLowerCase() === role.toLowerCase(),
        );
    }
}
