import mongoose from "mongoose";

const yourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // uniqueId: { type: String, required: true },
    "Due Date": { type: String, required: true },
    "Company Code": { type: String, required: true },
    "Credit Amount(INR)": { type: String, required: true },
    "Debit Amount(INR)": { type: String, required: true },
    "Cheque Rtgs Neft": { type: String, required: true },
    "Payment Document": { type: String, required: true },
    Reference: { type: String, required: true },
    "Grn Number": { type: String, required: true },
    "Invoice Date": { type: String, required: true },
    "Document Date": { type: String, required: true },
    "Document Number": { type: String, required: true },
    "Invoice Number": { type: String, required: true },
  },
  { timestamps: true }
);

const completeMapping = mongoose.model("completemapping", yourSchema);

export default completeMapping;
