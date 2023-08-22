import CustomError from '../utils/CustomError.js';
import asyncErrorHandler from './asyncErrorHandler.js';
import jwt from 'jsonwebtoken';

const verifyToken = asyncErrorHandler(async (req, res, next) => {
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization'];
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

  if (!token) throw new CustomError(`please login`, 400);

  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = decodedToken.user;
  next();
});

export default verifyToken;
