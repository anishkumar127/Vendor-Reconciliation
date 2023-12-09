import mongoose from "mongoose";
import { yourSchema } from "../models/dynamic-schema/dynamicSchema";
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

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  let YourModel;
  try {
    YourModel = mongoose.model(`${email}@complete`, yourSchema);
  } catch (error) {
    console.log(error);
    YourModel = mongoose.model(`${email}@complete`);
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
  } catch (error) {
    console.log(error);
  }
  return res.status(201).json({
    message: "Documents created successfully",
  });
};
