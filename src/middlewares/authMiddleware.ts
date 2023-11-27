import { NextFunction, Request, Response } from "express";
import { getUser } from "../services/auth";

export async function restrictToLoggedInUserOnly(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // const userUid = req.cookies.uid; // old way domain specific.
  const userUid = req.headers["authorization"];
  console.log("UID", userUid);
  if (!userUid) return res.status(404).json({ error: "not found id!" });
  const token = userUid?.split("Bearer ")[1];
  const user = getUser(token);
  if (!user) return res.status(404).json({ error: "user not found!" });

  (req as any).user = user;
  next();
}

export async function checkAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // const userUid = req.cookies.uid;
  const userUid = req.headers["authorization"];

  console.log("UID", userUid);
  const token = userUid?.split("Bearer ")[1];
  const user = getUser(token);

  (req as any).user = user;
  next();
}
