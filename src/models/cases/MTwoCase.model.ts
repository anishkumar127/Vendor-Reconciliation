import mongoose from "mongoose";

const yourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uniqueId: { type: String, required: true },
    SNO: { type: Number },
    "Company Code": { type: String, required: false },
    "Vendor Name": { type: String, required: false },
    "Document Date": { type: String, required: false },
    "Invoice Number": { type: String, required: false },
    Difference: { type: String, required: false },
    "Closing Balance": { type: String },
  },
  { timestamps: true }
);

const MTwoCase = mongoose.model("MTwoCase", yourSchema);

export default MTwoCase;
