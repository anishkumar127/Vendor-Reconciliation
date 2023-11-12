import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI: any = process.env.MONGO_URI;
export const mongoConnect = () => {
  try {
    const connection = mongoose.connect(MONGO_URI);
    connection.then(() => console.log("succced"));
  } catch (error) {
    console.log("mongodb error", error);
  }
};
