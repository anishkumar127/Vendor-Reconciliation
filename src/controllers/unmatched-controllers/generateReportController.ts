import { RecentIds } from "./../../models/mixed/RecentIds.model";
import { RequestHandler } from "express";
import { MasterOpen } from "../../models/Master.model";
import { getUser } from "../../services/auth";
import { VendorOpen } from "../../models/mixed/vendor.modal";
import { CompleteDetails } from "../../models/mixed/complete-details.model";

// export const generateReportController: RequestHandler = async (req, res) => {
//   const { vendorName } = req.body;
//   if (!vendorName)
//     return res.status(404).json({ error: "vendor name not found!" });
//   try {
//     const records = await MasterOpen.aggregate([
//       {
//         $project: {
//           _id: 1,
//           user: 1,
//           fileName: 1,
//           uniqueId: 1,
//           data: {
//             $objectToArray: "$data",
//           },
//         },
//       },
//       {
//         $unwind: "$data",
//       },
//       {
//         $match: {
//           "data.v.Vendor Name": vendorName,
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           user: { $first: "$user" },
//           fileName: { $first: "$fileName" },
//           uniqueId: { $first: "$uniqueId" },
//           data: { $push: "$data" },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           user: 1,
//           fileName: 1,
//           uniqueId: 1,
//           data: {
//             $arrayToObject: "$data",
//           },
//         },
//       },
//     ]);

//     if (records.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "No records found for the given vendor name." });
//     }

//     return res.json(records);
//   } catch (error) {
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// working it's giving different type of return.

// import { RequestHandler } from "express";
// import { MasterOpen } from "../../models/Master.model";

// export const generateReportController: RequestHandler = async (req, res) => {
//   const { vendorName } = req.body;
//   if (!vendorName) {
//     return res.status(404).json({ error: "Vendor name not found!" });
//   }

//   try {
//     const records = await MasterOpen.aggregate([
//       {
//         $project: {
//           _id: 1,
//           user: 1,
//           fileName: 1,
//           uniqueId: 1,
//           data: {
//             $objectToArray: "$data",
//           },
//         },
//       },
//       {
//         $unwind: "$data",
//       },
//       {
//         $addFields: {
//           data: {
//             $mergeObjects: [
//               "$data.v",
//               {
//                 _id: "$data.k",
//                 fileName: "$fileName",
//                 uniqueId: "$uniqueId",
//                 user: "$user",
//               },
//             ],
//           },
//         },
//       },
//       {
//         $match: {
//           "data.Vendor Name": vendorName,
//         },
//       },
//     ]);

//     if (records.length === 0) {
//       return res
//         .status(404)
//         .json({ error: "No records found for the given vendor name." });
//     }

//     return res.json(records);
//   } catch (error) {
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// other way.

// export const generateReportController: RequestHandler = async (req, res) => {
//   const { vendorName } = req.body;
//   if (!vendorName)
//     return res.status(404).json({ error: "vendor name not found!" });
//   try {
//     const token = (req as any)?.token;
//     const { _id }: any = await getUser(token);
//     const masterId = await RecentIds.findOne({ user: _id }).select("masterId");
//     if (!masterId)
//       return res.status(404).json({ error: "masterId not found!" });
//     if (!_id) return res.status(401).json({ error: "user not authenticated!" });
//     const masterData = await MasterOpen.findOne({
//       _id: masterId?.masterId,
//     }).select("data");
//     if (!masterData) return res.status(404).json({ error: "not data found!" });
//     const keysInsideData = Object.keys(masterData.data);
//     const valuesInsideData = Object.values(masterData.data);
//     const matchedData = valuesInsideData.filter((item: any) => {
//       console.log(item);
//       return item["Vendor Name"] === vendorName;
//     });

//     return res.json(matchedData);
//   } catch (error) {
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

export const generateReportController: RequestHandler = async (req, res) => {
  try {
    const { vendorName } = req.body;

    // Check if vendorName is provided
    if (!vendorName) {
      return res.status(400).json({ error: "Vendor name not provided!" });
    }

    const token = (req as any)?.token;
    const { _id }: any = await getUser(token);

    // Check if user is authenticated
    if (!_id) {
      return res.status(401).json({ error: "User not authenticated!" });
    }

    const masterId = await RecentIds.findOne({ user: _id }).select("masterId");

    // Check if masterId is found
    if (!masterId) {
      return res.status(404).json({ error: "MasterId not found!" });
    }

    const masterData = await MasterOpen.findOne({
      _id: masterId?.masterId,
    }).select("data");

    // Check if masterData is found
    if (!masterData) {
      return res.status(404).json({ error: "No data found!" });
    }

    const valuesInsideData = Object.values(masterData.data);

    // Filter data based on the condition
    const matchedData = valuesInsideData.filter((item: any) => {
      return item["Vendor Name"] === vendorName;
    });

    // return res.json(matchedData);

    // <---------------------------- VENDOR DATA ----------------------------------->
    const vendorId = await RecentIds.findOne({ user: _id }).select("vendorId");

    // Check if masterId is found
    if (!vendorId) {
      return res.status(404).json({ error: "vendorId not found!" });
    }

    const vendorData = await VendorOpen.findOne({
      _id: vendorId?.vendorId,
    }).select("data");

    // Check if masterData is found
    if (!vendorData) {
      return res.status(404).json({ error: "No data found!" });
    }

    const valuesInsideVendorData = Object.values(vendorData.data);

    // Filter data based on the condition
    const matchedVendorData = valuesInsideVendorData.filter((item: any) => {
      return matchedData.some(
        (matchedItem: any) =>
          matchedItem["Invoice Number"] === item["Invoice Number"]
      );
    });

    const difference = await BalanceDifferenceCheck(
      matchedData,
      matchedVendorData
    );
    // return res.json(matchedData);
    // return res.json({ diff: difference });

    if (difference?.difference !== 0) {
      // <---------------------------- FULL DETAILS DATA ----------------------------------->
      const detailsId = await RecentIds.findOne({ user: _id }).select(
        "detailsId"
      );

      // Check if masterId is found
      if (!detailsId) {
        return res.status(404).json({ error: "detailsId not found!" });
      }

      const fullDetailsData = await CompleteDetails.findOne({
        _id: detailsId?.detailsId,
      }).select("data");

      // Check if masterData is found
      if (!fullDetailsData) {
        return res.status(404).json({ error: "No data found!" });
      }

      const valuesInsideFullDetailsData = Object.values(fullDetailsData?.data);

      // Filter data based on the condition
      const matchedFullDetailsData = valuesInsideFullDetailsData.filter(
        (item: any) => {
          // return matchedData.some(
          //   (matchedItem: any) =>
          //     matchedItem["Invoice Number"] === item["Invoice Number"]
          // );
          return (
            item["Invoice Number"] === difference?.masterData["Invoice Number"]
          );
        }
      );
      await generateCasePController(res, matchedFullDetailsData);
      //return res.json({ matchedFullDetailsData });
      return;
    }
    return res.json({ diff: difference });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const BalanceDifferenceCheck = async (masterData: any, vendorData: any) => {
  try {
    // Extracting relevant values from masterData
    const masterInvoiceAmount = parseFloat(
      masterData[0]["Invoice Amount"].replace(/,/g, "")
    );

    // Extracting relevant values from vendorData
    const vendorClosingBalance = parseFloat(
      vendorData[0]["Closing Balance"].replace(/,/g, "")
    );

    // Calculate the difference
    const difference = masterInvoiceAmount - vendorClosingBalance;

    console.log(`Difference: ${difference}`);

    // Return an object containing masterData, vendorData, and the difference
    return {
      masterData: masterData[0],
      vendorData: vendorData[0],
      difference: difference,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error calculating balance difference");
  }
};

// old wokrking way in this working the basic only balance differnce.

// const BalanceDifferenceCheck = async (masterData: any, vendorData: any) => {
//   try {
//     // Extracting relevant values from masterData
//     const masterInvoiceAmount = parseFloat(
//       masterData[0]["Invoice Amount"].replace(/,/g, "")
//     );

//     // Extracting relevant values from vendorData
//     const vendorClosingBalance = parseFloat(
//       vendorData[0]["Closing Balance"].replace(/,/g, "")
//     );

//     // Calculate the difference
//     const difference = masterInvoiceAmount - vendorClosingBalance;

//     console.log(`Difference: ${difference}`);

//     return difference;
//   } catch (error) {
//     console.error(error);
//     throw new Error("Error calculating balance difference");
//   }
// };

// GENERATE XLSX

import fs from "fs";
import XLSX from "xlsx";
import path from "path";

//  SAVING ON SERVER  BUT NOT FREE ON SERVERLESS

// export const generateCasePController = async (
//   res: any,
//   forGenerateData: any
// ) => {
//   try {
//     const worksheet = XLSX.utils.json_to_sheet(forGenerateData);

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "CaseP Data");

//     const tempFilePath = path.join(__dirname, "../../../public/CasePData.xlsx");
//     XLSX.writeFile(workbook, tempFilePath);
//     console.log({ tempFilePath });
//     res.download(tempFilePath, "CasePData.xlsx", (err: any) => {
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
//   return res.json({ message: "downloading done!" });
//   // return res.json({ extractedMasterData,extractedVendorData });
// };

// DIRECT SEND TO CLIENT.

export const generateCasePController = async (
  res: any,
  forGenerateData: any
) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(forGenerateData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CaseP Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    res.attachment("CasePData.xlsx"); // Set the filename for download
    res.type(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ); // Set content type for Excel

    res.send(Buffer.from(excelBuffer)); // Send the Excel buffer directly to the client
  } catch (error) {
    console.error("Error generating Excel file:", error);
    return res.status(500).json({ error: "Failed to generate Excel file" });
  }
};
