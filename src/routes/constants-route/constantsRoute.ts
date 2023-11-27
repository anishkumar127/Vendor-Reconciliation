import express from "express";
import {
  masterCompanyConstantsController,
  vendorConstantsController,
} from "../../controllers/constants-controllers/ConstantsController";
import { soaDetailsController } from "../../controllers/soaDetailsController";

const router = express.Router();

router.get("/master-constants", masterCompanyConstantsController);
router.get("/vendor-constants", vendorConstantsController);
router.get("/soa-constants", soaDetailsController);
export default router;
