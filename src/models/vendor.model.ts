import mongoose, { Schema } from "mongoose";
const vendorOpenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    data: {
      business_partner: { type: String, required: true },
      business_partner_name: { type: String, required: true },
      customer_invoice_number: { type: String, required: true },
      document_no: { type: String, required: true },
      doc_date: { type: String, required: true },
      due_date: { type: String, required: true },
      currency: { type: String, required: true },
      invoice_amount: { type: String, required: true },
      closing_balance: { type: String, required: true },
    },
  },
  { timestamps: true }
);
export const VendorOpen = mongoose.model("VendorOpen", vendorOpenSchema);
