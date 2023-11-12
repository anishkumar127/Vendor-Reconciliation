import mongoose, { Schema } from "mongoose";

const companyOpen = new Schema(
  {
    Vendor: {
      type: String,
      required: true,
    },
    "Vendor Name": {
      type: String,
      required: true,
    },
    "Document No": {
      type: String,
      required: true,
    },
    "Doc.Date": {
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
    "Invoice Amount": {
      type: String,
      required: true,
    },
    "Closing Balance": {
      type: String,
      required: true,
    },
    "Invoice Number": {
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

export const CompanyOpen = mongoose.model("companyOpen", companyOpen);

// export default CompanyOpen;
