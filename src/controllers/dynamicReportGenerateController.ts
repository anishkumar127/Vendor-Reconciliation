import mongoose from "mongoose";
import { RecentIds } from "../models/mixed/RecentIds.model";
import { RequestHandler } from "express";
import { getUser } from "../services/auth";
import PCase from "../models/cases/PCase.model";
import KCase from "../models/cases/KCase.model";

// Annexure FORMAT
const Annexure: any[] = ["AnnexureP", "AnnexureK"];

// IN AMOUNT NUMBER HAS THE COMMA (,) REMOVING.
function removeCommas(value: any) {
  return value.replace(/,/g, "");
}

// REUSABLE MODEL SCHEMA AND MODEL NAME.
async function getModelByString(str: any) {
  const yourModel = str;

  // CACHED MONGOOSE MODEL RETURN.
  if (mongoose.models[yourModel]) {
    return mongoose.model(yourModel);
  }

  // IF NOT CACHED THEN MAKE IT NEW SCHEMA.
  const yourSchema = await new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      fileName: { type: String, required: true },
      uniqueId: { type: String, required: true },
      data: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
  );
  return mongoose.model(yourModel, yourSchema);
}

export const dynamicReportGenerateController: RequestHandler = async (
  req,
  res
) => {
  const { vendorName, documentType } = req.body;
  if (!vendorName)
    return res.status(404).json({ error: "missing required fields!" });

  // return res.send(documentType);
  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const Collection: any = await getModelByString(`${email}@masterOpen`);

  const vendorCollection: any = await getModelByString(`${email}@vendorOpen`);

  console.log({ Collection });
  console.log({ vendorCollection });

  if (!Collection || !vendorCollection)
    return res.status(500).json({ error: "schema error!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(4040).json({ error: "no recent ids present." });

  console.log({ _id });

  console.log({ recentIds });

  try {
    const data = await Collection.aggregate([
      {
        $match: {
          "data.Vendor Name": vendorName,
          uniqueId: recentIds?.masterId,
        },
      },
      {
        $lookup: {
          from: vendorCollection.collection.name,
          localField: "data.Invoice Number",
          foreignField: "data.Invoice Number",
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
        },
      },
      {
        $match: {
          "result.uniqueId": recentIds?.vendorId,
        },
      },
    ]);

    if (!data) return res.status(500).json({ error: "server query error!" });

    const matchPCaseData: any = [];

    const matchKCaseData: any = [];
    let isPCaseTrue: boolean = false;
    let isKCaseTrue: boolean = false;

    for (let i = 0; i < data?.length; i++) {
      const first = removeCommas(data[i]?.data["Closing Balance"]);
      const second = removeCommas(data[i]?.result?.data["Closing Balance"]);
      // FIND THE DIFFERENCE.
      const diff = +second - +first;
      if (diff && diff > 1) {
        // IF DIFFERENCE GREATER THEN 1.

        // GET 3RD COLLECTION
        const lastCollection = await getModelByString(`${email}@complete`);
        if (lastCollection) {
          // SEARCH THE INVOICE NUMBER WHICH IS FIND IN 2ND COLLECTION
          const invoiceNumber = data[i]?.result?.data["Invoice Number"];
          // IF THAT'S 2ND COLLECTION INVOICE NUMBER PRESENT INTO 3RD COLLECTION. GET THAT'S INVOICE NUMBER DATA.
          const lastData = await (lastCollection as mongoose.Model<any>).find({
            "data.Invoice Number": invoiceNumber,
            uniqueId: recentIds?.detailsId,
          });

          // IF DATA THEN GET INTO 3RD COLLECTION DOCUMENT NUMBER. AND CHECK DOCUMENT NUMBER TYPE. IF THAT'S START OR END OR CONTAINS WITH PID OR TDS THEN THAT'S STORE INTO DIFFERENT COLLECTION.
          for (let z = 0; z < lastData?.length; z++) {
            //  MATCHING THE DOCUMENT TYPE.
            const documentNumber = lastData[z]?.data["Document Number"];
            if (
              documentNumber &&
              (documentNumber.startsWith("PID") ||
                documentNumber.endsWith("PID") ||
                documentNumber.includes("PID"))
            ) {
              isPCaseTrue = true;
              matchPCaseData.push(lastData[i]);
            } else if (
              documentNumber &&
              (documentNumber.startsWith("TDS") ||
                documentNumber.endsWith("TDS") ||
                documentNumber.includes("TDS"))
            ) {
              isKCaseTrue = true;
              console.log("K", lastData[i]);
              matchKCaseData.push(lastData[i]);
            }
          }
        }
      }
    }

    // TEST P CASE - IF P CASE SUCCESS.
    const pCaseDataFlat = await matchPCaseData.flat();

    // TEST K CASE - IF K CASE SUCCESS.
    const kCaseDataFlat = await matchKCaseData.flat();

    // STORE INTO THE P CASE COLLECTION
    if (isPCaseTrue) {
      let idx: number = 1;
      for (const item of pCaseDataFlat) {
        const pCaseInstance = await new PCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item.data["Company Code"],
          "Document Number": item.data["Document Number"],
          "Document Date": item.data["Document Date"],
          "Invoice Number": item.data["Invoice Number"],
          "Grn Number": item.data["Grn Number"],
          "Debit Amount(INR)": item.data["Debit Amount(INR)"],
        });

        try {
          await pCaseInstance.save();
        } catch (error) {
          console.error(`Error saving data: ${error}`);
        }
      }
    }

    // STORE INTO K CASE COLLECTION.
    if (isKCaseTrue) {
      let idx: number = 1;
      for (const item of kCaseDataFlat) {
        const kCaseInstance = await new KCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item.data["Company Code"],
          "Document Number": item.data["Document Number"],
          "Document Date": item.data["Document Date"],
          "Invoice Number": item.data["Invoice Number"],
          "Grn Number": item.data["Grn Number"],
          "Debit Amount(INR)": item.data["Debit Amount(INR)"],
        });

        try {
          await kCaseInstance.save();
        } catch (error) {
          console.error(`Error saving data: ${error}`);
        }
      }
    }

    return res.status(200).json({
      message: "ok",
      // data: ,
      success: "ok",
    });
  } catch (error) {
    console.error("Error in aggregation:", error);
    return res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};
