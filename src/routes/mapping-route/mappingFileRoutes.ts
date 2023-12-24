import express from "express";
import {
  completeFileMappedGetDataController,
  completeFileMappingController,
  completeFileUpdateMappingController,
  masterFileMappedGetDataController,
  masterFileMappingController,
  masterFileUpdateMappingController,
  vendorFileMappedGetDataController,
  vendorFileMappingController,
  vendorFileUpdateMappingController,
} from "../../controllers/mapping-controller/fileMappingController";
import { restrictTo } from "../../middlewares/authMiddleware";
import { authenticateToken } from "../../middlewares/authenticateToken";
const router = express.Router();

//  MASTER FILE POST ROUTE

router.post(
  "/master-mapping",
  authenticateToken,
  restrictTo(["USER"]),
  masterFileMappingController
);

// MASTER FILE GET ROUTE

router.get(
  "/master-mapping",
  authenticateToken,
  restrictTo(["USER"]),
  masterFileMappedGetDataController
);

// MASTER FILE PUT ROUTE
router.put(
  "/master-mapping/:id",
  authenticateToken,
  restrictTo(["USER"]),
  masterFileUpdateMappingController
);

// VENDOR FILE POST ROUTE
router.post(
  "/vendor-mapping",
  authenticateToken,
  restrictTo(["USER"]),
  vendorFileMappingController
);

// VENDOR FILE PUT ROUTE.
router.put(
  "/vendor-mapping/:id",
  authenticateToken,
  restrictTo(["USER"]),
  vendorFileUpdateMappingController
);

// VENDOR FILE GET ROUTE.
router.get(
  "/vendor-mapping",
  authenticateToken,
  restrictTo(["USER"]),
  vendorFileMappedGetDataController
);

// COMPLETE FILE POST ROUTE.
router.post(
  "/complete-mapping",
  authenticateToken,
  restrictTo(["USER"]),
  completeFileMappingController
);

// COMPLETE FILE PUT ROUTE.
router.put(
  "/complete-mapping/:id",
  authenticateToken,
  restrictTo(["USER"]),
  completeFileUpdateMappingController
);
//  COMPLETE FILE GET ROUTE.
router.get(
  "/complete-mapping",
  authenticateToken,
  restrictTo(["USER"]),
  completeFileMappedGetDataController
);
export default router;
