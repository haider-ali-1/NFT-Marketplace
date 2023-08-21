import express from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').get(loginUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').patch(resetPassword);

export default router;
