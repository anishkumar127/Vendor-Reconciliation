import express from "express";
const router = express.Router();
import upload from "../config/multerConfig";
import { soaDetailsController } from "../controllers/soaDetailsController";

router.post("/upload/soa-details", upload.single("file"), soaDetailsController);

export default router;
