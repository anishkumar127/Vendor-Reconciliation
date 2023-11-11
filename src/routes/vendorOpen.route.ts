import express from "express";
import { vendorOpenController } from "../controllers/vendorOpenController";
const router = express.Router();
import upload from "../config/multerConfig";
router.post("/upload/vendor-open", upload.single("file"), vendorOpenController);

export default router;
