import mongoose, { Schema } from "mongoose";

export const companyOpenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: false },
    data: {
      vendor: { type: String, required: true },
      vendor_name: { type: String, required: true },
      document_number: { type: String, required: true },
      document_date: { type: String, required: true },
      due_date: { type: String, required: true },
      currency: { type: String, required: true },
      invoice_amount: { type: String, required: true },
      closing_balance: { type: String, required: true },
      invoice_number: { type: String, required: true },
    },
    unmatched: {
      type: Schema.Types.Mixed,
    },
    mixed_data: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const CompanyOpen = mongoose.model("CompanyOpen", companyOpenSchema);
