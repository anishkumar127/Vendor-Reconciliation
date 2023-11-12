import express from "express";
import {
  companyOpenController,
  companyOpenGetAllController,
} from "../controllers/companyOpenController";
const router = express.Router();
import upload from "../config/multerConfig";
router.post(
  "/upload/company-open",
  upload.single("file"),
  companyOpenController
);
router.get("/company-open-record", companyOpenGetAllController);
export default router;
