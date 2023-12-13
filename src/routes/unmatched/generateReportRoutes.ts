import express from "express";
import { authenticateToken } from "../../middlewares/authenticateToken";
import {
  getKCaseGeneratedReport,
  getPCaseGeneratedReport,
} from "../../controllers/unmatched-controllers/generateCasePController";
const router = express.Router();

// P CASE REPORT ROUTE
router.get("/p-case", authenticateToken, getPCaseGeneratedReport);

// K CASE REPORT ROUTE
router.get("/k-case", authenticateToken, getKCaseGeneratedReport);
export default router;
