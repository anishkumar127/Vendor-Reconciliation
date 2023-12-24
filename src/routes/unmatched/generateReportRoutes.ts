import express from "express";
import { authenticateToken } from "../../middlewares/authenticateToken";
import {
  getFCaseGeneratedReport,
  getKCaseGeneratedReport,
  getLCaseGeneratedReport,
  getMCaseGeneratedReport,
  getPCaseGeneratedReport,
} from "../../controllers/unmatched-controllers/generateCasePController";
const router = express.Router();

// P CASE REPORT ROUTE
router.get("/p-case", authenticateToken, getPCaseGeneratedReport);

// K CASE REPORT ROUTE
router.get("/k-case", authenticateToken, getKCaseGeneratedReport);
// L CASE REPORT ROUTE
router.get("/l-case", authenticateToken, getLCaseGeneratedReport);
// M CASE REPORT ROUTE
router.get("/m-case", authenticateToken, getMCaseGeneratedReport);
// F CASE REPORT ROUTE
router.get("/f-case", authenticateToken, getFCaseGeneratedReport);
export default router;
