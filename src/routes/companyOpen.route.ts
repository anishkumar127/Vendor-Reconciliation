import express from "express";
import { companyOpenController } from "../controllers/companyOpenController";
const router = express.Router();
import upload from '../config/multerConfig';
router.post("/upload/company-open",upload.single("file"), companyOpenController);

export default router;
