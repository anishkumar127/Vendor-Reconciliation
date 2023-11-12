import mongoose, { Schema } from "mongoose";

const soa = new Schema(
  {
    "Business Partner": {
      type: String,
      required: true,
    },
    "Business Partner Name": {
      type: String,
      required: true,
    },
    "Supplier Invoice": {
      type: String,
      required: true,
    },
    "Document No": {
      type: String,
      required: true,
    },
    "Doc Date": {
      type: String,
      required: true,
    },
    "Inv Date": {
      type: String,
      required: true,
    },
    "GRN No": {
      type: String,
      required: true,
    },
    Reference: {
      type: String,
      required: true,
    },
    "Payment Doc": {
      type: String,
      required: true,
    },
    "Cheque/RTGS/NEFT": {
      type: String,
      required: true,
    },
    "Debit Amt (INR)": {
      type: String,
      required: true,
    },
    "Credit Amt(INR)": {
      type: String,
      required: true,
    },
    "Company Code": {
      type: String,
      required: true,
    },
    "Due Date": {
      type: String,
      required: true,
    },
    Currency: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Soa = mongoose.model("soa", soa);

// export default Soa;
