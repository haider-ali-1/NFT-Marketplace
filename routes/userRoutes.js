import express from 'express';
import verifyToken from '../middlewares/verifyToken.js';
import {
  getUser,
  updateUser,
  updateUserPassword,
} from '../controllers/userController.js';

const router = express.Router();

router.use(verifyToken);
router.route('/').get(getUser).patch(updateUser);
router.route('/update-password').patch(updateUserPassword);

export default router;
