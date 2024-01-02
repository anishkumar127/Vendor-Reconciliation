import { RequestHandler } from "express";
import mongoose from "mongoose";
import ACase from "../../models/cases/ACase.model";
import FCase from "../../models/cases/FCase.model";
import GCase from "../../models/cases/GCase.model";
import ICase from "../../models/cases/ICase.model";
import KCase from "../../models/cases/KCase.model";
import LFourCase from "../../models/cases/L/LFourCase.model";
import LCase from "../../models/cases/LCase.model";
import LTwoCase from "../../models/cases/LTwoCase.model";
import MFiveCase from "../../models/cases/M/MFiveCase.model";
import MFourCase from "../../models/cases/M/MFour.Model";
import MCase from "../../models/cases/MCase.model";
import MThreeCase from "../../models/cases/MThreeCase.model";
import MTwoCase from "../../models/cases/MTwoCase.model";
import PCase from "../../models/cases/PCase.model";
import GTwoCase from "../../models/cases/right/GTwoCase.model";
import ITwoCase from "../../models/cases/right/ITwoCase.model";
import KTwoCase from "../../models/cases/right/KTwoCase.model";
import LThreeCase from "../../models/cases/right/LThreeCase.model";
import PTwoCase from "../../models/cases/right/PTwoCase.model";
import { RecentIds } from "../../models/mixed/RecentIds.model";
import { getUser } from "../../services/auth";

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

export const dynamicReportV2: RequestHandler = async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { vendorName } = req.body;
  if (!vendorName)
    return res.status(404).json({ error: "missing required fields!" });

  const token = (req as any)?.token;
  if (!token)
    return res.status(401).json({ error: "you are not authenticated" });

  const { _id, email, username }: any = await getUser(token);

  if (!_id || !email || !username)
    return res.status(401).json({ error: "user not authenticated!" });

  const Collection: any = await getModelByString(`${username}@masterOpen`);

  const vendorCollection: any = await getModelByString(
    `${username}@vendorOpen`
  );
  const lastCollection: any = await getModelByString(`${username}@complete`);

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
        // const documentNumber =
        //   LeftSideAggregation[i]?.finalresult?.data["Document Number"];
        const DocumentTypeMapped =
          LeftSideAggregation[i]?.finalresult?.data["DocumentTypeMapped"];
        const paymentDocument =
          LeftSideAggregation[i]?.finalresult?.data["Payment Document"];

        // I CASE
        let IClosingBalance1: string | number = 0;
        let pClosingBalance1: string | number = 0;
        let kClosingBalance1: string | number = 0;
        let GClosingBalance1: string | number = 0;

        if (
          DocumentTypeMapped &&
          (DocumentTypeMapped.startsWith("Advance Payment") ||
            DocumentTypeMapped.endsWith("Advance Payment") ||
            DocumentTypeMapped.includes("Advance Payment"))
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
          DocumentTypeMapped &&
          (DocumentTypeMapped.startsWith("Debit note") ||
            DocumentTypeMapped.endsWith("Debit note") ||
            DocumentTypeMapped.includes("Debit note"))
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
          DocumentTypeMapped &&
          (DocumentTypeMapped.startsWith("TDS") ||
            DocumentTypeMapped.endsWith("TDS") ||
            DocumentTypeMapped.includes("TDS"))
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

    // <---------------------------- CASE L2 - M3 AGGREGATION ---------------------------->

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

    // <---------------------------- CASE A - AND - LEFT SIDE BIG [P2,K2,G2,I2 M4,L3] AGGREGATION ---------------------------->

    const ACase_And_RightSideAggregation = await vendorCollection.aggregate([
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
            $ne: [],
          },
        },
      },
      {
        $project: {
          _id: 0,
          resultcompletes: 1,
          balance: {
            $toDouble: {
              $replaceAll: {
                input: "$data.Closing Balance",
                find: ",",
                replacement: "",
              },
            },
          },
        },
      },
      {
        $unwind: {
          path: "$resultcompletes",
        },
      },

      // {
      //   $replaceRoot: { newRoot: "$resultcompletes" },
      // },
    ]);

    const ACaseFutureData: any[] = [];

    const matchPCaseDataTwo: any[] = [];
    const matchKCaseDataTwo: any[] = [];
    const matchGCaseDataTwo: any[] = [];
    const iCaseDataStoreTwo: any[] = [];

    const matchLCaseDataTwo: any[] = [];
    const matchMCaseDataTwo: any[] = [];

    for (let i = 0; i < ACase_And_RightSideAggregation?.length; i++) {
      if (
        ACase_And_RightSideAggregation[i]?.resultcompletes &&
        ACase_And_RightSideAggregation[i]?.resultcompletes?.data
      ) {
        const documentDate = new Date(
          ACase_And_RightSideAggregation[i]?.resultcompletes.data?.[
            "Document Date"
          ]
        );
        const currentDate = new Date();

        // FUTURE DATE - A CASE.
        if (documentDate > currentDate) {
          ACaseFutureData.push(
            ACase_And_RightSideAggregation[i]?.resultcompletes
          );
        } else if (documentDate <= currentDate) {
          // PASTE DATE.
          const balance = ACase_And_RightSideAggregation[i]?.balance;
          // const documentNumber =
          //   ACase_And_RightSideAggregation[i]?.resultcompletes?.data[
          //     "Document Number"
          //   ];
          const DocumentTypeMapped =
            ACase_And_RightSideAggregation[i]?.resultcompletes?.data[
              "DocumentTypeMapped"
            ];
          const paymentDocument =
            ACase_And_RightSideAggregation[i]?.resultcompletes?.data[
              "Payment Document"
            ];
          // I CASE
          let IClosingBalance1: string | number = 0;
          let pClosingBalance1: string | number = 0;
          let kClosingBalance1: string | number = 0;
          let GClosingBalance1: string | number = 0;

          if (
            DocumentTypeMapped &&
            (DocumentTypeMapped.startsWith("Advance Payment") ||
              DocumentTypeMapped.endsWith("Advance Payment") ||
              DocumentTypeMapped.includes("Advance Payment"))
          ) {
            iCaseDataStoreTwo.push(
              ACase_And_RightSideAggregation[i]?.resultcompletes
            );
            // CLOSING BALANCE 3RD FILE
            const closingBalanceString =
              ACase_And_RightSideAggregation[i]?.resultcompletes?.data?.[
                "Debit Amount(INR)"
              ];

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
            DocumentTypeMapped &&
            (DocumentTypeMapped.startsWith("Debit note") ||
              DocumentTypeMapped.endsWith("Debit note") ||
              DocumentTypeMapped.includes("Debit note"))
          ) {
            matchPCaseDataTwo.push(
              ACase_And_RightSideAggregation[i]?.resultcompletes
            );
            // Debit Amount(INR) 3RD FILE
            const closingBalanceString =
              ACase_And_RightSideAggregation[i]?.resultcompletes?.data?.[
                "Debit Amount(INR)"
              ];

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
            DocumentTypeMapped &&
            (DocumentTypeMapped.startsWith("TDS") ||
              DocumentTypeMapped.endsWith("TDS") ||
              DocumentTypeMapped.includes("TDS"))
          ) {
            matchKCaseDataTwo.push(
              ACase_And_RightSideAggregation[i]?.resultcompletes
            );
            // Debit Amount(INR) 3RD FILE
            const closingBalanceString =
              ACase_And_RightSideAggregation[i]?.resultcompletes?.data?.[
                "Debit Amount(INR)"
              ];

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
              ACase_And_RightSideAggregation[i]?.resultcompletes?.data?.[
                "Debit Amount(INR)"
              ];

            if (closingBalanceString) {
              const closingBalanceWithoutCommas = closingBalanceString.replace(
                /,/g,
                ""
              );
              const closingBalanceNumeric = parseFloat(
                closingBalanceWithoutCommas
              );
              GClosingBalance1 = closingBalanceNumeric;
              matchGCaseDataTwo.push(
                ACase_And_RightSideAggregation[i]?.resultcompletes
              );
            }
          }

          // SUM P2 K2 G2 I2  ==  DIFF ( SECOND  - FIRST) + ;
          const sum =
            IClosingBalance1 +
            pClosingBalance1 +
            kClosingBalance1 +
            GClosingBalance1;

          if (sum > balance) {
            matchMCaseDataTwo.push(
              ACase_And_RightSideAggregation[i]?.resultcompletes
            );
          } else if (sum < balance) {
            matchLCaseDataTwo.push(
              ACase_And_RightSideAggregation[i]?.resultcompletes
            );
          }
        }
      }
    }

    // L2 M3
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
    // const ACaseFutureData: any[] = [];

    // for (const caseData of ACaseData) {
    //   const documentDate = new Date(
    //     caseData?.resultFromCompletes?.data?.["Document Date"]
    //   );
    //   const currentDate = new Date();

    //   if (documentDate > currentDate) {
    //     ACaseFutureData.push(caseData?.resultFromCompletes);
    //   }
    // }

    // <-------------------------- ONE LEFT ------------------------------>
    // <------------------- P ONE DATABASE ------------------------->

    let pOneBalanceSum: number = 0;

    if (matchPCaseData1) {
      const insertDocuments = [];
      let idx: number = 1;

      // store Object
      for (const item of matchPCaseData1) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        if (
          debitAmount !== undefined &&
          debitAmount !== null &&
          debitAmount !== ""
        ) {
          const pCaseInstance = {
            user: new mongoose.Types.ObjectId(_id),
            uniqueId: recentIds?.masterId,
            SNO: idx++,
            "Company Code": item?.data["Company Code"],
            "Document Number": item?.data["Document Number"],
            "Document Date": item?.data["Document Date"],
            "Invoice Number": item?.data["Invoice Number"],
            "Grn Number": item?.data["Grn Number"],
            "Debit Amount(INR)": debitAmount,
          };

          pOneBalanceSum += Number(debitAmount);
          insertDocuments.push(pCaseInstance);
        }
      }

      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await PCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    // <-------------------- K ONE DATABASE ------------------------->
    let kOneBalanceSum: number = 0;

    if (matchKCaseData1) {
      const insertDocuments = [];
      let idx: number = 1;
      for (const item of matchKCaseData1) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        if (
          debitAmount !== undefined &&
          debitAmount !== null &&
          debitAmount !== ""
        ) {
          const kCaseInstance = {
            user: new mongoose.Types.ObjectId(_id),
            uniqueId: recentIds?.masterId,
            SNO: idx++,
            "Company Code": item?.data["Company Code"],
            "Document Number": item?.data["Document Number"],
            "Document Date": item?.data["Document Date"],
            "Invoice Number": item?.data["Invoice Number"],
            "Grn Number": item?.data["Grn Number"],
            "Debit Amount(INR)": item?.data["Debit Amount(INR)"],
          };

          kOneBalanceSum += Number(debitAmount);
          insertDocuments.push(kCaseInstance);
        }
      }

      try {
        if (insertDocuments.length > 0) {
          await KCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    let gOneBalanceSum: number = 0;

    // <--------------------- G ONE DATABASE  ---------------------------->
    if (matchGCaseData1) {
      const insertDocuments = [];
      let idx: number = 1;
      for (const item of matchGCaseData1) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        if (
          debitAmount !== undefined &&
          debitAmount !== null &&
          debitAmount !== ""
        ) {
          const gCaseInstance = {
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
          };
          gOneBalanceSum += Number(debitAmount);
          insertDocuments.push(gCaseInstance);
        }
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await GCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }
    let iOneBalanceSum: number = 0;

    // <--------------------- I ONE DATABASE  ---------------------------->
    if (iCaseDataStore1) {
      const insertDocuments = [];
      let idx: number = 1;
      for (const item of iCaseDataStore1) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        if (
          debitAmount !== undefined &&
          debitAmount !== null &&
          debitAmount !== ""
        ) {
          const ICaseInstance = {
            user: new mongoose.Types.ObjectId(_id),
            uniqueId: recentIds?.masterId,
            SNO: idx++,
            "Document Number": item?.data["Document Number"],
            "Document Date": item?.data["Document Date"],
            "Due Date": item?.data["Due Date"],
            "Invoice Number": item?.data["Invoice Number"],
            Amount: item?.data["Debit Amount(INR)"],
            "Invoice Amount": item?.data["Invoice Amount"],
          };
          iOneBalanceSum += Number(debitAmount);
          insertDocuments.push(ICaseInstance);
        }
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await ICase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }
    let LOneBalanceSum: number = 0;

    // <--------------------- L ONE DATABASE ------------------------->
    if (matchLCaseData1) {
      const insertDocuments = [];

      let idx: number = 1;
      for (const item of matchLCaseData1) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        const LCaseInstance = {
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Vendor Code": item?.data["Vendor Code"],
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          Amount: item?.data["Debit Amount(INR)"],
        };
        LOneBalanceSum += Number(debitAmount);
        insertDocuments.push(LCaseInstance);
      }

      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await LCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    let mOneBalanceSum: number = 0;

    // <--------------------- M ONE DATABASE ------------------------->
    if (matchMCaseData1) {
      const insertDocuments = [];
      let idx: number = 1;
      for (const item of matchMCaseData1) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        const MCaseInstance = {
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Vendor Code": item?.data["Vendor Code"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          Amount: item?.data["Debit Amount(INR)"],
          "Invoice Amount": item?.data["Invoice Amount"],
        };
        mOneBalanceSum += Number(debitAmount);
        insertDocuments.push(MCaseInstance);
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await MCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    // <-------------------------- TWO RIGHT ------------------------------>
    // <------------------- P TWO DATABASE ------------------------->
    let pTwoBalanceSum: number = 0;

    if (matchPCaseDataTwo) {
      const insertDocuments = [];

      let idx: number = 1;
      for (const item of matchPCaseDataTwo) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        if (
          debitAmount !== undefined &&
          debitAmount !== null &&
          debitAmount !== ""
        ) {
          const pCaseInstance = {
            user: new mongoose.Types.ObjectId(_id),
            uniqueId: recentIds?.masterId,
            SNO: idx++,
            "Company Code": item?.data["Company Code"],
            "Document Number": item?.data["Document Number"],
            "Document Date": item?.data["Document Date"],
            "Invoice Number": item?.data["Invoice Number"],
            "Grn Number": item?.data["Grn Number"],
            "Debit Amount(INR)": item?.data["Debit Amount(INR)"],
          };

          pTwoBalanceSum += Number(debitAmount);
          insertDocuments.push(pCaseInstance);
        }
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await PTwoCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    // <-------------------- K TWO DATABASE ------------------------->
    let kTwoBalanceSum: number = 0;

    if (matchKCaseDataTwo) {
      const insertDocuments = [];

      let idx: number = 1;
      for (const item of matchKCaseDataTwo) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        if (
          debitAmount !== undefined &&
          debitAmount !== null &&
          debitAmount !== ""
        ) {
          const kCaseInstance = {
            user: new mongoose.Types.ObjectId(_id),
            uniqueId: recentIds?.masterId,
            SNO: idx++,
            "Company Code": item?.data["Company Code"],
            "Document Number": item?.data["Document Number"],
            "Document Date": item?.data["Document Date"],
            "Invoice Number": item?.data["Invoice Number"],
            "Grn Number": item?.data["Grn Number"],
            "Debit Amount(INR)": item?.data["Debit Amount(INR)"],
          };

          kTwoBalanceSum += Number(debitAmount);
          insertDocuments.push(kCaseInstance);
        }
      }

      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await KTwoCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }
    // <--------------------- G TWO DATABASE  ---------------------------->
    let gTwoBalanceSum: number = 0;

    if (matchGCaseDataTwo) {
      const insertDocuments = [];

      let idx: number = 1;
      for (const item of matchGCaseDataTwo) {
        const debitAmount = item?.data["Debit Amount(INR)"];
        const GCaseInstance = {
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
        };
        try {
          gTwoBalanceSum += Number(debitAmount);
        } catch (error) {}
        insertDocuments.push(GCaseInstance);
      }

      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await GTwoCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }
    // <--------------------- I TWO DATABASE  ---------------------------->
    let iTwoBalanceSum: number = 0;

    if (iCaseDataStoreTwo) {
      const insertDocuments = [];

      let idx: number = 1;
      for (const item of iCaseDataStoreTwo) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        const ICaseInstance = {
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Due Date": item?.data["Due Date"],
          "Invoice Number": item?.data["Invoice Number"],
          Amount: item?.data["Debit Amount(INR)"],
          "Invoice Amount": item?.data["Invoice Amount"],
        };
        iTwoBalanceSum += Number(debitAmount);
        insertDocuments.push(ICaseInstance);
      }

      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await ITwoCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    // <--------------------- L3 under TWO LEFT DATABASE ------------------------->
    let LThreeBalanceSum: number = 0;

    if (matchLCaseDataTwo) {
      const insertDocuments = [];

      let idx: number = 1;
      for (const item of matchLCaseDataTwo) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        const LCaseInstance = {
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Vendor Code": item?.data["Vendor Code"],
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          Amount: item?.data["Debit Amount(INR)"],
        };
        LThreeBalanceSum += Number(debitAmount);
        insertDocuments.push(LCaseInstance);
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await LThreeCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    // <--------------------- M 4 Under TWO  LEFT DATABASE ------------------------->
    let mFourBalanceSum: number = 0;

    if (matchMCaseDataTwo) {
      const insertDocuments = [];

      let idx: number = 1;
      for (const item of matchMCaseDataTwo) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        const MCaseInstance = {
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Vendor Code": item?.data["Vendor Code"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          Amount: item?.data["Debit Amount(INR)"],
          "Invoice Amount": item?.data["Invoice Amount"],
        };
        mFourBalanceSum += Number(debitAmount);
        insertDocuments.push(MCaseInstance);
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await MFourCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    // OTHER

    // L2
    // <--------------------- L TWO DATABASE ------------------------->
    let LTwoBalanceSum: number = 0;

    if (matchLTwoCaseData) {
      const insertDocuments = [];

      let idx: number = 1;
      for (const item of matchLTwoCaseData) {
        const debitAmount = item?.data["Closing Balance"];

        const LTwoCaseInstance = {
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
        };
        LTwoBalanceSum += Number(debitAmount);
        insertDocuments.push(LTwoCaseInstance);
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await LTwoCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    // M3
    // <--------------------- M THREE DATABASE ------------------------->
    let mThreeBalanceSum: number = 0;

    if (matchMThreeCaseData) {
      const insertDocuments = [];

      let idx: number = 1;
      for (const item of matchMThreeCaseData) {
        const debitAmount = item?.data["Closing Balance"];

        const MThreeCaseInstance = {
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
        };
        mThreeBalanceSum += Number(debitAmount);
        insertDocuments.push(MThreeCaseInstance);
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await MThreeCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }
    // <---------------------------- L4 INVOICE EMPTY DATABASE  ---------------------------->
    let LFourBalanceSum: number = 0;

    if (LCaseInvoiceEmpty) {
      let idx: number = 1;
      const insertDocuments = [];

      for (const item of LCaseInvoiceEmpty) {
        const debitAmount = item?.data["Closing Balance"];

        const LCaseInstance = {
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          Amount: item?.data["Closing Balance"],
          "Invoice Amount": item?.data["Invoice Amount"],
        };
        LFourBalanceSum += Number(debitAmount);
        insertDocuments.push(LCaseInstance);
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await LFourCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }
    // <---------------------------- M5 INVOICE EMPTY DATABASE  ---------------------------->
    let mFiveBalanceSum: number = 0;

    if (MCaseInvoiceEmpty) {
      let idx: number = 1;
      const insertDocuments = [];

      for (const item of MCaseInvoiceEmpty) {
        const debitAmount = item?.data["Closing Balance"];

        const MCaseInstance = {
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Document Date": item?.data["Document Date"],
          "Invoice Amount": item?.data["Invoice Amount"],
          Amount: item?.data["Closing Balance"],
        };
        mFiveBalanceSum += Number(debitAmount);
        insertDocuments.push(MCaseInstance);
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await MFiveCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    // <---------------------------- M2 F > S DATABASE  ---------------------------->
    let mTwoBalanceSum: number = 0;

    if (mTwoAggregate) {
      let idx: number = 1;
      const insertDocuments = [];

      for (const item of mTwoAggregate) {
        const debitAmount = item?.data["Closing Balance"];

        const MTwoCaseInstance = {
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          "Vendor Name": item?.data["Vendor Name"],
          "Company Code": item?.data["Company Code"],
          Amount: item?.data["Closing Balance"],
          Difference: item?.diffABMatch,
        };
        mTwoBalanceSum += Number(debitAmount);
        insertDocuments.push(MTwoCaseInstance);
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await MTwoCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    // <---------------------------- A DATABASE  ---------------------------->
    let aOneBalanceSum: number = 0;

    if (ACaseFutureData) {
      let idx: number = 1;
      const insertDocuments = [];

      for (const item of ACaseFutureData) {
        const debitAmount = item?.data["Debit Amount(INR)"];

        const ACaseInstance = {
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
        };
        aOneBalanceSum += Number(debitAmount);
        insertDocuments.push(ACaseInstance);
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await ACase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    // <---------------------------- F DATABASE  ---------------------------->
    let fOneBalanceSum: number = 0;

    if (CaseF) {
      let idx: number = 1;
      const insertDocuments = [];

      for (const item of CaseF) {
        const debitAmount = item?.data["Closing Balance"];

        const FCaseInstance = {
          user: new mongoose.Types.ObjectId(_id),
          uniqueId: recentIds?.masterId,
          SNO: idx++,
          "Company Code": item?.data["Company Code"],
          "Vendor Code": item?.data["Vendor Code"],
          "Document Number": item?.data["Document Number"],
          "Document Date": item?.data["Document Date"],
          "Invoice Number": item?.data["Invoice Number"],
          "Debit Amount(INR)": item?.data["Closing Balance"],
          "Invoice Amount": item?.data["Invoice Amount"],
          "Invoice Date": item?.data["Invoice Date"],
          "Payment Date": item?.data["Payment Date"],
          "Payment Document": item?.data["Payment Document"],
          "Grn Number": item?.data["Grn Number"],
        };
        fOneBalanceSum += Number(debitAmount);
        insertDocuments.push(FCaseInstance);
      }
      // Save To Database
      try {
        if (insertDocuments.length > 0) {
          await FCase.insertMany(insertDocuments);
        }
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }

    // res.send({
    //   pOneBalanceSum,
    //   kOneBalanceSum,
    //   gOneBalanceSum,
    //   iOneBalanceSum,
    //   LOneBalanceSum,
    //   mOneBalanceSum,
    //   pTwoBalanceSum,
    //   kTwoBalanceSum,
    //   gTwoBalanceSum,
    //   iTwoBalanceSum,
    //   LThreeBalanceSum,
    //   mFiveBalanceSum,
    //   mFourBalanceSum,
    //   mThreeBalanceSum,
    //   LFourBalanceSum,
    //   mTwoBalanceSum,
    //   LTwoBalanceSum,
    //   aOneBalanceSum,
    //   fOneBalanceSum,
    // });
    return res.status(200).json({
      message: "ok",
      success: "ok",
    });
  } catch (error) {
    return res.status(500).json({ error: `Internal Server Error ${error}` });
  }
};
