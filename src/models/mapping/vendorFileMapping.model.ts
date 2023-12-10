import mongoose from "mongoose";

const yourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uniqueId: { type: String, required: true },
    "Business Partner": { type: String, required: true },
    "Business Partner Name": { type: String, required: true },
    "Closing Balance": { type: String, required: true },
    "Invoice Amount": { type: String, required: true },
    Currency: { type: String, required: true },
    "Due Date": { type: String, required: true },
    "Document Date": { type: String, required: true },
    "Document Number": { type: String, required: true },
    "Invoice Number": { type: String, required: true },
  },
  { timestamps: true }
);

const vendorMapping = mongoose.model("vendormapping", yourSchema);

export default vendorMapping;
