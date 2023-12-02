import mongoose, { Schema } from "mongoose";

export const CompleteDetailsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    uniqueId: { type: String, required: true },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

export const CompleteDetails = mongoose.model(
  "completeDetails",
  CompleteDetailsSchema
);
