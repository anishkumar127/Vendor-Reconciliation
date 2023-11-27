import { NextFunction, Request, Response } from "express";
import { getUser } from "../services/auth";

export async function restrictToLoggedInUserOnly(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userUid = req.cookies.uid;
  console.log("UID", userUid);
  if (!userUid) return res.status(404).json({ error: "not found id!" });

  const user = getUser(userUid);
  if (!user) return res.status(404).json({ error: "user not found!" });

  (req as any).user = user;
  next();
}

export async function checkAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userUid = req.cookies.uid;
  console.log("UID", userUid);

  const user = getUser(userUid);

  (req as any).user = user;
  next();
}
