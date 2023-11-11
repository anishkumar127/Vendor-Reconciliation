import express from "express";
import { userSignUpController } from "../../controllers/user-controllers/userControllers";
const router = express.Router();

router.post("/signup", userSignUpController);
export default router;
