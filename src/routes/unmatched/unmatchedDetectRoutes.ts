import express from "express";
const router = express.Router();
import { unmatchedDetectController } from "../../controllers/unmatched-controllers/unmatchedDetectController";


router.get("/unmatched",unmatchedDetectController);

export default router;