import express from 'express';
import verifyToken from '../middlewares/verifyToken.js';
import {
  getUser,
  updateUser,
  updateUserPassword,
} from '../controllers/userController.js';

const router = express.Router();

router.use(verifyToken);
router.route('/profile').get(getUser).patch(updateUser);
router.route('/change-password').patch(updateUserPassword);

export default router;
