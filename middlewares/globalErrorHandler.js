import mongoose from 'mongoose';
import CustomError from '../utils/CustomError.js';

const handleDevErrors = (res, err) => {
  res.status(err.statusCode || 500).json({
    status: 'fail',
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const handleProdErrors = (res, err) => {
  let statusCode = 400;
  let errorMessage;

  // Handle Custom Error
  if (err instanceof CustomError) {
    errorMessage = err.message;
  }

  // Handle Cast Error
  else if (err instanceof mongoose.Error.CastError) {
    errorMessage = `invalid ${err.path}: ${err.value}`;
  }

  // Handle Validation Error
  else if (err instanceof mongoose.Error.ValidationError) {
    errorMessage = Object.values(err.errors)
      .map((error) => error.message)
      .join('. ');
  }

  // Duplicate Key Error
  else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    errorMessage = `duplicate entry: the ${field} is already taken`;
  }
  // Default Error
  else {
    statusCode = 500;
    errorMessage = 'Internal Server Error';
  }

  // response for all types of errors
  res.status(statusCode).json({ status: 'fail', message: errorMessage });
};

// error will caught here first
const globalErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') handleDevErrors(res, err);
  else if (process.env.NODE_ENV === 'production') handleProdErrors(res, err);
};

export default globalErrorHandler;
