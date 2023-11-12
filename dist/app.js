"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const multer_1 = __importDefault(require("multer"));
const xlsx_1 = __importDefault(require("xlsx"));
const morgan_1 = __importDefault(require("morgan"));
const database_1 = require("./config/database");
// <------------------------- MODELS IMPORT  -------------------->
const user_model_1 = require("./models/user.model");
const company_model_1 = require("./models/company.model");
const vendor_model_1 = require("./models/vendor.model");
const soa_model_1 = require("./models/soa.model");
// <------------------------- ROUTES IMPORT  -------------------->
const companyOpen_route_1 = __importDefault(require("./routes/companyOpen.route"));
const vendorOpen_route_1 = __importDefault(require("./routes/vendorOpen.route"));
const soaDetails_route_1 = __importDefault(require("./routes/soaDetails.route"));
// <------------------------- USER ROUTES IMPORT  -------------------->
const userSignUpRoutes_1 = __importDefault(require("./routes/user/userSignUpRoutes"));
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;
// <---------------------- MIDDLEWARES -------------------->
// alternative of bodyParse.
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
// <------------------------- DATABASE CONNECT -------------------->
try {
    (0, database_1.mongoConnect)();
}
catch (error) {
    console.log("DB CONNECT ERROR ", error);
}
// <------------------------- MULTER -------------------->
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
// <------------------------- ROUTES -------------------->
// upload.
app.post("/upload", upload.single("file"), (req, res) => {
    const workbook = xlsx_1.default.read(req?.file?.buffer, { type: "buffer" });
    let sheetNameArr = [];
    for (let i = 0; i < workbook?.SheetNames?.length; i++) {
        if (workbook?.SheetNames[i] === "CNHi Open") {
            const sheetName = workbook?.SheetNames[i];
            const sheet = workbook?.Sheets[sheetName];
            const data = xlsx_1.default.utils.sheet_to_json(sheet);
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
        const workbook = xlsx_1.default.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[21];
        console.log(workbook.SheetNames[21]);
        const x = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheetName]);
        const excelData = x.map((item) => {
            const transformedItem = {};
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
        let model = "companyOpen";
        switch (fileType) {
            case "companyOpen":
                model = company_model_1.CompanyOpen;
                break;
            case "vendorOpen":
                model = vendor_model_1.VendorOpen;
                break;
            case "soa":
                model = soa_model_1.Soa;
                break;
            default:
                return res.status(400).json({ error: "Invalid fileType" });
        }
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        console.log("excelData", excelData);
        const fileData = new model({
            user: user._id,
            filename: originalname,
            data: excelData,
        });
        try {
            console.log(fileData);
            await fileData.validate();
        }
        catch (validationError) {
            console.error(validationError);
            res
                .status(400)
                .json({ error: "Validation Error", details: validationError.errors });
            return;
        }
        await fileData.save();
        res.status(201).json({ message: "File uploaded successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// get file.
app.get("/retrieve/:fileType", async (req, res) => {
    try {
        const fileType = req.params.fileType;
        let model = "companyOpen";
        switch (fileType) {
            case "companyOpen":
                model = company_model_1.CompanyOpen;
                break;
            case "vendorOpen":
                model = vendor_model_1.VendorOpen;
                break;
            case "soa":
                model = soa_model_1.Soa;
                break;
            default:
                return res.status(400).json({ error: "Invalid fileType" });
        }
        const data = await model.find();
        if (!data) {
            return res.status(404).json({ msg: "not found!" });
        }
        return res.status(200).json(data);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Specific Upload File
// <------------------------- ROUTES MIDDLEWARE  -------------------->
// Company Open
app.use("/api", companyOpen_route_1.default);
// Vendor Open
app.use("/api", vendorOpen_route_1.default);
// All Details SOA.
app.use("/api", soaDetails_route_1.default);
// Create User
app.use("/api/user", userSignUpRoutes_1.default);
app.listen(PORT, () => console.log(`server running at ${PORT}`));
//# sourceMappingURL=app.js.map