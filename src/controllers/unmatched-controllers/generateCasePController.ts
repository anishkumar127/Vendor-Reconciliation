import { RequestHandler } from "express";
import PCase from "../../models/cases/PCase.model";
import { getUser } from "../../services/auth";
import { RecentIds } from "../../models/mixed/RecentIds.model";
import KCase from "../../models/cases/KCase.model";
import LCase from "../../models/cases/LCase.model";
import MCase from "../../models/cases/MCase.model";
// export const generateCasePController = async (
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   req: Request,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   res: Response
// ) => {
//   try {
//     const fullDetailsFile = await CaseP?.find();
//     const data = fullDetailsFile?.map((item) => ({
//       "Document Number": item?.mixed_data?.document_no || "",
//       "Invoice Number": item?.mixed_data?.invoice_number || "",
//       "Document Date": item?.mixed_data?.doc_date || "",
//       "Invoice Date": item?.mixed_data?.inv_date || "",
//       "GRN Number": item?.mixed_data?.grn_no || "",
//       Reference: item?.mixed_data?.reference || "",
//       "Payment Document": item?.mixed_data?.payment_doc || "",
//       "Cheque/RTGS/NEFT": item?.mixed_data?.cheque_rtgs_neft || "",
//       Currency: item?.mixed_data?.cur || "",
//       "Debit Amount": item?.mixed_data?.debit_amount || "",
//       "Credit Amount": item?.mixed_data?.credit_amount || "",
//       "Debit Amount (INR)": item?.mixed_data?.debit_amt_inr || "",
//       "Credit Amount (INR)": item?.mixed_data?.credit_amt_inr || "",
//       "Company Code": item?.mixed_data?.company_code || "",
//       "Due Date": item?.mixed_data?.due_date || "",
//       "Token Number": item?.mixed_data?.token_number || "",
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "CaseP Data");

//     const tempFilePath = path.join(
//       __dirname,
//       "../../../public/Case/CasePData.xlsx"
//     );

//     XLSX.writeFile(workbook, tempFilePath);

//     res.download(tempFilePath, "CasePData.xlsx", (err) => {
//       if (err) {
//         console.error("Error downloading file:", err);
//         return res.status(500).json({ error: "Failed to download Excel file" });
//       }
//       fs.unlink(tempFilePath, (unlinkErr) => {
//         if (unlinkErr) {
//           console.error("Error deleting file:", unlinkErr);
//         }
//       });
//     });
//   } catch (error) {
//     console.error("Error generating Excel file:", error);
//     return res.status(500).json({ error: "Failed to generate Excel file" });
//   }
//   // return res.json({ message:"downloading done!" });
//   // return res.json({ extractedMasterData,extractedVendorData });
// };

// NEW P CASE GENERATOR.

//  P CASE
export const getPCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });
  console.log(recentIds.masterId);
  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const pCaseReport = await PCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: pCaseReport });
  } catch (error) {
    console.error("Error retrieving PCase report:", error);
    return res.status(500).json({ error: "Failed to retrieve PCase report" });
  }
};

//  K CASE

export const getKCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });
  console.log(recentIds.masterId);
  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const kCaseReport = await KCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
      // 'Debit Amount(INR)': { $ne: null, $ne: undefined, $ne: "" }
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: kCaseReport });
  } catch (error) {
    console.error("Error retrieving PCase report:", error);
    return res.status(500).json({ error: "Failed to retrieve PCase report" });
  }
};

// L CASE

export const getLCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });
  console.log(recentIds.masterId);
  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const LCaseReport = await LCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: LCaseReport });
  } catch (error) {
    console.error("Error retrieving LCase report:", error);
    return res.status(500).json({ error: "Failed to retrieve LCase report" });
  }
};

// M CASE

export const getMCaseGeneratedReport: RequestHandler = async (req, res) => {
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });
  console.log(recentIds.masterId);
  try {
    // const pCaseReport = await PCase.find({ user: _id ,})
    //   .sort({ createdAt: -1 })
    //   .limit(1)
    //   .select({ updatedAt: 0, createdAt: 0, user: 0, _id: 0, __v: 0 });

    // WITHOUT SORTING THE BASED ON RECENT MASTER ID THE RECENT REPORT DOWNLOAD.
    const mCaseReport = await MCase.find({
      user: _id,
      uniqueId: recentIds?.masterId,
    }).select({
      updatedAt: 0,
      createdAt: 0,
      user: 0,
      _id: 0,
      __v: 0,
      uniqueId: 0,
    });

    return res.status(200).json({ data: mCaseReport });
  } catch (error) {
    console.error("Error retrieving MCase report:", error);
    return res.status(500).json({ error: "Failed to retrieve MCase report" });
  }
};
