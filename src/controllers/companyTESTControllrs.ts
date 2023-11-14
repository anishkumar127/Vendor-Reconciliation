import { Request, Response } from "express";
import { CompanyOpen } from "../models/company.model";
import { masterCompanyConstants } from "../constants/Constants";
export const companyTESTControllrs = async (req: Request, res: Response) => {
  try {
    const model: any = CompanyOpen;
    const {
      selectedFieldAssociations: receivedData,
      user,
      originalFileName,
    } = req.body;
    const allFieldsSelected = Object.values(receivedData)?.length<masterCompanyConstants?.length;
    if(allFieldsSelected){
        return res.status(404).json({error:'Please select all fields'})
    }
    const result = masterCompanyConstants?.map((item) => {
      const isKeyExist = Object.keys(receivedData)?.some((key) => key === item);
      if (isKeyExist) {
        return { [item]: receivedData[item]?.data };
      } else {
        return { [item]: null };
      }
    });

    const numberOfRows =
      result && result.length > 0
        ? result[0][Object.keys(result[0])[0]].length
        : 0;

    for (let i = 0; i < numberOfRows; i++) {
      const dataObj: any = {};
      result?.forEach((fieldData) => {
        const fieldName = Object.keys(fieldData)[0];
        const fieldValue = fieldData[fieldName][i];
        dataObj[fieldName] = fieldValue;
      });

      console.log("dataObj", dataObj);

      const mixedData: any = {};
         Object.keys(receivedData)?.forEach((key) => {
        console.log(receivedData[key]);
        const dataForKey = receivedData[key]?.data;
        if (dataForKey && i < dataForKey.length) {
          mixedData[receivedData[key]?.label] = dataForKey[i];
        }
      });
    
      await model.create({
        user: user,
        filename: originalFileName,
        data: dataObj,
        mixed_data: mixedData,
      } as any);
    }
    return res.json({ success: "Uploaded Successfully!" });
  } catch (error) {
    console.log(error);
    return res.json(400).json({ error });
  }
};
