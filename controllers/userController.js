import asyncErrorHandler from '../middlewares/asyncErrorHandler.js';
import User from '../models/userModel.js';
import CustomError from '../utils/CustomError.js';

// @ desc profile information
// @ route GET /api/v1/users/profile
// @ access PRIVATE

const getUser = asyncErrorHandler(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) throw new CustomError(`please login`, 401);
  res.status(200).json({ status: 'success', data: { user } });
});

// @ desc update profile information
// @ route PATCH /api/v1/users/profile
// @ access PRIVATE

const updateUser = asyncErrorHandler(async (req, res, next) => {
  // get id from decoeded token
  const userId = req.user.id;

  // exclude fields that should not be update
  const { roles, ...updatedFields } = req.body;

  const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

// @ desc update password
// @ route PATCH /api/v1/users/update-password
// @ access PRIVATE

const updateUserPassword = asyncErrorHandler(async (req, res, next) => {
  // get id from decoded token
  const userId = req.user.id;

  const user = await User.findById(userId).select('+password');

  // check is current password correct
  const isCurrentPwdMatch = await user?.comparePwdInDB(
    req.body.currentPassword
  );

  if (!isCurrentPwdMatch)
    throw new CustomError(`current password do not match`, 400);

  // check new password and confirm pass is matched
  if (req.body.newPassword !== req.body.confirmPassword)
    throw new CustomError('confirm password do not match', 400);

  user.password = req.body.confirmPassword;
  await user.save();
  res
    .status(200)
    .json({ status: 'success', message: 'password changed successfully' });
});

export { getUser, updateUser, updateUserPassword };
