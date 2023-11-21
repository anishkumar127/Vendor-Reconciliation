import express from "express";
import {
  companyOpenController,
  companyOpenGetAllController,
} from "../controllers/companyOpenController";
const router = express.Router();
import upload from "../config/multerConfig";
import { companyTESTControllrs } from "../controllers/companyTESTControllrs";
import { checkAuth, restrictToLoggedInUserOnly } from "../middlewares/authMiddleware";
router.post(
  "/upload/company-open",
  upload.single("file"),
  companyOpenController
);
router.get("/company-open-record", checkAuth, companyOpenGetAllController);

// testing

router.post('/upload/companytest',companyTESTControllrs)
export default router;
