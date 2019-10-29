import * as cors from 'cors';

export const corsHandler = 
    cors ({
        origin: 'https://localhost',
        method: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeader: [
            'Orgin',
            'Content-Type',
            'Accept',
            'Authorization',
            'Access-Control_Allow-Origin',
            'Access-Control_Allow-Methods',
            'Access-Control_Allow_Headers',
            'Allow',
            'Conentnt-Length',
            'Date',
            'Last-Modified',
            'If-Match',
            'If-Not-Match',
            'if_modified-Since',
        ],
        exposedHeader: ['Location', 'Etag'],
        maxAge: 86400,

    });