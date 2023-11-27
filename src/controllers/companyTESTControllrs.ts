import { Request, Response } from "express";
import { CompanyOpen } from "../models/company.model";
import { masterCompanyConstants } from "../constants/Constants";
// export const companyTESTControllrs = async (req: Request, res: Response) => {
//   try {
//     const model: any = CompanyOpen;
//     const {
//       selectedFieldAssociations: receivedData,
//       user,
//       originalFileName,
//     } = req.body;

//     const isMissingOrEmpty = masterCompanyConstants.some((key) => {
//       return !(key in receivedData) || !receivedData[key]?.label?.trim();
//     });

//     if (isMissingOrEmpty) {
//       return res.status(404).json({ error: "Please select all fields" });
//     }

//     // make manditory field data.
//     const manditoryFeild: any = [];
//     masterCompanyConstants?.some((key) => {
//       if (key in receivedData && receivedData[key]?.label?.trim()) {
//         const obj: any = {};
//         obj[key] = receivedData[key].data;
//         manditoryFeild.push(obj);
//       }
//     });
//     // make not maditory field data.
//     const notManditoryFeild: any[] = [];
//     Object.keys(receivedData)?.forEach((key) => {
//       const isKeyNotPresent = masterCompanyConstants.includes(key);
//       console.log(key, isKeyNotPresent);
//       if (!isKeyNotPresent) {
//         const obj: any = {};
//         obj[key] = receivedData[key];
//         notManditoryFeild.push(obj);
//       }
//     });
//     const combinedData: any = [...manditoryFeild, ...notManditoryFeild]?.reduce(
//       (acc, obj) => {
//         return { ...acc, ...obj };
//       },
//       {}
//     );
//     const keysData = Object.keys(combinedData);

//     const maxDataLength: any = Object.values(combinedData).reduce(
//       (max: any, arr: any) => (arr.length > max ? arr.length : max),
//       0
//     );

//     for (let i = 0; i < maxDataLength; i++) {
//       const dataObj: { [key: string]: string | number | null } = {};

//       keysData.forEach((key) => {
//         const valueAtIndex = combinedData[key]?.[i];
//         if (valueAtIndex !== undefined) {
//           dataObj[key] = valueAtIndex;
//         }
//       });
//       try {
//         await model.create({
//           user: user,
//           filename: originalFileName,
//           data: dataObj,
//           mixed_data: dataObj,
//         });
//       } catch (error) {
//         console.log("Model error:", error);
//       }
//     }
//     return res.json({ success: "Uploaded Successfully!" });
//   } catch (error) {
//     console.log(error);
//     return res.json(400).json({ error });
//   }
// };


interface ReceivedData {
  [key: string]: {
    label: string;
    data: (string | number | null)[];
  };
}

export const companyTESTControllrs = async (req: Request, res: Response) => {
  try {
    const model: typeof CompanyOpen = CompanyOpen;
    const {
      selectedFieldAssociations: receivedData,
      user,
      originalFileName,
    }: {
      selectedFieldAssociations: ReceivedData;
      user: string;
      originalFileName: string;
    } = req.body;

    // Check for missing or empty fields
    const isMissingOrEmpty = masterCompanyConstants?.some((key) => {
      return !(key in receivedData) || !receivedData[key]?.label?.trim();
    });

    if (isMissingOrEmpty) {
      return res.status(400).json({ error: "Please select all fields" });
    }

    // Extract mandatory and non-mandatory fields
    const mandatoryFields: any[] = [];
    const nonMandatoryFields: any[] = [];

    Object.keys(receivedData)?.forEach((key) => {
      if (masterCompanyConstants?.includes(key) && receivedData[key]?.label?.trim()) {
        const obj: any = {};
        obj[key] = receivedData[key].data;
        mandatoryFields.push(obj);
      } else {
        const obj: any = {};
        obj[key] = receivedData[key];
        nonMandatoryFields.push(obj);
      }
    });

    // Combine mandatory and non-mandatory fields
    const combinedData: any = [...mandatoryFields, ...nonMandatoryFields]?.reduce(
      (acc, obj) => {
        return { ...acc, ...obj };
      },
      {}
    );

    const keysData = Object.keys(combinedData);

    // Find max data length
    const maxDataLength: number = Object.values(combinedData)?.reduce(
      (max: number, arr: any) => (arr.length > max ? arr.length : max),
      0
    );

    for (let i = 0; i < maxDataLength; i++) {
      const dataObj: { [key: string]: string | number | null } = {};

      keysData?.forEach((key) => {
        const valueAtIndex = combinedData[key]?.[i];
        if (valueAtIndex !== undefined) {
          dataObj[key] = valueAtIndex;
        }
      });

      try {
        await model.create({
          user: user,
          filename: originalFileName,
          data: dataObj,
          mixed_data: dataObj,
        });
      } catch (error) {
        console.log("Model error:", error);
      }
    }

    return res.json({ success: "Uploaded Successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Bad Request" });
  }
};
