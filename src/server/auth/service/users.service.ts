import * as Ajv from 'ajv';
import { join } from 'path';
import { logger } from '../../shared';
import { readFileSync } from 'fs';

export class UsersService {
    private readonly users = JSON.parse(
        readFileSync(join(__dirname, 'json', 'users.json'), 'utf-8'),
    );

    constructor() {
        //Validierung durch Ajv
        const ajv = new Ajv({ allErrors: true, verbose: true });
        const schema = JSON.parse(
            readFileSync(join(__dirname, 'json', 'users.schema.json'), 'utf-8'),
        );
        //Nicht asynchron
        const valid = ajv.validate(schema, this.users) as boolean;
        if (!valid) {
            logger.error(`${JSON.stringify(ajv.errors)}`);
        }
        logger.info(
            `UsersService: Die Benutzerkennungen sind eingelesen: ${JSON.stringify(
                this.users,
            )}`,
        );
    }

    findByUsername(username: string) {
        return this.users.find((u: any) => u.username === username);
    }

    findById(id: string) {
        return this.users.find((u: any) => u._id === id);
    }

    findByEmail(email: string) {
        return this.users.find((u: any) => u.email === email);
    }
}
