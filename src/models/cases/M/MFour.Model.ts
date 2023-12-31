import mongoose from "mongoose";

const yourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uniqueId: { type: String, required: true, index: true },
    SNO: { type: Number },
    "Company Code": { type: String, required: false },
    // "Vendor Code": { type: String, required: false },
    Year: { type: String, required: false },
    "Document Date": { type: String, required: false },
    "Invoice Number": { type: String, required: false },
    "Debit Amount(INR)": { type: String },
    "Invoice Amount": { type: String, required: false },
    "Closing Balance": { type: String },
    "Credit Amount(INR)": { type: String },
  },
  { timestamps: true }
);

const MFourCase = mongoose.model("MFourCase", yourSchema);

export default MFourCase;
