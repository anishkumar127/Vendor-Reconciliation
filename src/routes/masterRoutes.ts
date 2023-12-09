import express from "express";

const router = express.Router();
import { restrictTo } from "../middlewares/authMiddleware";
import {
  changeRoleController,
  masterFileUploadController,
} from "../controllers/masterController";
import { authenticateToken } from "../middlewares/authenticateToken";

// MASTER CHANGE ROLE
router.route("/change-role").post(restrictTo(["MASTER"]), changeRoleController);

//  MASTER UPLOAD FILE ROUTE.
router.post(
  "/dynamic-master",
  authenticateToken,
  restrictTo(["USER"]),
  masterFileUploadController
);

// MASTER GET UPLOADED FILE ROUTE.
export default router;
