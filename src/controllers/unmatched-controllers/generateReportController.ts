import { RequestHandler } from "express";

export const generateReportController: RequestHandler = async (req, res) => {
  return res.json(req.body);
};
