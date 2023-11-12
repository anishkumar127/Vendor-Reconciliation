import mongoose, { Schema } from "mongoose";

const soaSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    data: 
        {
            invoice_number: { type: String, required: true },
            document_no: { type: String, required: true },
            doc_date: { type: String, required: true },
            inv_date: { type: String, required: true },
            grn_no: { type: String, required: true },
            reference: { type: String, required: true },
            payment_doc: { type: String, required: true },
            cheque_rtgs_neft: { type: String, required: true },
            debit_amt_inr: { type: String, required: true },
            credit_amt_inr: { type: String, required: true },
            company_code: { type: String, required: true },
            due_date: { type: String, required: true },
            cur: { type: String, required: true },
        }
    ,
  },
  { timestamps: true }
);

export const Soa = mongoose.model("Soa", soaSchema);
