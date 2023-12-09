import express from "express";
import {
  masterCompanyConstantsController,
  soaCompanyConstantsController,
  vendorConstantsController,
} from "../../controllers/constants-controllers/ConstantsController";

const router = express.Router();

router.get("/master-constants", masterCompanyConstantsController);
router.get("/vendor-constants", vendorConstantsController);
router.get("/soa-constants", soaCompanyConstantsController);
export default router;
