import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-users';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler'
import { NotFoundError } from './errors/not-found-error';

const app = express();
// need to let express know its behind ingress-nginx
app.set('trust proxy', true);
app.use(json());
// using cookies and unencrypted jwt due to server-side
// rendering (Next) implementation
app.use(
    cookieSession({
        signed: false,
        // Need workaround for jest using unsecured testing
        // By default, jest uses http so extracting node_env
        // to flip "secure" value to false while in test mode
        // and cookieSession / secure set to true will cause
        // Set-Cookie not to be present.
        secure: process.env.NODE_ENV !== 'test'
    })
);

// wire up middlewares
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// capture all invalid routes and invalid http verbs
app.all('*', async (req,res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };