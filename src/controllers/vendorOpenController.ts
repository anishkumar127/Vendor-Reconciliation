import { RequestHandler } from "express";
// import xlsx from "xlsx";
// import { User } from "../models/user.model";
import { getUser } from "../services/auth";
import { VendorOpen } from "../models/mixed/vendor.modal";

// export const vendorOpenController = async (req: Request, res: Response) => {
//     console.log(req.file);
//   try {
//     if (!req?.file) {
//       return res.status(400).json({ error: "Vendor File not provided" });
//     }
//     const { originalname, buffer } = req.file;
//     const { userId } = req.body;

//     if (!userId) {
//       return res.status(400).json({ error: "User not provided!" });
//     }

//     const workbook = xlsx.read(buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[22]; // in future it will be 0.
//     console.log(workbook.SheetNames);
//     console.log(workbook.SheetNames[22]);
//     const sheetData: any = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
//     console.log(sheetData);
//     const excelData: any = sheetData?.map((item: any) => {
//       const transformedItem: any = {};
//       for (const key in item) {
//         if (Object.prototype.hasOwnProperty.call(item, key)) {
//           const normalizedKey = key
//             .trim()
//             .replace(/\s+/g, " ") // Replace consecutive spaces with a single space
//             .replace(/^\W+|\W+$/g, "") // Remove leading and trailing non-word characters
//             .replace(/\W+/g, "_") // Replace special character with underscores
//             .toLowerCase();
//           transformedItem[normalizedKey] = item[key];
//         }
//       }
//       return transformedItem;
//     });

//     const model: any = VendorOpen;
//     const user = await User?.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     // console.log("excelData", excelData);
//     for (let i = 0; i < excelData?.length; i++) {
//       try {
//         const fileData = await model.create({
//           user: user?._id,
//           filename: originalname,
//           data: excelData[i],
//           mixed_data:excelData[i]
//         } as any);
//         try {
//           console.log(fileData);
//           await fileData?.validate();
//         } catch (validationError: any) {
//           console.error(validationError);
//           return res
//             .status(400)
//             .json({
//               error: "Validation Error",
//               details: validationError?.errors,
//             });
//         }
//       } catch (error: any) {
//         console.log(error?.message);
//       }
//     }
//     return res.status(201).json({ message: "File uploaded successfully" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// GET ALL RECORDS
// export const vendorOpenGetAllController = async (
//     req: Request,
//     res: Response
//   ) => {
//     try {
//       const model: any = VendorOpen;
//       const data = await model.find();
//       if (!data) {
//         return res.status(404).json({ error: "not found!" });
//       }
//       return res.status(200).json(data);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   };

// NEW WAY

// VENDOR CONTROLLER

export const vendorOpenController: RequestHandler = async (req, res) => {
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
  try {
    await VendorOpen.create({
      user,
      fileName,
      data,
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
  return res.status(201).json({ success: "successfully upload!" });
};

// GET VENDOR FILE DATA.
export const getAllVendorOpenDataController: RequestHandler = async (
  req,
  res
) => {
  console.log("HI");
  const token = (req as any)?.token;
  console.log(token);

  const { _id }: any = await getUser(token);
  if (!_id) return res.status(401).json({ error: "user not authenticated!" });
  console.log(_id);
  try {
    const userAllData = await VendorOpen.find({ user: _id });
    if (!userAllData) return res.status(404).json({ error: "not data found!" });
    return res.status(200).json({ data: userAllData });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
