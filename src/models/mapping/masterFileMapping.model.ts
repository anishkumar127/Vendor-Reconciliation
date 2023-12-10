import mongoose from "mongoose";

const yourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // uniqueId: { type: String, required: true },
    Vendor: { type: String, required: true },
    "Vendor Name": { type: String, required: true },
    "Document Number": { type: String, required: true },
    "Invoice Number": { type: String, required: true },
    "Closing Balance": { type: String, required: true },
    "Invoice Amount": { type: String, required: true },
    Currency: { type: String, required: true },
    "Due Date": { type: String, required: true },
    "Document Date": { type: String, required: true },
  },
  { timestamps: true }
);

const masterMapping = mongoose.model("mastermapping", yourSchema);

export default masterMapping;
