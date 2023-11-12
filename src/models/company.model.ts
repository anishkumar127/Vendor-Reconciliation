import mongoose, { Schema } from "mongoose";

export const companyOpenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: false },
    data: 
      {
        vendor: { type: String, required: true },
        vendor_name: { type: String, required: true },
        document_no: { type: String, required: true },
        doc_date: { type: String, required: true },
        due_date: { type: String, required: true },
        cur: { type: String, required: true },
        invoice_amount: { type: String, required: true },
        closing_balance: { type: String, required: true },
        invoice_number: { type: String, required: true },
      }
    ,
  },
  { timestamps: true }
);

export const CompanyOpen = mongoose.model("CompanyOpen", companyOpenSchema);
