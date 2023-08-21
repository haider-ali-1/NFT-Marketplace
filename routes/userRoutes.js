import express from 'express';
import {
  getUser,
  updateUser,
  updateUserPassword,
} from '../controllers/userController.js';

const router = express.Router();

router.route('/').get(getUser).patch(updateUser);
router.route('/update-password').patch(updateUserPassword);

export default router;
