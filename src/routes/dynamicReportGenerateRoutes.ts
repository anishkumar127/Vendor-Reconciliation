import express from "express";
import { dynamicReportGenerateController } from "../controllers/dynamicReportGenerateController";
import { authenticateToken } from "../middlewares/authenticateToken";
import { restrictTo } from "../middlewares/authMiddleware";
const router = express.Router();

router.post(
  "/dynamic-report",
  authenticateToken,
  restrictTo(["USER"]),
  dynamicReportGenerateController
);

export default router;
