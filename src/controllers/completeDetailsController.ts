import mongoose from "mongoose";
import { yourSchemaComplete } from "../models/dynamic-schema/completeDynamicSchema";
import { v4 as uuidv4 } from "uuid";
import { RequestHandler } from "express";
import { getUser } from "../services/auth";
import { RecentIds } from "../models/mixed/RecentIds.model";

export const completeDetailsFileUploadController: RequestHandler = async (
  req,
  res
) => {
  const { data, fileName, user } = req.body;
  if (!data || !fileName || !user)
    return res.status(404).json({ error: "missing required fields!" });
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email, username }: any = await getUser(token);

  if (!_id || !email || !username)
    return res.status(401).json({ error: "user not authenticated!" });

  let YourModel;
  try {
    YourModel = mongoose.model(`${username}@complete`, yourSchemaComplete);
  } catch (error) {
    YourModel = mongoose.model(`${username}@complete`);
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
    try {
      // UPDATE THE RECENT IDS.
      const options = { new: true, upsert: true };
      const recentUpdatedIdMaster = await RecentIds.findOneAndUpdate(
        { user: _id, masterId: { $exists: true } },
        {
          $set: {
            detailsId: uniqueId,
          },
        },
        options
      );

      if (!recentUpdatedIdMaster) {
        await RecentIds.create({
          user: _id,
          detailsId: uniqueId,
        });
      }
    } catch (error: any) {
      // return res.status(500).json(error);
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
    // return res.status(500).json(error);
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
