import express from 'express';
import morgan from 'morgan';
import nftRoutes from './routes/nftRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';

import CustomError from './utils/CustomError.js';
import globalErrorHandler from './middlewares/globalErrorHandler.js';

const app = express();

// middleware
app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.static('./public'));

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/nfts', nftRoutes);

app.all('*', (req, res, next) => {
  throw new CustomError(`cannot find ${req.originalUrl} on server`, 404);
});

app.use(globalErrorHandler);
export default app;
