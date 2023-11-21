import express, { Request, Response } from "express";
const app = express();
import multer from "multer";
import xlsx from "xlsx";
import morgan from "morgan";
import { mongoConnect } from "./config/database";
import cors from 'cors';
import cookieParser from 'cookie-parser'

// <------------------------- MODELS IMPORT  -------------------->
import { User } from "./models/user.model";
import { CompanyOpen } from "./models/company.model";
import { VendorOpen } from "./models/vendor.model";
import { Soa } from "./models/soa.model";
// <------------------------- ROUTES IMPORT  -------------------->
import CompanyOpenRoute from "./routes/companyOpen.route";
import vendorOpenRoute from "./routes/vendorOpen.route";
import soaDetailsRoute from "./routes/soaDetails.route";

// <------------------------- USER ROUTES IMPORT  -------------------->
import userSignUpRoutes from "./routes/user/userRoutes";

// <------------------------- UNMATCHED ROUTES IMPORT  -------------------->

import unmatchedDetectRoutes from './routes/unmatched/unmatchedDetectRoutes'

// <------------------------- MAPPING ROUTES IMPORT [CONSTANTS] -------------------->
import constantsRoute from './routes/constants-route/constantsRoute'
import { checkForAuthentication } from "./middlewares/authMiddleware";
// import { restrictToLoggedInUserOnly } from "./middlewares/authMiddleware";

// const bodyParser = require("body-parser");
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
// <---------------------- MIDDLEWARES -------------------->
// alternative of bodyParse.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}));

app.use(checkForAuthentication);
// <------------------------- DATABASE CONNECT -------------------->
try {
  mongoConnect();
} catch (error) {
  console.log("DB CONNECT ERROR ",error);
}

// <------------------------- MULTER -------------------->

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// <------------------------- ROUTES -------------------->
// upload.
app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  const workbook = xlsx.read(req?.file?.buffer, { type: "buffer" });
  const sheetNameArr: any[] = [];
  for (let i = 0; i < workbook?.SheetNames?.length; i++) {
    if (workbook?.SheetNames[i] === "CNHi Open") {
      const sheetName = workbook?.SheetNames[i];
      const sheet = workbook?.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      sheetNameArr.push({ sheetName, data });
    }
  }
  return res.status(200).json({ data: sheetNameArr });
});
// dynamic upload file type.
app.post("/upload/:fileType", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File not provided" });
    }
    const { originalname, buffer } = req.file;
    const { userId } = req.body;
    const fileType = req.params.fileType;
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[21];
    console.log(workbook.SheetNames[21]);
    const x: any = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const excelData: any = x.map((item: any) => {
      const transformedItem: any = {};
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          const normalizedKey = key
            .trim()
            .replace(/\s+/g, " ") // Replace consecutive spaces with a single space
            .replace(/\W+/g, "_") // Replace non-word characters with underscores
            .toLowerCase();

          transformedItem[normalizedKey] = item[key];
        }
      }

      return transformedItem;
    });

    // Save data to schema based on the fileType
    let model: any = "companyOpen";
    switch (fileType) {
      case "companyOpen":
        model = CompanyOpen;
        break;
      case "vendorOpen":
        model = VendorOpen;
        break;
      case "soa":
        model = Soa;
        break;
      default:
        return res.status(400).json({ error: "Invalid fileType" });
    }

    const user = await User.findById(userId);
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
      await fileData.validate();
    } catch (validationError: any) {
      console.error(validationError);
      res
        .status(400)
        .json({ error: "Validation Error", details: validationError.errors });
      return;
    }

    await fileData.save();

    res.status(201).json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get file.
app.get("/retrieve/:fileType", async (req: Request, res: Response) => {
  try {
    const fileType = req.params.fileType;

    let model: any = "companyOpen";
    switch (fileType) {
      case "companyOpen":
        model = CompanyOpen;
        break;
      case "vendorOpen":
        model = VendorOpen;
        break;
      case "soa":
        model = Soa;
        break;
      default:
        return res.status(400).json({ error: "Invalid fileType" });
    }
    const data = await model.find();
    if (!data) {
      return res.status(404).json({ msg: "not found!" });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Specific Upload File
// <------------------------- ROUTES MIDDLEWARE  -------------------->
// Company Open
app.use("/api", CompanyOpenRoute);

// Vendor Open
app.use("/api",  vendorOpenRoute);

// All Details SOA.
app.use("/api", soaDetailsRoute);

// Create User
app.use("/api/user", userSignUpRoutes);

// UNMATCHED

app.use('/api',unmatchedDetectRoutes);

// Constants
app.use('/api',constantsRoute);

app.listen(PORT, () => console.log(`server running at ${PORT}`));
