import express from "express";
const router = express.Router();
import upload from "../config/multerConfig";
import {
  completeDetailsController,
  getAllCompleteDetailsDataController,
  soaDetailsController,
  soaDetailsGetAllController,
} from "../controllers/soaDetailsController";
import { restrictTo } from "../middlewares/authMiddleware";
import { authenticateToken } from "../middlewares/authenticateToken";

router.post("/upload/soa-details", upload.single("file"), soaDetailsController);
router.get("/soa-details-record", soaDetailsGetAllController);

router.post(
  "/upload/CompleteDetails",
  restrictTo(["USER"]),
  completeDetailsController
);

router
  .route("/upload/getAllCompleteDetailsData")
  .get(authenticateToken, getAllCompleteDetailsDataController);

export default router;
