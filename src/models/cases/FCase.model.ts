import mongoose from "mongoose";

const yourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uniqueId: { type: String, required: true },
    SNO: { type: Number },
    "Company Code": { type: String, required: false },
    "Vendor Code": { type: String, required: false },
    Year: { type: String, required: false },
    "Document Number": { type: String, required: false },
    "Document Date": { type: String, required: false },
    "Invoice Number": { type: String, required: false },
    "Invoice Date": { type: String, required: false },
    "Grn Number": { type: String },
    "Invoice Amount": { type: String, required: false },
    "Payment Document": { type: String, required: false },
    "Payment Date": { type: String, required: false },
    "Debit Amount(INR)": { type: String },
    "TDS Amount": { type: String },
    "O/s as per": { type: String },
    "Closing Balance": { type: String },
    "Credit Amount(INR)": { type: String },
  },
  { timestamps: true }
);

const FCase = mongoose.model("FCase", yourSchema);

export default FCase;
