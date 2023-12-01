import express from "express";
import {
  vendorOpenController,
  getAllVendorOpenDataController,
} from "../controllers/vendorOpenController";
const router = express.Router();
import upload from "../config/multerConfig";
import { restrictTo } from "../middlewares/authMiddleware";
import { authenticateToken } from "../middlewares/authenticateToken";
router.post("/upload/vendor-open", upload.single("file"), vendorOpenController);
// router.get('/vendor-open-record',vendorOpenGetAllController);

router.post("/upload/vendorOpen", restrictTo(["USER"]), vendorOpenController);

router
  .route("/upload/getAllVendorData")
  .get(authenticateToken, getAllVendorOpenDataController);

export default router;
