import express from "express";
import { restrictTo } from "../middlewares/authMiddleware";
import { authenticateToken } from "../middlewares/authenticateToken";
import { completeDetailsFileUploadController } from "../controllers/completeDetailsController";
const router = express.Router();

router.post(
  "/dynamic-complete",
  authenticateToken,
  restrictTo(["USER"]),
  completeDetailsFileUploadController
);

export default router;
