import express from "express";
import { vendorOpenController, vendorOpenGetAllController } from "../controllers/vendorOpenController";
const router = express.Router();
import upload from "../config/multerConfig";
router.post("/upload/vendor-open", upload.single("file"), vendorOpenController);
router.get('/vendor-open-record',vendorOpenGetAllController);
export default router;
