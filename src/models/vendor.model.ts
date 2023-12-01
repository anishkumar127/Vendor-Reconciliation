import mongoose, { Schema } from "mongoose";
const vendorOpenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    data: {
      business_partner: { type: String, required: true },
      business_partner_name: { type: String, required: true },
      invoice_number: { type: String, required: true },
      document_number: { type: String, required: true },
      document_date: { type: String, required: true },
      due_date: { type: String, required: true },
      currency: { type: String, required: true },
      invoice_amount: { type: String, required: true },
      closing_balance: { type: String, required: true },
    },
    mixed_data: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);
export const VendorOpenOLD = mongoose.model("VendorOpen", vendorOpenSchema);
