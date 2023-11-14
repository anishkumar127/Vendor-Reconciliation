import { Request, Response } from "express";
import { CompanyOpen } from "../../models/company.model";
import { VendorOpen } from "../../models/vendor.model";
import { Soa } from "../../models/soa.model";
import { CaseP } from "../../models/cases/case_p.model";

export const unmatchedDetectController = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  req: Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  res: Response
) => {
  const fullDetailsFile = await Soa?.find();
  const masterFileCompanyOpen = await CompanyOpen?.find();
  const vendorOpenData = await VendorOpen?.find();

  const extractedMasterData = masterFileCompanyOpen?.map((item) => ({
    vendorName: item?.data?.vendor_name,
    documentNo: item?.data?.document_no,
    invoiceNumber: item?.data?.invoice_number,
    closing_balance: item?.data?.closing_balance,
    completeInfo: item,
    ID :item?.user
  }));

  const extractedVendorData = vendorOpenData?.map((item: any) => ({
    vendorName: item?.data?.business_partner_name,
    documentNo: item?.data?.document_no,
    invoiceNumber: item?.data?.invoice_number,
    closing_balance: item?.data?.closing_balance,
    completeInfo: item,
  }));

  const matchedInvoiceNumberWithDifference = extractedMasterData
    ?.map((masterItem) => {
      const vendorItem = extractedVendorData?.find(
        (vendor) =>
          vendor?.completeInfo?.mixed_data?.invoice_number ===
          masterItem?.invoiceNumber
      );

      if (vendorItem && masterItem?.invoiceNumber === "anish") {
        const masterAmount = parseFloat(masterItem?.closing_balance || "0");
        const vendorAmount = parseFloat(
          vendorItem?.completeInfo?.mixed_data?.closing_balance || "0"
        );

        const amountDifference = masterAmount - vendorAmount;

        return { masterItem, vendorItem, amountDifference };
      }
      return null;
    })
    .filter(Boolean);

  // -3066.67
  if (matchedInvoiceNumberWithDifference[0]?.amountDifference !== 0) {
    const fullDetailsFileData = fullDetailsFile?.map((item: any) => ({
      documentNo: item?.data?.document_no,
      invoiceNumber: item?.data?.invoice_number,
      completeInfo: item,
    }));
    console.log(fullDetailsFileData);
    const matchedFullDetails = fullDetailsFileData
      ?.map((item) => {
        const masterItem = extractedMasterData?.find((master) => {
          return (
            master?.completeInfo?.mixed_data?.invoice_number ===
            item?.invoiceNumber
          );
        });

        if (masterItem && item?.invoiceNumber === "anish") {
          return { ...item };
        }
        return null;
      })
      .filter(Boolean);

      try {
        console.log(extractedMasterData)
        await CaseP.create({
          user: extractedMasterData[0]?.ID,
          // filename: originalname,
          // data: excelData[i],
          mixed_data:matchedFullDetails[0]?.completeInfo.mixed_data
        } as any);
      } catch (error) {
        console.log("error case p",error);
      }
    return res.json({
      matchedInvoiceNumberWithDifference,
      matchedFullDetails,
    });
  }

  return res.json({ matchedInvoiceNumberWithDifference });
  // return res.json({ extractedMasterData,extractedVendorData });
};
