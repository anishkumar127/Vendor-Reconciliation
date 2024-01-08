import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import hpp from "hpp";
const app = express();

dotenv.config();

// <------------------------- MODELS IMPORT  -------------------->
// <------------------------- ROUTES IMPORT  -------------------->

import completeDetailsRoute from "./routes/completeDetailsRoutes";
import dynamicReportGenerateRoute from "./routes/dynamicReportGenerateRoutes";
import masterRoutes from "./routes/masterRoutes";
import vendorOpenRoute from "./routes/vendorOpenRoutes";

import mappingFileRoute from "./routes/mapping-route/mappingFileRoutes";
import generateReportRoutes from "./routes/unmatched/generateReportRoutes";
// <------------------------- USER ROUTES IMPORT  -------------------->
import userSignUpRoutes from "./routes/user/userRoutes";

import dynamicReportV2Route from "./routes/v2-route/v2RouteReport";

// <------------------------- UNMATCHED ROUTES IMPORT  -------------------->

// <------------------------- MAPPING ROUTES IMPORT [CONSTANTS] -------------------->
import constantsRoute from "./routes/constants-route/constantsRoute";

import mongoose from "mongoose";

const PORT = process.env.PORT ?? 3000;
// <---------------------- MIDDLEWARES -------------------->
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());
app.use(morgan("dev"));
// app.use(cors({
//   origin:"http://localhost:5173",
//   credentials:true
// }));
// app.use(cors());
app.use(cors({ origin: "*" }));
app.use(helmet());
// app.use(mongoSanitize());

// PREVENT PARAMETER POLLUTION
app.use(hpp());

// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   console.error(err.stack);
//   return res
//     .status(500)
//     .json({ error: err.stack, message: "Something went wrong!" });
// });
// app.use((err, req, res, next) => {
//   console.error(err);

//   // Check if the error is a Mongoose CastError
//   if (err instanceof mongoose.Error.CastError) {
//     return res
//       .status(400)
//       .json({ error: "Invalid data provided for the request." });
//   }

//   // Handle other types of errors or log them
//   res.status(500).json({ error: "Something went wrong!" });
// });

// <------------------------- ROUTES MIDDLEWARE  -------------------->

// Create User
app.use("/api/user", userSignUpRoutes);

// UNMATCHED

// Constants
app.use("/api", constantsRoute);

// FILE UPLOAD ROUTES. AND ALSO GET AND POST ETC
app.use("/api/master", masterRoutes);
app.use("/api/vendor", vendorOpenRoute);
app.use("/api/complete", completeDetailsRoute);

app.use("/api/report", dynamicReportGenerateRoute);
app.use("/api/v2/report", dynamicReportV2Route);

app.use("/api/generate-report", generateReportRoutes);

app.use("/api/mapping", mappingFileRoute);
// <------------------------- DATABASE CONNECT -------------------->

const MONGO_URI: any = process.env.MONGO_URI;
// const MONGO_URI: any = process.env.MONGO_LOCAL_URI;
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
