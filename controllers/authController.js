import asyncErrorHandler from '../middlewares/asyncErrorHandler.js';
import User from '../models/userModel.js';
import CustomError from '../utils/CustomError.js';
import generateToken from '../utils/jwt.js';

// @ desc register user
// @ route POST /api/v1/signup
// @ route access PUBLIC

const registerUser = asyncErrorHandler(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    throw new CustomError('confirm password do not match', 400);

  // save user in database
  const user = await User.create({ name, email, password, confirmPassword });

  res.status(201).json({ status: 'success', data: { user } });
});

// @ desc login user
// @ route GET /api/v1/login
// @ route access PUBLIC

const loginUser = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  const isUserFound =
    user && (await user.isPasswordMatch(req.body.password, user.password));

  if (!isUserFound)
    throw new CustomError('incorrect username or password', 401);

  const token = generateToken(user._id);
  res.status(200).json({ status: 'success', token });
});

// @ desc login user
// @ route GET /api/v1/login
// @ route access PUBLIC

export { registerUser, loginUser };
