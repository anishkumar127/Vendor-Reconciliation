import mongoose, { Schema } from "mongoose";

const pSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: false },
    data: {
      invoice_number: { type: String, required: false },
      document_no: { type: String, required: false },
      doc_date: { type: String, required: false },
      invoice_date: { type: String, required: false },
      invoice_amount: { type: String, required: false },
      tds_amount: { type: String, required: false },
      grn_no: { type: String, required: false },
      debit_note_amount: { type: String, required: false },
      company_code: { type: String, required: false },
      vendor_code: { type: String, required: false },
      year: { type: String, required: false },
    },
    mixed_data: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const CaseP = mongoose.model("P", pSchema);
