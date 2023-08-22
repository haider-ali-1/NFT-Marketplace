import CustomError from '../utils/CustomError.js';
import asyncErrorHandler from './asyncErrorHandler.js';

const roleAuth = (allowedRoles) =>
  asyncErrorHandler(async (req, res, next) => {
    const userRoles = req.user.roles;
    const authorized = allowedRoles.some((role) => userRoles.includes(role));
    if (!authorized)
      throw new CustomError(
        `you dont have permission to perform this action`,
        403
      );
    next();
  });

export { roleAuth };
