import express from "express";
import { generateReportController } from "../../controllers/unmatched-controllers/generateReportController";
import { authenticateToken } from "../../middlewares/authenticateToken";
const router = express.Router();

router.post("/generate-report", authenticateToken, generateReportController);

export default router;
