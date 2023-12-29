import mongoose from "mongoose";
import { RecentIds } from "../models/mixed/RecentIds.model";
import { RequestHandler } from "express";
import { getUser } from "../services/auth";
import PCase from "../models/cases/PCase.model";
import KCase from "../models/cases/KCase.model";
import LCase from "../models/cases/LCase.model";
import MCase from "../models/cases/MCase.model";
import FCase from "../models/cases/FCase.model";
import GCase from "../models/cases/GCase.model";
import ACase from "../models/cases/ACase.model";
import LOneCase from "../models/cases/LOneCase.model";
import MOneCase from "../models/cases/MOneCase.model";
import ICase from "../models/cases/ICase.model";
import MThreeCase from "../models/cases/MThree.model";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { vendorName, documentType } = req.body;
  if (!vendorName)
    return res.status(404).json({ error: "missing required fields!" });

  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email }: any = await getUser(token);

  if (!_id || !email)
    return res.status(401).json({ error: "user not authenticated!" });

  const Collection: any = await getModelByString(`${email}@masterOpen`);

  const vendorCollection: any = await getModelByString(`${email}@vendorOpen`);
  const lastCollection: any = await getModelByString(`${email}@complete`);

  if (!Collection || !vendorCollection)
    return res.status(500).json({ error: "schema error!" });

  const recentIds = await RecentIds.findOne({
    user: _id,
  });

  if (!recentIds)
    return res.status(404).json({ error: "no recent ids present." });

  try {
    // <---------------------------- CASE P AND K AGGREGATION ---------------------------->

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
      {
        $lookup: {
          from: lastCollection.collection.name,
          let: { localField: "$data.Invoice Number" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $regexMatch: {
                        input: "$data.Invoice Number",
                        regex: "$$localField",
                      },
                    },
                    {
                      $regexMatch: {
                        input: "$$localField",
                        regex: "$data.Invoice Number",
                      },
                    },
                  ],
                },
              },
            },
          ],
          as: "finalresult",
        },
      },
      {
        $unwind: {
          path: "$finalresult",
        },
      },
      {
        $match: {
          "finalresult.uniqueId": recentIds?.detailsId,
        },
      },
    ]);

    if (!data) return res.status(500).json({ error: "server query error!" });

    // <---------------------------- CASE A AGGREGATION ---------------------------->

    const ACaseData = await vendorCollection.aggregate([
      {
        $match: {
          uniqueId: recentIds?.vendorId,
        },
      },
      {
        $lookup: {
          from: Collection.collection.name,
          let: {
            invoiceNumber: "$data.Invoice Number",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$data.Invoice Number", "$$invoiceNumber"],
                    },
                    {
                      $eq: ["$uniqueId", recentIds?.masterId],
                    },
                  ],
                },
              },
            },
          ],
          as: "result",
        },
      },
      {
        $match: {
          result: {
            $eq: [],
          },
        },
      },
      {
        $lookup: {
          from: lastCollection.collection.name,
          localField: "data.Invoice Number",
          foreignField: "data.Invoice Number",
          as: "resultFromCompletes",
        },
      },
      {
        $unwind: {
          path: "$resultFromCompletes",
        },
      },
      {
        $project: {
          _id: 0,
          resultFromCompletes: 1,
        },
      },
      {
        $match: {
          "resultFromCompletes.uniqueId": recentIds?.detailsId,
        },
      },
    ]);

    // <---------------------------- CASE L AND M  AGGREGATION ---------------------------->

    const CaseLAndM = await vendorCollection.aggregate([
      {
        $match: {
          uniqueId: recentIds?.vendorId,
        },
      },
      {
        $lookup: {
          from: lastCollection.collection.name,
          let: { invoiceNumber: "$data.Invoice Number" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$data.Invoice Number", "$$invoiceNumber"] },
                    { $eq: ["$uniqueId", recentIds.detailsId] },
                    { $ne: ["$data.Debit Amount(INR)", null] },
                    { $ne: ["$data.Debit Amount(INR)", undefined] },
                    { $ne: ["$data.Debit Amount(INR)", ""] },
                  ],
                },
              },
            },
          ],
          as: "ACMatch",
        },
      },
      {
        $lookup: {
          from: Collection.collection.name,
          let: { invoiceNumber: "$data.Invoice Number" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$data.Invoice Number", "$$invoiceNumber"] },
                    { $eq: ["$uniqueId", recentIds.masterId] },
                  ],
                },
              },
            },
          ],
          as: "ABMatch",
        },
      },
      {
        $group: {
          _id: "$_id",
          combinedData: {
            $push: {
              A: "$$ROOT",
            },
          },
        },
      },
      {
        $unwind: "$combinedData",
      },
    ]);

    // <---------------------------- CASE F AGGREGATION ---------------------------->

    const CaseF = await Collection.aggregate([
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
        $match: {
          result: {
            $eq: [],
          },
        },
      },
      {
        $project: {
          _id: 0,
          result: 0,
        },
      },
    ]);

    //  G CASE

    const GCaseData = await Collection.aggregate([
      {
        $match: {
          "data.Vendor Name": vendorName,
          uniqueId: recentIds?.masterId,
        },
      },
      {
        $lookup: {
          as: "result",
          from: vendorCollection.collection.name,
          foreignField: "data.Invoice Number",
          localField: "data.Invoice Number",
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
          diff: {
            $subtract: ["$second", "$first"],
          },
        },
      },
      {
        $match: {
          diff: {
            $gt: 1,
          },
        },
      },
      {
        $lookup: {
          // from: "user@gmail.com@completes",
          from: lastCollection.collection.name,
          localField: "result.data.Invoice Number",
          foreignField: "data.Invoice Number",
          as: "finalresult",
        },
      },
      {
        $unwind: {
          path: "$finalresult",
        },
      },
      {
        $match: {
          "finalresult.uniqueId": recentIds?.detailsId,
        },
      },
      {
        $project: {
          _id: 0,
          finalresult: 1,
        },
      },
      {
        $match: {
          $and: [
            {
              "finalresult.data.Payment Document": {
                $ne: "0",
              },
            },
            {
              "finalresult.data.Payment Document": {
                $ne: "",
              },
            },
            {
              "finalresult.data.Payment Document": {
                $ne: 0,
              },
            },
          ],
        },
      },
      {
        $replaceRoot: { newRoot: "$finalresult" },
      },
    ]);
    // <---------------------------- CASE M3 ---------------------------->

    const MThreeCaseAgg = await Collection.aggregate([
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
        $match: {
          "result.data.Invoice Number": {
            // SOMETIMES INVOICE NUMBER NOT MATCHED ALSO OCCUR SO KEEP CHECK INVOICE NUMBER SHOULD PRESENT. NEED ALSO IN 3 FILES THIS CHECK.
            $exists: false,
          },
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
      // {
      //   $project: {
      //     data: 1,
      //     result: 1,
      //     diff: {
      //       $subtract: ["$first", "$second"],
      //     },
      //   },
      // },
      // {
      //   $match: {
      //     $expr: {
      //       $gt: ["$first", "$second"],
      //     },
      //   },
      // },
      // {
      //   $project: {
      //     // _id: 0,
      //     data: 1,
      //     // first: 1,
      //     // second: 1,
      //     // result: 1,
      //   },
      // },
      //  {
      //   '$match': {
      //     'diff': {
      //       '$gt': 1
      //     }
      //   }
      // },
      // {
      //   $project: {
      //     data: 1,
      //     diff: 1,
      //   },
      // },

      {
        $project: {
          data: 1,
          result: 1,
          first: 1,
          second: 1,
          diff: {
            $subtract: ["$first", "$second"],
          },
        },
      },
      {
        $match: {
          $expr: {
            $gt: ["$first", "$second"],
          },
        },
      },
      {
        $project: {
          _id: 0,
          data: 1,
          diff: 1,
          // first:1,
          // second:1,
          // result:1
        },
      },
    ]);
    // res.send(MThreeCaseAgg);

    // <---------------------------- CASE i ---------------------------->

    const iCaseAgg = await Collection.aggregate([
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
        $match: {
          "result.data.Invoice Number": {
            $exists: true,
          },
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
          diff: {
            $subtract: ["$second", "$first"],
          },
        },
      },
      {
        $match: {
          diff: {
            $gt: 1,
          },
        },
      },
      {
        $lookup: {
          from: lastCollection.collection.name,
          localField: "result.data.Invoice Number",
          foreignField: "data.Invoice Number",
          as: "finalresult",
        },
      },
      {
        $unwind: {
          path: "$finalresult",
        },
      },
      {
        $match: {
          "finalresult.uniqueId": recentIds?.detailsId,
        },
      },
      {
        $project: {
          _id: 0,
          finalresult: 1,
        },
      },
      {
        $replaceRoot: {
          newRoot: "$finalresult",
        },
      },
    ]);

    const iCaseDataStore: any[] = [];
    let IClosingBalance: string | number = 0;
    for (let i = 0; i < iCaseAgg?.length; i++) {
      const documentNumber = iCaseAgg[i]?.data["Document Number"];

      if (
        documentNumber &&
        (documentNumber.startsWith("AAD") ||
          documentNumber.endsWith("AAD") ||
          documentNumber.includes("AAD"))
      ) {
        iCaseDataStore.push(iCaseAgg[i]);

        // CLOSING BALANCE 3RD FILE
        const closingBalanceString = iCaseAgg[i]?.data["Closing Balance"];

        if (closingBalanceString) {
          const closingBalanceWithoutCommas = closingBalanceString.replace(
            /,/g,
            ""
          );
          const closingBalanceNumeric = parseFloat(closingBalanceWithoutCommas);
          IClosingBalance = closingBalanceNumeric;
        }
      }
    }

    // <---------------------------- CASE M1 INVOICE EMPTY ---------------------------->
    const MCaseInvoiceEmpty = await vendorCollection.aggregate([
      [
        {
          $match: {
            "data.Invoice Number": { $exists: false },
            $expr: {
              $gt: [
                {
                  $toDouble: {
                    $replaceAll: {
                      input: "$data.Closing Balance",
                      find: ",",
                      replacement: "",
                    },
                  },
                },
                0,
              ],
            },
            uniqueId: recentIds?.vendorId,
          },
        },
        // {
        //   $project: {
        //     first: {
        //       $toDouble: {
        //         $replaceAll: {
        //           input: "$data.Closing Balance",
        //           find: ",",
        //           replacement: "",
        //         },
        //       },
        //     },
        //   },
        // },
      ],
    ]);
    // <---------------------------- CASE L1 INVOICE EMPTY ---------------------------->
    const LCaseInvoiceEmpty = await vendorCollection.aggregate([
      [
        {
          $match: {
            "data.Invoice Number": { $exists: false },
            $expr: {
              $lt: [
                {
                  $toDouble: {
                    $replaceAll: {
                      input: "$data.Closing Balance",
                      find: ",",
                      replacement: "",
                    },
                  },
                },
                0,
              ],
            },
            uniqueId: recentIds?.vendorId,
          },
        },
      ],
    ]);
    // <---------------------------- CASE P AND K ---------------------------->
    const matchPCaseData: any = [];

    const matchKCaseData: any = [];
    let isPCaseTrue: boolean = false;
    let isKCaseTrue: boolean = false;
    let pClosingBalance: string | number = 0;
    let kClosingBalance: string | number = 0;

    //  BACK TO OPTIMAL VIA - ADDED INTO PIPELINE - WHAT ADDED ? - INCLUDES METHOD ON INVOICE NUMBER.
    for (let i = 0; i < data?.length; i++) {
      //  MATCHING THE DOCUMENT TYPE.
      const documentNumber = data[i].finalresult.data["Document Number"];
      if (
        documentNumber &&
        (documentNumber.startsWith("PID") ||
          documentNumber.endsWith("PID") ||
          documentNumber.includes("PID"))
      ) {
        isPCaseTrue = true;
        matchPCaseData.push(data[i]?.finalresult);

        // CLOSING BALANCE

        const closingBalanceString =
          data[i].finalresult.data["Closing Balance"];

        if (closingBalanceString) {
          const closingBalanceWithoutCommas = closingBalanceString.replace(
            /,/g,
            ""
          );
          const closingBalanceNumeric = parseFloat(closingBalanceWithoutCommas);
          pClosingBalance = closingBalanceNumeric;
        }
      } else if (
        documentNumber &&
        (documentNumber.startsWith("TDS") ||
          documentNumber.endsWith("TDS") ||
          documentNumber.includes("TDS"))
      ) {
        isKCaseTrue = true;
        //
        matchKCaseData.push(data[i]?.finalresult);

        // CLOSING BALANCE
        const closingBalanceString =
          data[i].finalresult.data["Closing Balance"];

        if (closingBalanceString) {
          const closingBalanceWithoutCommas = closingBalanceString.replace(
            /,/g,
            ""
          );
          const closingBalanceNumeric = parseFloat(closingBalanceWithoutCommas);
          kClosingBalance = closingBalanceNumeric;
        }
      }
    }

    const pCaseDataFlat = await matchPCaseData.flat();

    // TEST K CASE - IF K CASE SUCCESS.
    const kCaseDataFlat = await matchKCaseData.flat();
    // STORE INTO THE P CASE COLLECTION
    if (isPCaseTrue) {
      let idx: number = 1;
      for (const item of pCaseDataFlat) {
        if (item?.data["Debit Amount(INR)"]) {
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
            return res.status(500).json({ error });
          }
        }
      }
    }

    // STORE INTO K CASE COLLECTION.
    if (isKCaseTrue) {
      let idx: number = 1;
      for (const item of kCaseDataFlat) {
        if (item?.data["Debit Amount(INR)"]) {
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
            return res.status(500).json({ error });
          }
        }
      }
    }

    // <---------------------------- CASE A ---------------------------->
    const ACaseFutureData: any[] = [];

    for (let i = 0; i < ACaseData.length; i++) {
      console.log(
        new Date(ACaseData[i]?.resultFromCompletes?.data?.["Document Date"])
      );

      const documentDate = new Date(
        ACaseData[i]?.resultFromCompletes?.data?.["Document Date"]
      );
      const currentDate = new Date();

      if (documentDate > currentDate) {
        ACaseFutureData.push(ACaseData[i]?.resultFromCompletes);
      }
      // break;
    }

    // <---------------------------- CASE L AND M ---------------------------->
    const matchLCaseData: any = [];
    const matchMCaseData: any = [];
    let isLCaseTrue: boolean = false;
    let isMCaseTrue: boolean = false;

    for (let i = 0; i < CaseLAndM?.length; i++) {
      const closingBalanceString =
        CaseLAndM[i].combinedData.A.data["Closing Balance"];

      // Step 1: Remove commas from the string
      const closingBalanceWithoutCommas = closingBalanceString.replace(
        /,/g,
        ""
      );

      // Step 2: Convert the string to a numeric format
      const closingBalanceNumeric = parseFloat(closingBalanceWithoutCommas);

      if (
        CaseLAndM[i].combinedData.A.ACMatch?.length == 0 &&
        CaseLAndM[i].combinedData.A.ABMatch?.length == 0 &&
        closingBalanceNumeric >= 0
      ) {
        // CREDIT AMOUNT
        isMCaseTrue = true;
        const filteredData = {
          ...CaseLAndM[i].combinedData.A,
          ACMatch: undefined,
          ABMatch: undefined,
        };
        matchMCaseData.push(filteredData);
      } else if (
        CaseLAndM[i].combinedData.A.ACMatch?.length == 0 &&
        CaseLAndM[i].combinedData.A.ABMatch?.length == 0 &&
        closingBalanceNumeric < 0
      ) {
        // DEBIT AMOUNT
        isLCaseTrue = true;
        // matchLCaseData.push(...CaseLAndM[i].combinedData.A.ACMatch);
        const filteredData = {
          ...CaseLAndM[i].combinedData.A,
          ACMatch: undefined,
          ABMatch: undefined,
        };
        matchLCaseData.push(filteredData);
      }
    }

    const LCaseDataFlat = await matchLCaseData.flat();
    const MCaseDataFlat = await matchMCaseData.flat();
    // STORE INTO L CASE COLLECTION.
    if (isLCaseTrue) {
      let idx: number = 1;
      for (const item of LCaseDataFlat) {
        const LCaseInstance = await new LCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Vendor Code": item?.data["Vendor Code"],
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          Amount: item?.data["Closing Balance"],
        });
        try {
          await LCaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }

    // STORE INTO M CASE COLLECTION.
    if (isMCaseTrue) {
      let idx: number = 1;
      for (const item of MCaseDataFlat) {
        const MCaseInstance = await new MCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Vendor Code": item?.data["Vendor Code"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          Amount: item?.data["Closing Balance"],
          "Invoice Amount": item?.data["Invoice Amount"],
        });
        try {
          await MCaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }

    // L1 CASE INVOICE EMPTY
    if (LCaseInvoiceEmpty) {
      let idx: number = 1;
      for (const item of LCaseInvoiceEmpty) {
        const LCaseInstance = await new LOneCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          Amount: item?.data["Closing Balance"],
          "Invoice Amount": item?.data["Invoice Amount"],
        });
        try {
          await LCaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }

    // M1 CASE INVOICE EMPTY
    if (MCaseInvoiceEmpty) {
      let idx: number = 1;
      for (const item of MCaseInvoiceEmpty) {
        const MCaseInstance = await new MOneCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Document Date": item?.data["Document Date"],
          "Invoice Amount": item?.data["Invoice Amount"],
          Amount: item?.data["Closing Balance"],
        });
        try {
          await MCaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }

    // <---------------------------- CASE M3 DATABASE  ---------------------------->

    if (MThreeCaseAgg) {
      let idx: number = 1;
      for (const item of MThreeCaseAgg) {
        const MThreeCaseInstance = await new MThreeCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          "Vendor Name": item?.data["Vendor Name"],
          "Company Code": item?.data["Company Code"],
          Amount: item?.data["Closing Balance"],
          Difference: item?.diff,
        });
        try {
          await MThreeCaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }
    // <---------------------------- CASE I DATABASE  ---------------------------->
    if (iCaseDataStore) {
      let idx: number = 1;
      for (const item of iCaseDataStore) {
        const ICaseInstance = await new ICase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Due Date": item?.data["Due Date"],
          "Invoice Number": item?.data["Invoice Number"],
          Amount: item?.data["Debit Amount(INR)"],
          "Invoice Amount": item?.data["Invoice Amount"],
        });
        try {
          await ICaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }

    // <---------------------------- CASE A DATABASE  ---------------------------->
    if (ACaseFutureData) {
      let idx: number = 1;
      for (const item of ACaseFutureData) {
        const ACaseInstance = await new ACase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Vendor Code": item?.data["Vendor Code"],
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          "Debit Amount(INR)": item?.data["Debit Amount(INR)"],
          "Invoice Amount": item?.data["Invoice Amount"],
          "Invoice Date": item?.data["Invoice Date"],
          "Payment Date": item?.data["Payment Date"],
          "Payment Document": item?.data["Payment Document"],
          "Grn Number": item?.data["Grn Number"],
        });
        try {
          await ACaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }

    // <---------------------------- CASE F DATABASE  ---------------------------->
    if (CaseF) {
      let idx: number = 1;
      for (const item of CaseF) {
        const FCaseInstance = await new FCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Vendor Code": item?.data["Vendor Code"],
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          "Debit Amount(INR)": item?.data["Debit Amount(INR)"],
          "Invoice Amount": item?.data["Invoice Amount"],
          "Invoice Date": item?.data["Invoice Date"],
          "Payment Date": item?.data["Payment Date"],
          "Payment Document": item?.data["Payment Document"],
          "Grn Number": item?.data["Grn Number"],
        });
        try {
          await FCaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }

    // <---------------------------- CASE G DATABASE  ---------------------------->
    if (GCaseData) {
      let idx: number = 1;
      for (const item of GCaseData) {
        const GCaseInstance = await new GCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data?.["Company Code"] || "",
          "Vendor Code": item?.data?.["Vendor Code"],
          "Document Number": item?.data?.["Document Number"],
          "Document Date": item?.data?.["Document Date"],
          "Invoice Number": item?.data?.["Invoice Number"],
          "Debit Amount(INR)": item?.data?.["Debit Amount(INR)"],
          "Invoice Amount": item?.data?.["Invoice Amount"],
          "Invoice Date": item?.data?.["Invoice Date"],
          "Grn Number": item?.data?.["Grn Number"],
        });
        try {
          await GCaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }

    // L TAB - P K G I  THE DIFFERENCES

    let GClosingBalance: string | number = 0;

    for (let i = 0; i < GCaseData?.length; i++) {
      const closingBalanceString = GCaseData[i]?.data["Closing Balance"];

      if (closingBalanceString) {
        const closingBalanceWithoutCommas = closingBalanceString.replace(
          /,/g,
          ""
        );
        const closingBalanceNumeric = parseFloat(closingBalanceWithoutCommas);
        GClosingBalance = closingBalanceNumeric;
      }
    }

    // SUM OF
    const sum =
      kClosingBalance + pClosingBalance + GClosingBalance + IClosingBalance;
    // res.send({
    //   sum,
    //   kClosingBalance,
    //   pClosingBalance,
    //   GClosingBalance,
    //   IClosingBalance,
    // });

    return res.status(200).json({
      message: "ok",
      data: data,
      success: "ok",
    });
  } catch (error) {
    return res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};
