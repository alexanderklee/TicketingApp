import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@goosenest/common';

import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';

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
app.use(currentUser);
app.use(createTicketRouter);
app.use(showTicketRouter);

// capture all invalid routes and invalid http verbs
app.all('*', async (req,res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };