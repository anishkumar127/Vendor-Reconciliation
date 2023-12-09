import express from "express";
import { restrictTo } from "../middlewares/authMiddleware";
import { authenticateToken } from "../middlewares/authenticateToken";
import { vendorFileUploadController } from "../controllers/vendorOpenController";
const router = express.Router();

router.post(
  "/dynamic-vendor",
  authenticateToken,
  restrictTo(["USER"]),
  vendorFileUploadController
);

export default router;
