import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import nftRoutes from './routes/nftRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';

import CustomError from './utils/CustomError.js';
import globalErrorHandler from './middlewares/globalErrorHandler.js';

const app = express();

// rate limiter
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: `too many requests, please wait a minute`,
});

// set rate limiter before any other middleware
app.use('/api', apiRateLimiter);

// enhance the security of app by adding various HTTP headers
app.use(helmet());

// body parsing middleware
app.use(express.json({ limit: '10kb' }));

// preven no sql injection
app.use(mongoSanitize());

// development logging middleware
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// static files middleware
app.use(express.static('./public'));

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/nfts', nftRoutes);

// handle 404 errors
app.all('*', (req, res, next) => {
  throw new CustomError(`cannot find ${req.originalUrl} on server`, 404);
});

// global error handling middleware
app.use(globalErrorHandler);
export default app;
