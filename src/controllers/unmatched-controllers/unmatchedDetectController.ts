import { Request, Response } from "express";
import { CompanyOpen } from "../../models/company.model";
import { VendorOpen } from "../../models/vendor.model";

export const unmatchedDetectController = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  req: Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  res: Response
) => {
    const masterFileCompanyOpen = await CompanyOpen.find();
    // console.log(masterFileCompanyOpen);

    const extractedMasterData = masterFileCompanyOpen.map((item) => ({
      vendorName: item?.data?.vendor_name,
      documentNo: item?.data?.document_no,
      invoiceNumber: item?.data?.invoice_number,
      closing_balance: item?.data?.closing_balance,
      completeInfo:item
    }));

    const vendorOpenData = await VendorOpen?.find();
    const extractedVendorData = vendorOpenData?.map((item:any) => ({
      vendorName: item?.data?.vendor_name,
      documentNo: item?.data?.document_no,
      invoiceNumber: item?.data?.invoice_number,
      closing_balance: item?.data?.closing_balance,
      completeInfo:item
    }));

    // const matchedInvoiceNumber = extractedMasterData?.filter((item) =>
    //   extractedVendorData
    //     ?.map((x) => x?.completeInfo?.mixed_data?.invoice_number)
    //     ?.includes(item?.invoiceNumber)
    // );

    const matchedInvoiceNumberWithDifference = extractedMasterData?.filter((masterItem) => {
      const vendorItem = extractedVendorData?.find(
        (vendor) => vendor?.completeInfo?.mixed_data?.invoice_number === masterItem?.invoiceNumber
      );
    
      if (vendorItem && masterItem?.invoiceNumber === "anish") {
        const masterAmount = parseFloat(masterItem?.closing_balance || '0'); 
        const vendorAmount = parseFloat(vendorItem?.completeInfo?.mixed_data?.closing_balance || '0'); 
    
        const amountDifference = masterAmount - vendorAmount;
        console.log("m",masterAmount,"v",vendorAmount);
        return { ...masterItem, amountDifference };
      }
      return false;
    }).filter(Boolean)
    

   return res.json({matchedInvoiceNumberWithDifference})
    // return res.json({ extractedMasterData,extractedVendorData });
};

