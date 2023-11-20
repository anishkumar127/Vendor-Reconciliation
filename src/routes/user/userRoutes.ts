import express from "express";
import { userSignInController, userSignUpController } from "../../controllers/user-controllers/userControllers";
const router = express.Router();

// SignUp
router.post("/signup", userSignUpController);

// SignIn
router.post("/login",userSignInController);
export default router;
