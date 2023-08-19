import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

router.route("/signup").post(registerUser);
router.route("/login").get(loginUser);
export default router;
