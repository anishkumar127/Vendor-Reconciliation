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
import MTwoCase from "../models/cases/MTwo.model";
import LTwoCase from "../models/cases/LTwoCase.model";
import MThreeCase from "../models/cases/MThreeCase.model";

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
  const yourSchema = new mongoose.Schema( // no await because mongoose constructor is sync.
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
  const { vendorName } = req.body;
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
    // test

    const LeftSideAggregation = await Collection.aggregate([
      {
        $match: {
          "data.Vendor Name": vendorName,
          uniqueId: recentIds?.masterId,
        },
      },
      {
        $match: {
          "data.Invoice Number": {
            $exists: true,
          },
        },
      },
      {
        $lookup: {
          as: "result",
          from: vendorCollection.collection.name,
          let: {
            localField: "$data.Invoice Number",
          },
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
        $match: {
          $expr: {
            $lt: ["$first", "$second"],
          },
        },
      },
      {
        $lookup: {
          from: lastCollection.collection.name,
          let: {
            localField: "$result.data.Invoice Number",
          },
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
      {
        $match: {
          finalresult: {
            $ne: [],
          },
          "finalresult.data.Invoice Number": { $ne: "", $exists: true },
        },
      },
      {
        $project: {
          _id: 0,
          finalresult: 1,
          diffBAMatch: { $subtract: ["$second", "$first"] },
          diffABMatch: {
            $subtract: ["$first", "$second"],
          },
          data: 1,
        },
      },
    ]);

    // P1 K1 G1 I1 L1 M1
    const iCaseDataStore1: any[] = [];
    const matchPCaseData1: any[] = [];
    const matchKCaseData1: any[] = [];
    const matchGCaseData1: any[] = [];

    const matchLCaseData1: any[] = [];
    const matchMCaseData1: any[] = [];

    for (let i = 0; i < LeftSideAggregation?.length; i++) {
      if (LeftSideAggregation[i]?.finalresult?.data) {
        const diffBAMatch = LeftSideAggregation[i]?.diffBAMatch;
        const documentNumber =
          LeftSideAggregation[i]?.finalresult?.data["Document Number"];
        const paymentDocument =
          LeftSideAggregation[i]?.finalresult?.data["Payment Document"];

        // I CASE
        let IClosingBalance1: string | number = 0;
        let pClosingBalance1: string | number = 0;
        let kClosingBalance1: string | number = 0;
        let GClosingBalance1: string | number = 0;

        if (
          documentNumber &&
          (documentNumber.startsWith("AAD") ||
            documentNumber.endsWith("AAD") ||
            documentNumber.includes("AAD"))
        ) {
          iCaseDataStore1.push(LeftSideAggregation[i]?.finalresult);
          // CLOSING BALANCE 3RD FILE
          const closingBalanceString =
            LeftSideAggregation[i]?.finalresult?.data?.["Debit Amount(INR)"];

          if (closingBalanceString) {
            const closingBalanceWithoutCommas = closingBalanceString.replace(
              /,/g,
              ""
            );
            const closingBalanceNumeric = parseFloat(
              closingBalanceWithoutCommas
            );
            IClosingBalance1 = closingBalanceNumeric;
          }
        }
        // P CASE
        if (
          documentNumber &&
          (documentNumber.startsWith("PID") ||
            documentNumber.endsWith("PID") ||
            documentNumber.includes("PID"))
        ) {
          matchPCaseData1.push(LeftSideAggregation[i]?.finalresult);
          // Debit Amount(INR) 3RD FILE
          const closingBalanceString =
            LeftSideAggregation[i]?.finalresult?.data?.["Debit Amount(INR)"];

          if (closingBalanceString) {
            const closingBalanceWithoutCommas = closingBalanceString.replace(
              /,/g,
              ""
            );
            const closingBalanceNumeric = parseFloat(
              closingBalanceWithoutCommas
            );
            pClosingBalance1 = closingBalanceNumeric;
          }
        }
        // K CASE
        if (
          documentNumber &&
          (documentNumber.startsWith("TDS") ||
            documentNumber.endsWith("TDS") ||
            documentNumber.includes("TDS"))
        ) {
          matchKCaseData1.push(LeftSideAggregation[i]?.finalresult);
          // Debit Amount(INR) 3RD FILE
          const closingBalanceString =
            LeftSideAggregation[i]?.finalresult?.data?.["Debit Amount(INR)"];

          if (closingBalanceString) {
            const closingBalanceWithoutCommas = closingBalanceString.replace(
              /,/g,
              ""
            );
            const closingBalanceNumeric = parseFloat(
              closingBalanceWithoutCommas
            );
            kClosingBalance1 = closingBalanceNumeric;
          }
        }
        // G CASE
        if (
          paymentDocument &&
          paymentDocument !== "" &&
          paymentDocument !== 0 &&
          paymentDocument !== "0"
        ) {
          const closingBalanceString =
            LeftSideAggregation[i]?.finalresult?.data?.["Debit Amount(INR)"];

          if (closingBalanceString) {
            const closingBalanceWithoutCommas = closingBalanceString.replace(
              /,/g,
              ""
            );
            const closingBalanceNumeric = parseFloat(
              closingBalanceWithoutCommas
            );
            GClosingBalance1 = closingBalanceNumeric;
            matchGCaseData1.push(LeftSideAggregation[i]?.finalresult);
          }
        }

        // SUM P K G I  ==  DIFF ( SECOND  - FIRST) + ;
        const sum =
          IClosingBalance1 +
          pClosingBalance1 +
          kClosingBalance1 +
          GClosingBalance1;

        if (sum > diffBAMatch) {
          matchMCaseData1.push(LeftSideAggregation[i]?.finalresult);
        } else if (sum < diffBAMatch) {
          matchLCaseData1.push(LeftSideAggregation[i]?.finalresult);
        }
      }
    }

    // <------------------------ M2 F > S AGGREGATION --------------------------------------->

    const mTwoAggregate = await Collection.aggregate([
      {
        $match: {
          "data.Vendor Name": vendorName,
          uniqueId: recentIds?.masterId,
        },
      },
      {
        $match: {
          "data.Invoice Number": {
            $exists: true,
          },
        },
      },
      {
        $lookup: {
          as: "result",
          from: vendorCollection.collection.name,
          let: {
            localField: "$data.Invoice Number",
          },
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
          finalresult: 1,
          diffBAMatch: { $subtract: ["$second", "$first"] },
          diffABMatch: {
            $subtract: ["$first", "$second"],
          },
        },
      },
    ]);

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

    const LTwoAndMThreeAggregate = await vendorCollection.aggregate([
      {
        $match: {
          "data.Invoice Number": {
            $exists: true,
            $ne: "", // This ensures that "data.Invoice Number" is not an empty string
            $regex: /\S+/, // This ensures that "data.Invoice Number" is not just whitespace
          },
          uniqueId: recentIds?.vendorId,
        },
      },
      {
        $lookup: {
          from: Collection.collection.name,
          let: {
            localField: "$data.Invoice Number",
            masterId: recentIds?.masterId,
          },
          pipeline: [
            {
              $match: {
                "data.Invoice Number": {
                  $exists: true,
                  $ne: "", // This ensures that "data.Invoice Number" is not an empty string
                  $regex: /\S+/, // This ensures that "data.Invoice Number" is not just whitespace
                },
                $expr: {
                  $and: [
                    {
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
                    {
                      $eq: ["$uniqueId", "$$masterId"],
                    },
                  ],
                },
              },
            },
          ],
          as: "resultmaster",
        },
      },
      {
        $match: {
          resultmaster: {
            $eq: [],
          },
        },
      },
      {
        $lookup: {
          from: lastCollection.collection.name,
          let: {
            localField: "$data.Invoice Number",
            detailsId: recentIds?.detailsId,
          },
          pipeline: [
            {
              $match: {
                "data.Invoice Number": {
                  $exists: true,
                  $ne: "", // This ensures that "data.Invoice Number" is not an empty string
                  $regex: /\S+/, // This ensures that "data.Invoice Number" is not just whitespace
                },
                $expr: {
                  $and: [
                    {
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
                    {
                      $eq: ["$uniqueId", "$$detailsId"],
                    },
                  ],
                },
              },
            },
          ],
          as: "resultcompletes",
        },
      },
      {
        $match: {
          resultcompletes: {
            $eq: [],
          },
        },
      },
      {
        $project: {
          // data: 1,
          resultmaster: 0,
          resultcompletes: 0,
        },
      },
    ]);

    const matchLTwoCaseData: any[] = [];
    const matchMThreeCaseData: any[] = [];
    for (let i = 0; i < LTwoAndMThreeAggregate?.length; i++) {
      const closingBalanceString =
        LTwoAndMThreeAggregate[i]?.data["Closing Balance"];

      if (closingBalanceString) {
        const closingBalanceWithoutCommas = closingBalanceString.replace(
          /,/g,
          ""
        );
        const closingBalanceNumeric = parseFloat(closingBalanceWithoutCommas);
        if (closingBalanceNumeric) {
          if (closingBalanceNumeric > 0) {
            // M3
            matchMThreeCaseData.push(LTwoAndMThreeAggregate[i]);
          } else {
            // L2
            matchLTwoCaseData.push(LTwoAndMThreeAggregate[i]);
          }
        }
      }
    }
    res.send({ matchLTwoCaseData, matchMThreeCaseData });

    // <----------------------------  M5 INVOICE EMPTY AGGREGATE ---------------------------->
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
    // <----------------------------  L4 INVOICE EMPTY AGGREGATE ---------------------------->
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

    // <---------------------------- CASE A ---------------------------->
    const ACaseFutureData: any[] = [];

    for (const caseData of ACaseData) {
      console.log(
        new Date(caseData?.resultFromCompletes?.data?.["Document Date"])
      );

      const documentDate = new Date(
        caseData?.resultFromCompletes?.data?.["Document Date"]
      );
      const currentDate = new Date();

      if (documentDate > currentDate) {
        ACaseFutureData.push(caseData?.resultFromCompletes);
      }
    }

    // <------------------- P ONE DATABASE ------------------------->

    if (matchPCaseData1) {
      let idx: number = 1;
      for (const item of matchPCaseData1) {
        if (item?.data["Debit Amount(INR)"]) {
          const pCaseInstance = new PCase({
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

    // <-------------------- K ONE DATABASE ------------------------->
    if (matchKCaseData1) {
      let idx: number = 1;
      for (const item of matchKCaseData1) {
        if (item?.data["Debit Amount(INR)"]) {
          const kCaseInstance = new KCase({
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
    // <--------------------- G ONE DATABASE  ---------------------------->
    if (matchGCaseData1) {
      let idx: number = 1;
      for (const item of matchGCaseData1) {
        const GCaseInstance = new GCase({
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
    // <--------------------- I ONE DATABASE  ---------------------------->
    if (iCaseDataStore1) {
      let idx: number = 1;
      for (const item of iCaseDataStore1) {
        const ICaseInstance = new ICase({
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

    // <--------------------- L ONE DATABASE ------------------------->
    if (matchLCaseData1) {
      let idx: number = 1;
      for (const item of matchLCaseData1) {
        const LCaseInstance = new LCase({
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

    // <--------------------- M ONE DATABASE ------------------------->
    if (matchMCaseData1) {
      let idx: number = 1;
      for (const item of matchMCaseData1) {
        const MCaseInstance = new MCase({
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

    // L2
    // <--------------------- L TWO DATABASE ------------------------->

    if (matchLTwoCaseData) {
      let idx: number = 1;
      for (const item of matchLTwoCaseData) {
        const LTwoCaseInstance = new LTwoCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Vendor Code": item?.data["Vendor Code"],
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          "Invoice Amount": item?.data["Invoice Amount"],
          Amount: item?.data["Closing Balance"],
        });
        try {
          await LTwoCaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }

    // M3
    // <--------------------- M THREE DATABASE ------------------------->
    if (matchMThreeCaseData) {
      let idx: number = 1;
      for (const item of matchMThreeCaseData) {
        const MThreeCaseInstance = new MThreeCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Vendor Code": item?.data["Vendor Code"],
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          "Invoice Amount": item?.data["Invoice Amount"],
          Amount: item?.data["Closing Balance"],
        });
        try {
          await MThreeCaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }
    // <---------------------------- L4 INVOICE EMPTY DATABASE  ---------------------------->

    if (LCaseInvoiceEmpty) {
      let idx: number = 1;
      for (const item of LCaseInvoiceEmpty) {
        const LCaseInstance = new LOneCase({
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
    // <---------------------------- M5 INVOICE EMPTY DATABASE  ---------------------------->

    if (MCaseInvoiceEmpty) {
      let idx: number = 1;
      for (const item of MCaseInvoiceEmpty) {
        const MCaseInstance = new MOneCase({
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

    // <---------------------------- M2 F > S DATABASE  ---------------------------->

    if (mTwoAggregate) {
      let idx: number = 1;
      for (const item of mTwoAggregate) {
        const MTwoCaseInstance = new MTwoCase({
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          "Vendor Name": item?.data["Vendor Name"],
          "Company Code": item?.data["Company Code"],
          Amount: item?.data["Closing Balance"],
          Difference: item?.diffABMatch,
        });
        try {
          await MTwoCaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }
    // <---------------------------- M4 F < S DATABASE  ---------------------------->

    if (matchMCaseData1) {
      let idx: number = 1;
      for (const item of matchMCaseData1) {
        const MTwoCaseInstance = new MTwoCase({
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
          await MTwoCaseInstance.save();
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }

    // <---------------------------- A DATABASE  ---------------------------->
    if (ACaseFutureData) {
      let idx: number = 1;
      for (const item of ACaseFutureData) {
        const ACaseInstance = new ACase({
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

    // <---------------------------- F DATABASE  ---------------------------->
    if (CaseF) {
      let idx: number = 1;
      for (const item of CaseF) {
        const FCaseInstance = new FCase({
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

    return res.status(200).json({
      message: "ok",
      success: "ok",
    });
  } catch (error) {
    return res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};
