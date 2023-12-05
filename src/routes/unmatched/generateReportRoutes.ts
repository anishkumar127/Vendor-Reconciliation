import express from "express";
import { generateCasePController } from "../../controllers/unmatched-controllers/generateCasePController";
import { authenticateToken } from "../../middlewares/authenticateToken";
const router = express.Router();

router.post("/generate-report", authenticateToken, generateCasePController);

export default router;
