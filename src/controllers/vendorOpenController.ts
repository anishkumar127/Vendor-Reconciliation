import { RequestHandler } from "express";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { yourSchemaVendor } from "../models/dynamic-schema/vendorDynamicSchema";
import { RecentIds } from "../models/mixed/RecentIds.model";
import { getUser } from "../services/auth";

// UPLOAD VENDOR FILE. POST CALL.
export const vendorFileUploadController: RequestHandler = async (req, res) => {
  const { data, fileName, user } = req.body;

  if (!data || !fileName || !user)
    return res.status(404).json({ error: "missing required fields!" });

  const token = (req as any)?.token;
  console.log({ token });
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  let YourModel;
  try {
    YourModel = mongoose.model(`${email}@vendorOpen`, yourSchemaVendor);
  } catch (error) {
    console.log(error);
    YourModel = mongoose.model(`${email}@vendorOpen`);
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
        { user: _id, masterId: { $exists: true } }, // Update documents where user is the same and masterId field exists
        {
          $set: {
            vendorId: uniqueId,
          },
        },
        options
      );

      if (!recentUpdatedIdMaster) {
        await RecentIds.create({
          user: _id,
          vendorId: uniqueId,
        });
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }

  return res.status(201).json({
    message: "Documents created successfully",
  });
};
