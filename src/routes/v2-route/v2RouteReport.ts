import express from "express";
import { dynamicReportV2 } from "../../controllers/v2/dynamicReportV2";
import { authenticateToken } from "../../middlewares/authenticateToken";
import { restrictTo } from "../../middlewares/authMiddleware";
const router = express.Router();

router.post(
  "/dynamic-report",
  authenticateToken,
  restrictTo(["USER"]),
  dynamicReportV2
);

export default router;
