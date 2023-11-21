import { Request, Response } from "express";
import xlsx from "xlsx";
import { CompanyOpen } from "../models/company.model";
import { User } from "../models/user.model";

export const companyOpenController = async (req: Request, res: Response) => {
  console.log(req.file);
  try {
    if (!req?.file) {
      return res.status(400).json({ error: "File not provided" });
    }
    const { originalname, buffer } = req.file;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User not provied!" });
    }

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[21]; // in future it will be 0.
    console.log(workbook.SheetNames[21]);
    const sheetData: any = xlsx.utils.sheet_to_json(workbook?.Sheets[sheetName]);
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
          mixed_data:excelData[i]
        } as any);
        try {
          console.log(fileData);
          await fileData?.validate();
        } catch (validationError: any) {
          console.error(validationError);
          return res
            .status(400)
            .json({
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
    if(!(req as any ).user) return res.status(401).json({error:"user not logged in"});
    const model: any = CompanyOpen;
    const data = await model.find({user:(req as any).user._id});
    if (!data) {
      return res.status(404).json({ error: "not found!" });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
