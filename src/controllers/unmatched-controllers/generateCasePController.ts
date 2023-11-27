import { Request, Response } from "express";
import { CaseP } from "../../models/cases/case_p.model";
import fs from "fs";
import XLSX from "xlsx";
import path from "path";
export const generateCasePController = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  req: Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  res: Response
) => {
  try {
    const fullDetailsFile = await CaseP?.find();
    const data = fullDetailsFile?.map((item) => ({
      "Document Number": item?.mixed_data?.document_no || "",
      "Invoice Number": item?.mixed_data?.invoice_number || "",
      "Document Date": item?.mixed_data?.doc_date || "",
      "Invoice Date": item?.mixed_data?.inv_date || "",
      "GRN Number": item?.mixed_data?.grn_no || "",
      Reference: item?.mixed_data?.reference || "",
      "Payment Document": item?.mixed_data?.payment_doc || "",
      "Cheque/RTGS/NEFT": item?.mixed_data?.cheque_rtgs_neft || "",
      Currency: item?.mixed_data?.cur || "",
      "Debit Amount": item?.mixed_data?.debit_amount || "",
      "Credit Amount": item?.mixed_data?.credit_amount || "",
      "Debit Amount (INR)": item?.mixed_data?.debit_amt_inr || "",
      "Credit Amount (INR)": item?.mixed_data?.credit_amt_inr || "",
      "Company Code": item?.mixed_data?.company_code || "",
      "Due Date": item?.mixed_data?.due_date || "",
      "Token Number": item?.mixed_data?.token_number || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CaseP Data");

    const tempFilePath = path.join(
      __dirname,
      "../../../public/Case/CasePData.xlsx"
    );

    XLSX.writeFile(workbook, tempFilePath);

    res.download(tempFilePath, "CasePData.xlsx", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        return res.status(500).json({ error: "Failed to download Excel file" });
      }
      fs.unlink(tempFilePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting file:", unlinkErr);
        }
      });
    });
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return res.status(500).json({ error: "Failed to generate Excel file" });
  }
  // return res.json({ message:"downloading done!" });
  // return res.json({ extractedMasterData,extractedVendorData });
};
