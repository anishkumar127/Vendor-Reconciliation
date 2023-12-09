import mongoose from "mongoose";

export const yourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    uniqueId: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);
