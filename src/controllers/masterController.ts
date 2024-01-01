import { Request, RequestHandler, Response } from "express";
import { User } from "../models/user.model";
import { getUser } from "../services/auth";
import { yourSchemaMaster } from "../models/dynamic-schema/masterDynamicSchema";
import { RecentIds } from "../models/mixed/RecentIds.model";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

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

// MASTER POST CALLS. TO UPLOAD MASTER FILE.

export const masterFileUploadController: RequestHandler = async (req, res) => {
  const { data, fileName, user } = req.body;

  if (!data || !fileName || !user)
    return res.status(404).json({ error: "missing required fields!" });

  const token = (req as any)?.token;
  console.log({ token });
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email, username }: any = await getUser(token);

  if (!_id || !email || !username)
    return res.status(401).json({ error: "user not authenticated!" });

  let YourModel;
  try {
    YourModel = mongoose.model(`${username}@masterOpen`, yourSchemaMaster);
  } catch (error) {
    console.log(error);
    YourModel = mongoose.model(`${username}@masterOpen`);
  }

  const uniqueId = uuidv4();
  try {
    await YourModel.insertMany(
      data?.map((item: any) => ({
        user,
        fileName,
        uniqueId,
        data: item,
      }))
    );

    // UPDATE THE RECENT IDS.
    try {
      const options = { new: true, upsert: true };
      const recentUpdatedIdMaster = await RecentIds.findOneAndUpdate(
        { user: _id, masterId: { $exists: true } }, // Update documents where user is the same and masterId field exists
        {
          $set: {
            masterId: uniqueId,
          },
        },
        options
      );

      if (!recentUpdatedIdMaster) {
        await RecentIds.create({
          user: _id,
          masterId: uniqueId,
        });
      }
    } catch (error: any) {
      if (error.name === "ValidationError") {
        // Handle validation error
        return res
          .status(400)
          .json({ success: false, error: error.errors.data });
      } else {
        return res
          .status(500)
          .json({ success: false, error: "Internal server error" });
      }
    }
  } catch (error: any) {
    console.log(error);
    // console.log(error.errors.data);
    if (error.name === "ValidationError") {
      // Handle validation error
      return res.status(400).json({ success: false, error: error.errors.data });
    } else {
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  }

  return res.status(201).json({
    message: "Documents created successfully",
  });
};

// MASTER GET THE MASTER FILES CALLS.
