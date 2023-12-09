import mongoose from "mongoose";
import { RecentIds } from "../models/mixed/RecentIds.model";
import { RequestHandler } from "express";
import { getUser } from "../services/auth";
import PCase from "../models/cases/PCase.model";

// IN AMOUNT NUMBER HAS THE COMMA (,) REMOVING.
function removeCommas(value: any) {
  return value.replace(/,/g, "");
}

// REUSABLE MODEL SCHEMA AND MODEL NAME.
function getModelByString(str: any) {
  const yourModel = str;

  const yourSchema = new mongoose.Schema(
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

  let Collection;
  try {
    Collection = mongoose.model(yourModel, yourSchema);
  } catch (error) {
    console.log(error);
  }

  return Collection;
}

export const dynamicReportGenerateController: RequestHandler = async (
  req,
  res
) => {
  const { vendorName } = req.body;
  if (!vendorName)
    return res.status(404).json({ error: "missing required fields!" });

  console.log({ vendorName });

  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  console.log({ recentIds });
  console.log("masterID", recentIds?.masterId, "vendorId", recentIds?.vendorId);

  const Collection: any = await getModelByString(`${email}@masterOpen`);

  const vendorCollection: any = await getModelByString(`${email}@vendorOpen`);

  if (!Collection || vendorCollection)
    return res.status(500).json({ error: "schema error!" });

  console.log(recentIds?.masterId);
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

    console.log("COMES", { data });
    if (!data) return res.status(500).json({ error: "server query error!" });

    const matchedData: any = [];
    for (let i = 0; i < data?.length; i++) {
      const first = removeCommas(data[i]?.data["Closing Balance"]);
      const second = removeCommas(data[i]?.result?.data["Closing Balance"]);
      const diff = +second - +first;
      console.log({ diff });
      if (diff) {
        const lastCollection = await getModelByString(`${email}@complete`);

        const invoiceNumber = data[i]?.result?.data["Invoice Number"];
        console.log(invoiceNumber);
        const lastData = await lastCollection?.find({
          "data.Invoice Number": invoiceNumber,
          uniqueId: recentIds?.detailsId,
        });
        console.log("MATCHED", lastData);
        if (lastData) {
          // matchedData.push(lastData);
          matchedData.push(lastData.map((item) => item.data));
        }
      }
    }

    //  GENERATE P CASE.
    const flattenedData = matchedData.flat();

    let idx: number = 0;
    for (const item of flattenedData) {
      const pCaseInstance = new PCase({
        user: new mongoose.Types.ObjectId(_id),
        SNO: idx++,
        "Company Code": item["Company Code"],
        "Document Number": item["Document Number"],
        "Document Date": item["Document Date"],
        "Invoice Number": item["Invoice Number"],
        "Grn Number": item["Grn Number"],
        "Debit Amount(INR)": item["Debit Amount(INR)"],
      });

      try {
        const savedInstance = await pCaseInstance.save();
        console.log(`Data saved: ${savedInstance}`);
      } catch (error) {
        console.error(`Error saving data: ${error}`);
      }
    }
    return res.status(200).json({
      message: "ok",
      data: flattenedData,
      success: "ok",
    });
  } catch (error) {
    console.error("Error in aggregation:", error);
    return res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};
