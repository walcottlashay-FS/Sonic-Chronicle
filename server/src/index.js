import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';

import { env } from './config/env.js';
import {
  createDatabaseTables,
  testDatabaseConnection,
} from './config/database.js';
import { authRouter } from './routes/auth.routes.js';
import { tracksRouter } from './routes/tracks.routes.js';
import {
  errorHandler,
  notFound,
} from './middleware/errorHandler.js';

import {
  memoriesRouter,
} from './routes/memories.routes.js';

// create the express app
const app = express();

// trust the railway connection
app.set('trust proxy', 1);

// add basic server security
app.use(helmet());

// allow the frontend to use the backend
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// read json information
app.use(express.json());

// create the user session
app.use(
  session({
    name: 'sonic.sid',
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.nodeEnv === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

// check if the server is working
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
  });
});

// connect the application routes
app.use('/api/auth', authRouter);
app.use('/api', tracksRouter);
app.use('/api', memoriesRouter);

// handle missing routes and errors
app.use(notFound);
app.use(errorHandler);

// connect the database and start the server
async function startServer() {
  try {
    await testDatabaseConnection();
    await createDatabaseTables();

    app.listen(env.port, () => {
      console.log(
        `Sonic Chronicle API listening on http://127.0.0.1:${env.port}`
      );
    });
  } catch (error) {
    console.error('The server could not start.');

    process.exit(1);
  }
}

startServer();