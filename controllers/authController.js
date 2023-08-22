import crypto from 'node:crypto';
import asyncErrorHandler from '../middlewares/asyncErrorHandler.js';
import User from '../models/userModel.js';
import CustomError from '../utils/CustomError.js';
import { generateUserToken } from '../utils/jwt.js';
import sendEmail from '../services/emailService.js';

// @ desc register user
// @ route POST /api/v1/auth/register
// @ access PUBLIC

const registerUser = asyncErrorHandler(async (req, res, next) => {
  const { roles, ...userData } = req.body;
  const user = await User.create(userData);
  // payload for generate token
  const payload = { user: { id: user._id, roles: user.roles } };
  const token = generateUserToken(payload);

  res.status(201).json({ status: 'success', token, data: { user } });
});

// @ desc login user
// @ route GET /api/v1/auth/login
// @ access PUBLIC

const loginUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email }).select(
    '+password'
  );
  const passwordMatch = await user?.comparePwdInDB(req.body.password);

  if (!user || !passwordMatch)
    throw new CustomError(`incorrect email or password please try again`, 401);

  // payload for generate token
  const payload = { user: { id: user._id, roles: user.roles } };
  const token = generateUserToken(payload);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + 300000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success', token });
});

// @ desc forgot password
// @ route PATCH /api/v1/auth/forgot-password
// @ access PRIVATE

const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new CustomError('cannot find user with that email', 400);

  // generate password reset token string
  const { token, hashedToken } = user.generateCryptoToken();
  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExpires = Date.now() + 10 * 60000; // set 10 minutes for reset password expire time
  await user.save();

  // generate url for reset password
  const passwordResetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/reset-password/${token}`;

  try {
    sendEmail({
      from: 'AuthAPI Support <admin@gmail.com>',
      to: user.email,
      subject: 'password reset request',
      text: passwordResetURL,
    });
  } catch (error) {
    console.log('error for reset password', error.message);
  }

  res.status(200).json({
    status: 'success',
    message: 'password reset link has been sent at your email address',
  });
});

// @ desc forgot password
// @ route PATCH /api/v1/auth/reset-password/:token
// @ access PRIVATE

const resetPassword = asyncErrorHandler(async (req, res, next) => {
  const token = req.params.token;

  // generate crypto hash token from plain token to compare
  const hashedToken = crypto
    .createHmac('sha256', process.env.CRYPTO_SECRET_KEY)
    .update(token)
    .digest('hex');

  // find user with crypto hashed token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gte: Date.now() },
  });

  if (!user) throw new CustomError(`token is invalid or expired`, 400);

  if (req.body.password !== req.body.confirmPassword)
    throw new CustomError('confirm password not match', 400);

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  await user.save();

  // payload for generate token
  const payload = { user: { id: user._id, roles: user.roles } };
  const jwtToken = generateUserToken(payload);
  res.status(200).json({ status: 'success', token: jwtToken });
});

export { registerUser, loginUser, forgotPassword, resetPassword };
