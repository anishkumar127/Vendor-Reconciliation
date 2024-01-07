import mongoose, { Schema } from "mongoose";

export const RecentIdsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    masterId: { type: Schema.Types.Mixed, required: false, index: true },
    vendorId: { type: Schema.Types.Mixed, required: false, index: true },
    detailsId: { type: Schema.Types.Mixed, required: false, index: true },
    reportId: { type: Schema.Types.Mixed, required: false, index: true },
  },
  { timestamps: true }
);

export const RecentIds = mongoose.model("RecentId", RecentIdsSchema);
