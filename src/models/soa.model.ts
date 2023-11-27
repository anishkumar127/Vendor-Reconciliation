import mongoose, { Schema } from "mongoose";

const soaSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    data: {
      invoice_number: { type: String, required: true },
      document_number: { type: String, required: true },
      document_date: { type: String, required: true },
      invoice_date: { type: String, required: true },
      grn_no: { type: String, required: true },
      reference: { type: String, required: true },
      payment_document: { type: String, required: true },
      cheque_rtgs_neft: { type: String, required: true },
      debit_amt_inr: { type: String, required: true },
      credit_amt_inr: { type: String, required: true },
      company_code: { type: String, required: true },
      due_date: { type: String, required: true },
      currency: { type: String, required: true },
    },
    mixed_data: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const Soa = mongoose.model("Soa", soaSchema);
