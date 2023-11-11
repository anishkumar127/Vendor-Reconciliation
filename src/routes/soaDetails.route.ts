import express from "express";
const router = express.Router();
import upload from "../config/multerConfig";
import { soaDetailsController, soaDetailsGetAllController } from "../controllers/soaDetailsController";

router.post("/upload/soa-details", upload.single("file"), soaDetailsController);
router.get('/soa-details-record',soaDetailsGetAllController);
export default router;
