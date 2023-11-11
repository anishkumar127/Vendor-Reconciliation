import express, { Request, Response } from "express";
const app = express();
import multer from "multer";
import xlsx from "xlsx";
import { mongoConnect } from "./database/database";
import { User } from "./models/user.model";
import { CompanyOpen, companyOpenSchema } from "./models/company.model";
import { VendorOpen } from "./models/vendor.model";
import { Soa } from "./models/soa.model";
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
try {
  mongoConnect();
} catch (error) {
  console.log(error);
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// upload file type.
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
        if (item.hasOwnProperty(key)) {
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
    if(!data){
      return  res.status(404).json({msg:"not found!"})
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create User
app.post("/createUser", async (req, res) => {
  try {
    const { username, email, fullname, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or email already exists" });
    }

    // Create a new user
    const newUser = new User({
      username,
      email,
      fullname,
      password,
    });

    await newUser.save();
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// upload.
app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  const workbook = xlsx.read(req?.file?.buffer, { type: "buffer" });
  let sheetNameArr: any[] = [];
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

app.listen(3000, () => console.log("running at 3000"));
