import { Request, Response } from "express";
import { User } from "../models/user.model";
export const changeRoleController = async (req: Request, res: Response) => {
  const { userId, role } = req.body;

  if (!userId || !role) res.status(400).json({ error: "required fields." });

  const isUpdated = await User.findOneAndUpdate(
    { _id: userId },
    { $set: { role } }
  );

  if (!isUpdated) res.status(400).json({ error: "user not updated fields." });
  res.status(201).json({ data: isUpdated });
};
