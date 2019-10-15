import * as mongoose from 'mongoose';
import { join } form 'path';
import { logger } from '../logger';
import { readFileSync } from 'fs';
import stringify from 'fast-safe-stringify';

export const mockDB = process.env.DB_MOCK === 'true';

// Default: Port 27017

const { DB_HOST, DB_PORT } = process.env;
const host = DB_HOST ?? 'localhost';

const Port