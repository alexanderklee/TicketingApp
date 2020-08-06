import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/users';
import { BadRequestError } from '../errors/bad-request-error';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin', 
    [ 
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password')
    ],
    validateRequest,
    async (req: Request,res: Response) => {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        // Check to see if user/email already exists
        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }
        // Compare supplised password with actual user password
        const passwordsMatch = await Password.compare(existingUser.password, password);

        // Check to see if passwords match
        if (!passwordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        // Passed all checks and now generate some JWT's
        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
            }, 
            process.env.JWT_KEY!
        );
        
        // store JWT on session object
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };