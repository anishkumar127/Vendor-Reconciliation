import { Request, Response } from "express";
import {
  masterCompanyConstants,
  soaConstants,
  vendorConstants,
} from "../../constants/Constants";

export const masterCompanyConstantsController = async (
  req: Request,
  res: Response
) => {
  if (masterCompanyConstants) {
    return res.status(200).json({ masterCompanyConstants });
  }
  return res.status(404).json({ error: "not found !" });
};

// vendor

export const vendorConstantsController = async (
  req: Request,
  res: Response
) => {
  if (vendorConstants) {
    return res.status(200).json({ vendorConstants });
  }
  return res.status(404).json({ error: "not found !" });
};

// soa

export const soaCompanyConstantsController = async (
  req: Request,
  res: Response
) => {
  if (soaConstants) {
    return res.status(200).json({ soaConstants });
  }
  return res.status(404).json({ error: "not found !" });
};
