import express from "express";
const app = express();
// import multer from "multer";
// import xlsx from "xlsx";
import morgan from "morgan";
// import { mongoConnect } from "./config/database";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import { v4 as uuidv4 } from "uuid";

// <------------------------- MODELS IMPORT  -------------------->
// import { User } from "./models/user.model";
// import { CompanyOpen } from "./models/company.model";
// import { VendorOpen } from "./models/vendor.model";
// import { Soa } from "./models/soa.model";
// <------------------------- ROUTES IMPORT  -------------------->
import CompanyOpenRoute from "./routes/companyOpen.route";
import vendorOpenRoute from "./routes/vendorOpen.route";
import soaDetailsRoute from "./routes/soaDetails.route";

// <------------------------- USER ROUTES IMPORT  -------------------->
import userSignUpRoutes from "./routes/user/userRoutes";

// <------------------------- UNMATCHED ROUTES IMPORT  -------------------->

// import unmatchedDetectRoutes from "./routes/unmatched/unmatchedDetectRoutes";

// <------------------------- MAPPING ROUTES IMPORT [CONSTANTS] -------------------->
import constantsRoute from "./routes/constants-route/constantsRoute";
import generateReportRoute from "./routes/unmatched/generateReportRoutes";

// import { checkForAuthentication } from "./middlewares/authMiddleware";
import masterRoutes from "./routes/masterRoutes";
import mongoose, { Aggregate } from "mongoose";
// import { restrictToLoggedInUserOnly } from "./middlewares/authMiddleware";
import connection from "./config/database";
import bodyParser from "body-parser";
import { MasterOpen } from "./models/Master.model";
// import { mongoConnect } from "./config/database";
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

const PORT = process.env.PORT || 3000;
// <---------------------- MIDDLEWARES -------------------->
// alternative of bodyParse.
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
// app.use(cors({
//   origin:"http://localhost:5173",
//   credentials:true
// }));
// app.use(cors());
app.use(cors({ origin: "*" }));
// app.use(checkForAuthentication);
// <------------------------- DATABASE CONNECT -------------------->

// <------------------------- MULTER -------------------->

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// <------------------------- ROUTES -------------------->
// upload.
// app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
//   const workbook = xlsx.read(req?.file?.buffer, { type: "buffer" });
//   const sheetNameArr: any[] = [];
//   for (let i = 0; i < workbook?.SheetNames?.length; i++) {
//     if (workbook?.SheetNames[i] === "CNHi Open") {
//       const sheetName = workbook?.SheetNames[i];
//       const sheet = workbook?.Sheets[sheetName];
//       const data = xlsx.utils.sheet_to_json(sheet);
//       sheetNameArr.push({ sheetName, data });
//     }
//   }
//   return res.status(200).json({ data: sheetNameArr });
// });
// dynamic upload file type.
// app.post("/upload/:fileType", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "File not provided" });
//     }
//     const { originalname, buffer } = req.file;
//     const { userId } = req.body;
//     const fileType = req.params.fileType;
//     const workbook = xlsx.read(buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[21];
//     console.log(workbook.SheetNames[21]);
//     const x: any = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
//     const excelData: any = x.map((item: any) => {
//       const transformedItem: any = {};
//       for (const key in item) {
//         if (Object.prototype.hasOwnProperty.call(item, key)) {
//           const normalizedKey = key
//             .trim()
//             .replace(/\s+/g, " ") // Replace consecutive spaces with a single space
//             .replace(/\W+/g, "_") // Replace non-word characters with underscores
//             .toLowerCase();

//           transformedItem[normalizedKey] = item[key];
//         }
//       }

//       return transformedItem;
//     });

//     // Save data to schema based on the fileType
//     let model: any = "companyOpen";
//     switch (fileType) {
//       case "companyOpen":
//         model = CompanyOpen;
//         break;
//       case "vendorOpen":
//         model = VendorOpen;
//         break;
//       case "soa":
//         model = Soa;
//         break;
//       default:
//         return res.status(400).json({ error: "Invalid fileType" });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     console.log("excelData", excelData);
//     const fileData = new model({
//       user: user._id,
//       filename: originalname,
//       data: excelData,
//     } as any);

//     try {
//       console.log(fileData);
//       await fileData.validate();
//     } catch (validationError: any) {
//       console.error(validationError);
//       res
//         .status(400)
//         .json({ error: "Validation Error", details: validationError.errors });
//       return;
//     }

//     await fileData.save();

//     res.status(201).json({ message: "File uploaded successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// get file.
// app.get("/retrieve/:fileType", async (req: Request, res: Response) => {
//   try {
//     const fileType = req.params.fileType;

//     let model: any = "companyOpen";
//     switch (fileType) {
//       case "companyOpen":
//         model = CompanyOpen;
//         break;
//       case "vendorOpen":
//         model = VendorOpen;
//         break;
//       case "soa":
//         model = Soa;
//         break;
//       default:
//         return res.status(400).json({ error: "Invalid fileType" });
//     }
//     const data = await model.find();
//     if (!data) {
//       return res.status(404).json({ msg: "not found!" });
//     }
//     return res.status(200).json(data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Specific Upload File
// <------------------------- ROUTES MIDDLEWARE  -------------------->
// Company Open
app.use("/api", CompanyOpenRoute);

// Vendor Open
app.use("/api", vendorOpenRoute);

// All Details SOA.
app.use("/api", soaDetailsRoute);

// Create User
app.use("/api/user", userSignUpRoutes);

// UNMATCHED

// app.use("/api", unmatchedDetectRoutes);
app.use("/api", generateReportRoute);

// Constants
app.use("/api", constantsRoute);

app.use("/api/master", masterRoutes);

// try {
//   mongoConnect();
// } catch (error) {
//   console.log("DB CONNECT ERROR ",error);
// }
// app.listen(PORT, () => console.log(`server running at ${PORT}`));

// mongoConnect()
//   .then(() => {
//     app.listen(PORT, () => console.log(`Server running at ${PORT}`));
//   })
//   .catch((error) => {
//     console.log("DB CONNECT ERROR", error);
//   });

// const MONGO_URI: any =
//   process.env.NODE_ENV !== "production"
//     ? process.env.MONGO_LOCAL_URI
//     : process.env.MONGO_URI;

// app.post("/dynamic", async (req: Request, res: Response) => {
//   // const { data } = req.body;
//   // if (!data) return;
//   const data = {
//     data: "OK",
//   };
//   const yourSchema = new mongoose.Schema({
//     data: mongoose.Schema.Types.Mixed,
//   });
//   const YourModel = mongoose.model("YourModel", yourSchema, "YourModel");

//   const yourDocument = await YourModel.create({
//     data,
//   });

//   console.log(yourDocument);
//   // return res.json({yourDocument});
// });
const yourSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  uniqueId: { type: String, required: true },
  data: mongoose.Schema.Types.Mixed,
});

app.post("/dynamic-master", async (req, res) => {
  const { data, fileName, user } = req.body;

  let YourModel;
  try {
    YourModel = mongoose.model("anish@gmail.com@masterOpen", yourSchema);
  } catch (error) {
    console.log(error);
    YourModel = mongoose.model("anish@gmail.com@masterOpen");
  }

  const uniqueId = uuidv4();
  try {
    // const yourDocument = await YourModel?.create({
    //   user,
    //   fileName,
    //   uniqueId,
    //   data: data[i],
    // });
    await YourModel.insertMany(
      data.map((item: any) => ({
        user,
        fileName,
        uniqueId,
        data: item,
      }))
    );
  } catch (error) {
    console.log(error);
  }

  return res.send({
    message: "Documents created successfully",
  });
});

// vendor
app.post("/dynamic-vendor", async (req, res) => {
  const { data, fileName, user } = req.body;

  const yourSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    uniqueId: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed,
  });
  let YourModel;
  try {
    YourModel = mongoose.model(
      "anish@gmail.com@vendorOpen",
      yourSchema,
      "anish@gmail.com@vendorOpen"
    );
  } catch (error) {
    console.log(error);
    YourModel = mongoose.model("anish@gmail.com@vendorOpen");
  }

  const uniqueId = uuidv4();

  for (let i = 0; i < data?.length; i++) {
    try {
      // @ts-ignore
      const yourDocument = await YourModel?.create({
        user,
        fileName,
        uniqueId,
        data: data[i],
      });
    } catch (error) {
      console.log(error);
    }
  }
  // console.log(yourDocument);
});
// complete details
app.post("/dynamic-complete", async (req, res) => {
  const { data, fileName, user } = req.body;

  const yourSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    uniqueId: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed,
  });
  let YourModel;
  try {
    YourModel = mongoose.model("anish@gmail.com@complete", yourSchema);
  } catch (error) {
    console.log(error);
    YourModel = mongoose.model("anish@gmail.com@complete");
  }

  const uniqueId = uuidv4();

  for (let i = 0; i < data?.length; i++) {
    try {
      // @ts-ignore
      const yourDocument = await YourModel?.create({
        user,
        fileName,
        uniqueId,
        data: data[i],
      });
    } catch (error) {
      console.log(error);
    }
  }
  // console.log(yourDocument);
});

// report generate

// app.post("/dynamic-report", async (req, res) => {
//   const { vendorName } = req.body;
//   console.log(vendorName);
//   const yourModel = "anish@gmail.com@masterOpens";

//   let Collection;
//   try {
//     //@ts-ignore
//     Collection = await connection.model(yourModel);
//   } catch (error: any) {
//     console.log(error.message);
//     //come
//     //@ts-ignore

//     Collection = await connection.model(yourModel, yourSchema);
//   }
//   //@ts-ignore
//   // console.log(await MasterOpen.find());
//   console.log(Collection);
//   //@ts-ignore
//   console.log(await Collection.find());
//   const data = await Collection.aggregate([
//     {
//       $match: {
//         "data.Vendor Name": "UNIPARTS INDIA LTD",
//       },
//     },
//     {
//       $lookup: {
//         from: "anish@gmail.com@vendorOpen",
//         localField: "data.Invoice Number",
//         foreignField: "data.Invoice Number",
//         as: "result",
//       },
//     },
//     {
//       $unwind: {
//         path: "$result",
//       },
//     },
//   ]);

//   console.log("DATA,", data);
//   return res.send({
//     message: "ok",
//   });
// });

//  test generate report
function removeCommas(value: any) {
  return value.replace(/,/g, "");
}
function getModelByString(str: any) {
  const yourModel = str;

  const yourSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    uniqueId: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed,
  });

  let Collection;
  try {
    Collection = mongoose.model(yourModel, yourSchema);
  } catch (error) {
    console.log(error);
  }

  return Collection;
}
app.post("/dynamic-report", async (req, res) => {
  const { vendorName } = req.body;
  console.log(vendorName);

  const Collection: any = getModelByString("anish@gmail.com@masterOpen");

  console.log(Collection);
  // console.log(await Collection.find());

  try {
    const data = await Collection.aggregate([
      {
        $match: {
          "data.Vendor Name": "UNIPARTS INDIA LTD",
        },
      },
      {
        $lookup: {
          from: "anish@gmail.com@vendorOpen",
          localField: "data.Invoice Number",
          foreignField: "data.Invoice Number",
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
        },
      },
    ]);

    for (let i = 0; i < data.length; i++) {
      const first = removeCommas(data[i].data["Closing Balance"]);
      const second = removeCommas(data[i].result.data["Closing Balance"]);
      const diff = +second - +first;
      const lastCollection = getModelByString("anish@gmail.com@complete");
    }

    return res.send({
      message: "ok",
      data: data,
    });
  } catch (error) {
    console.error("Error in aggregation:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
// const MONGO_URI: any = process.env.MONGO_URI;
const MONGO_URI: any = process.env.MONGO_LOCAL_URI;
console.log(process.env.NODE_ENV === "production", MONGO_URI);
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => console.log(`Server running at ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
