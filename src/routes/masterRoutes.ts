import express from "express";

const router = express.Router();
import { restrictTo } from "../middlewares/authMiddleware";
import { changeRoleController } from "../controllers/masterController";

router.route("/change-role").post(restrictTo(["MASTER"]), changeRoleController);
export default router;
