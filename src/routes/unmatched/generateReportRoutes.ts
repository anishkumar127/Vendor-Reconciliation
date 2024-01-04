import express from "express";
import {
  getACaseGeneratedReport,
  getFCaseGeneratedReport,
  getGCaseGeneratedReport,
  getGTwoCaseGeneratedReport,
  getICaseGeneratedReport,
  getITwoCaseGeneratedReport,
  getKCaseGeneratedReport,
  getKTwoCaseGeneratedReport,
  getLFourCaseGeneratedReport,
  getLTwoCaseGeneratedReport,
  getMFiveCaseGeneratedReport,
  getMThreeCaseGeneratedReport,
  getMTwoCaseGeneratedReport,
  getPCaseGeneratedReport,
  getPTwoCaseGeneratedReport,
  getRecoGeneratedReport,
} from "../../controllers/unmatched-controllers/generateCaseController";
import { authenticateToken } from "../../middlewares/authenticateToken";
const router = express.Router();

// P CASE REPORT ROUTE
router.get("/p-one-case", authenticateToken, getPCaseGeneratedReport);

// K CASE REPORT ROUTE
router.get("/k-one-case", authenticateToken, getKCaseGeneratedReport);

// G CASE REPORT ROUTE
router.get("/g-one-case", authenticateToken, getGCaseGeneratedReport);

// I CASE REPORT ROUTE
router.get("/i-one-case", authenticateToken, getICaseGeneratedReport);

// L CASE REPORT ROUTE
// router.get("/l-one-case", authenticateToken, getLCaseGeneratedReport);

// M CASE REPORT ROUTE
// router.get("/m-one-case", authenticateToken, getMCaseGeneratedReport);

// F CASE REPORT ROUTE
router.get("/f-case", authenticateToken, getFCaseGeneratedReport);

// A CASE REPORT ROUTE
router.get("/a-case", authenticateToken, getACaseGeneratedReport);

// L2 CASE REPORT ROUTE
router.get("/l-two-case", authenticateToken, getLTwoCaseGeneratedReport);

// M2 CASE REPORT ROUTE
router.get("/m-two-case", authenticateToken, getMTwoCaseGeneratedReport);

// M3 CASE REPORT ROUTE
router.get("/m-three-case", authenticateToken, getMThreeCaseGeneratedReport);

// L4 CASE REPORT ROUTE
router.get("/l-four-case", authenticateToken, getLFourCaseGeneratedReport);

// // M4 CASE REPORT ROUTE
// router.get("/m-four-case", authenticateToken, getMFourCaseGeneratedReport);

// M5 CASE REPORT ROUTE
router.get("/m-five-case", authenticateToken, getMFiveCaseGeneratedReport);

// RIGHT

// P CASE REPORT ROUTE
router.get("/p-two-case", authenticateToken, getPTwoCaseGeneratedReport);

// K CASE REPORT ROUTE
router.get("/k-two-case", authenticateToken, getKTwoCaseGeneratedReport);

// G CASE REPORT ROUTE
router.get("/g-two-case", authenticateToken, getGTwoCaseGeneratedReport);

// I CASE REPORT ROUTE
router.get("/i-two-case", authenticateToken, getITwoCaseGeneratedReport);

// L CASE REPORT ROUTE
// router.get("/l-three-case", authenticateToken, getLThreeCaseGeneratedReport);

// M CASE REPORT ROUTE
// router.get("/m-four-case", authenticateToken, getMFourCaseGeneratedReport);
router.get("/reco", authenticateToken, getRecoGeneratedReport);

export default router;
