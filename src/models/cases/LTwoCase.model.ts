import mongoose from "mongoose";

const yourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uniqueId: { type: String, required: true, index: true },
    SNO: { type: Number },
    "Company Code": { type: String, required: false },
    "Vendor Code": { type: String, required: false },
    Year: { type: String, required: false },
    "Document Number": { type: String, required: false },
    "Document Date": { type: String, required: false },
    "Invoice Number": { type: String, required: false },
    "Invoice Amount": { type: String, required: false },
    "Closing Balance": { type: String },
    "Credit Amount(INR)": { type: String },
    "Debit Amount(INR)": { type: String },
  },
  { timestamps: true }
);

const LTwoCase = mongoose.model("LTwoCase", yourSchema);

export default LTwoCase;
