import { Request } from 'express';
import { SERVER_CONFIG } from './config';

export const getBaseUri = (req: Request) => {
    const { protocol, hostname, baseUrl } = req;
    return `${protocol}://${hostname}:${SERVER_CONFIG.port}${baseUrl}`;
};