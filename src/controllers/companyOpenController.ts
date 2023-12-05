import { Request, RequestHandler, Response } from "express";
import xlsx from "xlsx";
import { CompanyOpen } from "../models/company.model";
import { User } from "../models/user.model";
import { MasterOpen } from "../models/Master.model";
import { getUser } from "../services/auth";
import { v4 as uuidv4 } from "uuid";
import { RecentIds } from "../models/mixed/RecentIds.model";

export const companyOpenController = async (req: Request, res: Response) => {
  console.log(req.file);
  try {
    if (!req?.file) {
      return res.status(400).json({ error: "File not provided" });
    }
    const { originalname, buffer } = req.file;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User not provided!" });
    }

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[21]; // in future it will be 0.
    console.log(workbook.SheetNames[21]);
    const sheetData: any = xlsx.utils.sheet_to_json(
      workbook?.Sheets[sheetName]
    );
    console.log(sheetData);
    const excelData: any = sheetData?.map((item: any) => {
      const transformedItem: any = {};
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          const normalizedKey = key
            .trim()
            .replace(/\s+/g, " ") // Replace consecutive spaces with a single space
            .replace(/^\W+|\W+$/g, "") // Remove leading and trailing non-word characters
            .replace(/\W+/g, "_") // Replace special character with underscores
            .toLowerCase();
          transformedItem[normalizedKey] = item[key];
        }
      }
      return transformedItem;
    });

    const model: any = CompanyOpen;
    const user = await User?.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // console.log("excelData", excelData);

    // valid data.
    for (let i = 0; i < excelData?.length; i++) {
      try {
        // console.log(excelData[i]);
        // break;
        const fileData = await model.create({
          user: user?._id,
          filename: originalname,
          data: excelData[i],
          mixed_data: excelData[i],
        } as any);
        try {
          console.log(fileData);
          await fileData?.validate();
        } catch (validationError: any) {
          console.error(validationError);
          return res.status(400).json({
            error: "Validation Error",
            details: validationError?.errors,
          });
        }
      } catch (error: any) {
        console.log(error?.message);
      }
    }

    return res.status(201).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const companyOpenGetAllController = async (
  req: Request,
  res: Response
) => {
  try {
    // if(!(req as any ).user) return res.status(401).json({error:"user not logged in"}); // this was when using the cookie.
    const model: any = CompanyOpen;
    const data = await model.find({ user: (req as any).user._id });
    if (!data) {
      return res.status(404).json({ error: "not found!" });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// MASTER CONTROLLER

export const masterOpenController: RequestHandler = async (req, res) => {
  const { user, fileName, data } = req.body;

  const authorizationHeaderValue = req.headers["authorization"];
  if (
    !authorizationHeaderValue ||
    !authorizationHeaderValue?.startsWith("Bearer")
  )
    return res.status(401).json({ error: "token not provided!" });

  const token = authorizationHeaderValue?.split("Bearer ")[1];
  if (!token) {
    return res.status(401).json({ error: "token not provided!" });
  }
  const isTokenValid = getUser(token);
  if (!isTokenValid) {
    return res.status(401).json({ error: "invalid token not authenticated!" });
  }
  console.log("t", isTokenValid);
  // console.log(user,fileName)
  if (!user || !fileName || !data) {
    return res.status(400).json({ error: `missing required fields.}` });
  }

  const { _id: userId }: any = await getUser(token);
  try {
    const uniqueId = uuidv4();
    console.log("uniqueId", uniqueId);
    // for (let i = 0; i < data?.length; i++) {
    //   await MasterOpen.create({
    //     user,
    //     fileName,
    //     uniqueId,
    //     data: data[i],
    //   });
    // }
    // const documents = data.map((item: any) => ({
    //   user,
    //   fileName,
    //   uniqueId,
    //   data: item,
    // }));

    // await MasterOpen.insertMany(documents);
    const obj: any = {};

    data.forEach((item: any) => {
      obj[item["Invoice Number"]] = item;
    });
    const createdMaster = await MasterOpen.create({
      user,
      fileName,
      uniqueId,
      data: obj,
    });
    const ID = createdMaster._id;
    const options = { new: true, upsert: true };
    // const recentUpdatedIdMaster = await RecentIds.findOneAndUpdate(
    //   { masterId: { $exists: true } }, // Update documents where masterId field exists
    //   {
    //     $set: {
    //       user: userId,
    //       masterId: ID,
    //     },
    //   },
    //   options
    // );
    const recentUpdatedIdMaster = await RecentIds.findOneAndUpdate(
      { user: userId, masterId: { $exists: true } }, // Update documents where user is the same and masterId field exists
      {
        $set: {
          masterId: ID,
        },
      },
      options
    );

    // If recentUpdatedIdMaster is null, create a new document
    try {
      if (!recentUpdatedIdMaster) {
        const newDocument = await RecentIds.create({
          user: userId,
          masterId: ID,
        });
        return res.status(201).json({
          masterId: recentUpdatedIdMaster,
          RecentCreatedMasterData: newDocument,
        });
      }
    } catch (error) {
      return res.status(500).json({ error: error });
    }

    console.log({ recentUpdatedIdMaster });
    console.log(createdMaster);
    return res.status(201).json({
      masterId: recentUpdatedIdMaster,
      RecentCreatedMasterData: createdMaster,
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
  return res.status(201).json({ success: "successfully upload!" });
};

// GET MASTER FILE DATA.
export const getAllMasterOpenDataController: RequestHandler = async (
  req,
  res
) => {
  const token = (req as any)?.token;

  const { _id }: any = await getUser(token);
  const masterId = await RecentIds.findOne({ user: _id }).select("masterId");
  console.log(masterId?.masterId);
  if (!masterId) return res.status(404).json({ error: "masterId not found!" });

  if (!_id) return res.status(401).json({ error: "user not authenticated!" });
  try {
    // const recentMaster = await RecentIds.find({masterId})
    const userAllData = await MasterOpen.findOne({ _id: masterId?.masterId });
    if (!userAllData) return res.status(404).json({ error: "not data found!" });
    return res.status(200).json({ data: userAllData });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
