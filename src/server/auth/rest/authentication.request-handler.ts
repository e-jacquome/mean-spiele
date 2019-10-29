import {
    AuthService,
    AuthorizationInvalidError,
    TokenExpiredError,
    TokenInvalidError,
} from '../service';
import { HttpStatus, logger } from '../../shared';