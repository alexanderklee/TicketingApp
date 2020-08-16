import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
    id: string;
    email: string;
}

// need to augment express' request to include UserPayload property
// to satisfy TS 
declare global {
    namespace Express {
        interface Request {
            // type may or may not be defined use "?"
            currentUser?: UserPayload;
        }
    }
}

export const currentUser = (
    req: Request,
    res: Response,
    next: NextFunction
    ) => {
        if(!req.session?.jwt) {
            return next();
        }

        try {
            const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
            req.currentUser = payload;
        }   catch (err) {}

        next();
};