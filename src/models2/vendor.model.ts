import mongoose, { Schema } from "mongoose";

const vendorOpen = new Schema(
  {
    "Business Partner": {
      type: String,
      required: true,
    },
    "Business Partner Name": {
      type: String,
      required: true,
    },
    "Customer Invoice Number": {
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
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const VompanyOpen = mongoose.model("vompanyOpen", vendorOpen);

export default VompanyOpen;
