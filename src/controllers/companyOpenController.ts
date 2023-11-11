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
    const { originalname, buffer } = req?.file;
    const { userId } = req?.body;

    if (!userId) {
      return res.status(400).json({ error: "User not provied!" });
    }

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[21]; // in future it will be 0.
    console.log(workbook.SheetNames[21]);
    const sheetData: any = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const excelData: any = sheetData?.map((item: any) => {
      const transformedItem: any = {};
      for (const key in item) {
        if (item?.hasOwnProperty(key)) {
          const normalizedKey = key
            .trim()
            .replace(/\s+/g, " ") // Replace consecutive spaces with a single space
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
    console.log("excelData", excelData);
    const fileData = new model({
      user: user._id,
      filename: originalname,
      data: excelData,
    } as any);

    try {
      console.log(fileData);
      await fileData?.validate();
    } catch (validationError: any) {
      console.error(validationError);
      res
        .status(400)
        .json({ error: "Validation Error", details: validationError.errors });
      return;
    }
    await fileData.save();
    return res.status(201).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
