import express from "express";
import { authenticateToken } from "../../middlewares/authenticateToken";
import { getPCaseGeneratedReport } from "../../controllers/unmatched-controllers/generateCasePController";
const router = express.Router();

// P CASE REPORT ROUTE
router.get("/p-case", authenticateToken, getPCaseGeneratedReport);

export default router;
