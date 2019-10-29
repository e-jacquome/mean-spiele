import * as uuidv4 from 'uuid/v4';
import { Header, SignOptions, Signature, decode, sign, verify } from 'jws';
import {JWT_CONFIG, SALT_ROUNDS, alg, logger } from '../../shared';
import { compare, hash } from 'bcrypt';
import { Request } from 'express';
import { RolesService } from './roles.service';
import { UsersService } from './users.service';
import { join } from 'path';
import { readFileSync } from 'fs';