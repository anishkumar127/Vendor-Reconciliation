import express from "express";
import {
  companyOpenController,
  getAllMasterOpenDataController,
  masterOpenController,
  // companyOpenGetAllController,
} from "../controllers/companyOpenController";
const router = express.Router();
import upload from "../config/multerConfig";
import { companyTESTControllrs } from "../controllers/companyTESTControllrs";
import { authenticateToken } from "../middlewares/authenticateToken";
import { restrictTo } from "../middlewares/authMiddleware";
// import { restrictTo } from "../middlewares/authMiddleware";
router.post(
  "/upload/company-open",
  upload.single("file"),
  companyOpenController
);
// router.get(
//   "/company-open-record",
//   restrictTo(["ADMIN"]),
//   companyOpenGetAllController
// );

// testing

router.post("/upload/companytest", companyTESTControllrs);
// router.route("upload/masterOpen").post(masterOpenController);
router.post("/upload/masterOpen", restrictTo(["USER"]) ,masterOpenController);

router
  .route("/upload/getAllMasterData")
  .get(authenticateToken, getAllMasterOpenDataController);

export default router;
