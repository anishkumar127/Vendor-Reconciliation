import mongoose from "mongoose";
import { RecentIds } from "../models/mixed/RecentIds.model";
import { RequestHandler } from "express";
import { getUser } from "../services/auth";
import PCase from "../models/cases/PCase.model";
import KCase from "../models/cases/KCase.model";

// Annexure FORMAT
// const Annexure: any[] = ["AnnexureP", "AnnexureK"];

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
  // const lastCollection: any = await getModelByString(`${email}@complete`);

  console.log({ Collection });
  console.log({ vendorCollection });

  if (!Collection || !vendorCollection)
    return res.status(500).json({ error: "schema error!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  console.log({ _id });

  console.log({ recentIds });

  try {
    // const data = await Collection.aggregate([
    //   {
    //     $match: {
    //       "data.Vendor Name": vendorName,
    //       uniqueId: recentIds?.masterId,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: vendorCollection.collection.name,
    //       localField: "data.Invoice Number",
    //       foreignField: "data.Invoice Number",
    //       as: "result",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$result",
    //     },
    //   },
    //   {
    //     $match: {
    //       "result.uniqueId": recentIds?.vendorId,
    //     },
    //   },
    // ]);

    // working state
    // const data = await Collection.aggregate([
    //   {
    //     $match: {
    //       "data.Vendor Name": vendorName,
    //       uniqueId: recentIds?.masterId,
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: vendorCollection.collection.name,
    //       localField: "data.Invoice Number",
    //       foreignField: "data.Invoice Number",
    //       as: "result",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$result",
    //     },
    //   },
    //   {
    //     $match: {
    //       "result.uniqueId": recentIds?.vendorId,
    //     },
    //   },
    //   {
    //     $project: {
    //       data: 1,
    //       result: 1,
    //       first: {
    //         $toDouble: {
    //           $replaceAll: {
    //             input: "$data.Closing Balance",
    //             find: ",",
    //             replacement: "",
    //           },
    //         },
    //       },
    //       second: {
    //         $toDouble: {
    //           $replaceAll: {
    //             input: "$result.data.Closing Balance",
    //             find: ",",
    //             replacement: "",
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $project: {
    //       data: 1,
    //       result: 1,
    //       diff: { $subtract: ["$second", "$first"] },
    //     },
    //   },
    //   {
    //     $match: {
    //       diff: { $gt: 1 },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: lastCollection.collection.name,
    //       localField: "data.Invoice Number",
    //       foreignField: "data.Invoice Number",
    //       as: "finalresult",
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: "$finalresult",
    //     },
    //   },
    //   {
    //     $match: {
    //       "finalresult.uniqueId": recentIds?.detailsId,
    //     },
    //   },
    // ]);

    // test 2
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
      {
        $project: {
          data: 1,
          result: 1,
          first: {
            $toDouble: {
              $replaceAll: {
                input: "$data.Closing Balance",
                find: ",",
                replacement: "",
              },
            },
          },
          second: {
            $toDouble: {
              $replaceAll: {
                input: "$result.data.Closing Balance",
                find: ",",
                replacement: "",
              },
            },
          },
        },
      },
      {
        $project: {
          data: 1,
          result: 1,
          diff: { $subtract: ["$second", "$first"] },
        },
      },
      {
        $match: {
          diff: { $gt: 1 },
        },
      },
      // {
      //   $lookup: {
      //     from: lastCollection.collection.name,
      //     localField: "data.Invoice Number",
      //     foreignField: "data.Invoice Number",
      //     as: "finalresult",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$finalresult",
      //   },
      // },
      // {
      //   $match: {
      //     "finalresult.uniqueId": recentIds?.detailsId,
      //   },
      // },
    ]);

    if (!data) return res.status(500).json({ error: "server query error!" });

    const matchPCaseData: any = [];

    const matchKCaseData: any = [];
    let isPCaseTrue: boolean = false;
    let isKCaseTrue: boolean = false;

    for (let i = 0; i < data?.length; i++) {
      const lastCollection = await getModelByString(`${email}@complete`);
      if (lastCollection) {
        const invoiceNumber = data[i]?.result?.data["Invoice Number"];
        const escapedInvoiceNumber = invoiceNumber.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        // console.log(invoiceNumber, "+", escapedInvoiceNumber);
        const regex = new RegExp(escapedInvoiceNumber, "i");
        const lastData = await (lastCollection as mongoose.Model<any>).find({
          "data.Invoice Number": { $regex: regex },
          uniqueId: recentIds?.detailsId,
        });

        // res.send(lastData);
        for (let z = 0; z < lastData?.length; z++) {
          // console.log(lastData[z]?.data["Document Number"]);
          const documentNumber = lastData[z]?.data["Document Number"];
          if (
            documentNumber &&
            (documentNumber.startsWith("PID") ||
              documentNumber.endsWith("PID") ||
              documentNumber.includes("PID"))
          ) {
            isPCaseTrue = true;
            // console.log(lastData[i]);
            matchPCaseData.push(lastData[z]);
          } else if (
            documentNumber &&
            (documentNumber.startsWith("TDS") ||
              documentNumber.endsWith("TDS") ||
              documentNumber.includes("TDS"))
          ) {
            isKCaseTrue = true;
            matchKCaseData.push(lastData[z]);
          }
        }
      }
    }

    // data?.forEach(async (item: any) => {
    //   try {
    //     const lastCollection = await getModelByString(`${email}@complete`);

    //     if (lastCollection) {
    //       console.log("HI1");
    //       const invoiceNumber = item?.result?.data["Invoice Number"];

    //       if (invoiceNumber) {
    //         console.log("HI2");

    //         const escapedInvoiceNumber = invoiceNumber.replace(
    //           /[.*+?^${}()|[\]\\]/g,
    //           "\\$&"
    //         );
    //         const regex = new RegExp(escapedInvoiceNumber, "i");

    //         const lastData = await (lastCollection as mongoose.Model<any>).find(
    //           {
    //             "data.Invoice Number": { $regex: regex },
    //             uniqueId: recentIds?.detailsId,
    //           }
    //         );

    //         if (lastData && lastData?.length > 0) {
    //           lastData?.forEach((lastItem) => {
    //             const documentNumber = lastItem?.data["Document Number"];
    //             console.log(invoiceNumber, documentNumber);

    //             console.log(documentNumber.includes("PID"));
    //             if (documentNumber) {
    //               if (
    //                 documentNumber.startsWith("PID") ||
    //                 documentNumber.endsWith("PID") ||
    //                 documentNumber.includes("PID")
    //               ) {
    //                 isPCaseTrue = true;
    //                 // console.log(lastItem);
    //                 matchPCaseData.push(lastItem);
    //               } else if (
    //                 documentNumber.startsWith("TDS") ||
    //                 documentNumber.endsWith("TDS") ||
    //                 documentNumber.includes("TDS")
    //               ) {
    //                 isKCaseTrue = true;
    //                 // console.log("K", lastItem);
    //                 matchKCaseData.push(lastItem);
    //               }
    //             }
    //           });
    //         }
    //       }
    //     }
    //   } catch (error) {
    //     // console.error("Error:", error);
    //   }
    // });

    // res.send({ matchKCaseData });
    // old way working code.
    // for (let i = 0; i < data?.length; i++) {
    //   //  MATCHING THE DOCUMENT TYPE.
    //   const documentNumber = data[i].finalresult.data["Document Number"];
    //   if (
    //     documentNumber &&
    //     (documentNumber.startsWith("PID") ||
    //       documentNumber.endsWith("PID") ||
    //       documentNumber.includes("PID"))
    //   ) {
    //     isPCaseTrue = true;
    //     matchPCaseData.push(data[i]?.finalresult);
    //   } else if (
    //     documentNumber &&
    //     (documentNumber.startsWith("TDS") ||
    //       documentNumber.endsWith("TDS") ||
    //       documentNumber.includes("TDS"))
    //   ) {
    //     isKCaseTrue = true;
    //     console.log("K", data[i]?.finalresult);
    //     matchKCaseData.push(data[i]?.finalresult);
    //   }
    // }

    // TEST P CASE - IF P CASE SUCCESS.

    // console.log({ matchPCaseData, isPCaseTrue });
    const pCaseDataFlat = await matchPCaseData.flat();

    // TEST K CASE - IF K CASE SUCCESS.
    const kCaseDataFlat = await matchKCaseData.flat();
    // console.log({ kCaseDataFlat });
    // STORE INTO THE P CASE COLLECTION
    console.log({ kCaseDataFlat, isKCaseTrue });
    if (isPCaseTrue) {
      let idx: number = 1;
      for (const item of pCaseDataFlat) {
        const pCaseInstance = await new PCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          "Grn Number": item?.data["Grn Number"],
          "Debit Amount(INR)": item?.data["Debit Amount(INR)"],
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
          "Company Code": item?.data["Company Code"],
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          "Grn Number": item?.data["Grn Number"],
          "Debit Amount(INR)": item?.data["Debit Amount(INR)"],
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
      data: data,
      success: "ok",
    });
  } catch (error) {
    console.error("Error in aggregation:", error);
    return res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};
