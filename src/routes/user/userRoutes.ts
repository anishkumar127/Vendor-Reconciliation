import express from "express";
import {
  userSignInController,
  userSignUpController,
  UserLogout,
} from "../../controllers/user-controllers/userControllers";
import { restrictTo } from "../../middlewares/authMiddleware";
const router = express.Router();

// SignUp
router.post("/signup", restrictTo(["MASTER","ADMIN"]), userSignUpController);

// SignIn
router.post("/login",restrictTo(["MASTER","ADMIN","USER"]), userSignInController);

// Logout
router.route("/logout").get(UserLogout);
export default router;
