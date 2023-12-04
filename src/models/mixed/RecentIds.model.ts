import mongoose, { Schema } from "mongoose";

export const RecentIdsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    masterId: { type: Schema.Types.ObjectId, required: false },
    vendorId: { type: Schema.Types.ObjectId, required: false },
    detailsId: { type: Schema.Types.ObjectId, required: false },
  },
  { timestamps: true }
);

export const RecentIds = mongoose.model("RecentId", RecentIdsSchema);
