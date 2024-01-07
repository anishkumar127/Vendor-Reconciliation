import mongoose, { Schema } from "mongoose";

export const yourSchemaVendor = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true, index: true },
    uniqueId: { type: String, required: true, index: true },
    data: Schema.Types.Mixed,
  },
  { timestamps: true }
);

yourSchemaVendor.pre("validate", function (next) {
  const data = this.data;

  if (data?.["Closing Balance"]) {
    // Clean up Closing Balance field
    data["Closing Balance"] = cleanUpClosingBalance(data["Closing Balance"]);
  }

  next();
});
function cleanUpClosingBalance(closingBalance: any) {
  // Replace all special characters except digits, dots (.) and hyphens (-)
  const cleanedValue = closingBalance?.toString()?.replace(/[^\d.-]/g, "");

  // console.log(cleanedValue);
  // Convert to integer
  const integerValue = parseInt(cleanedValue, 10) || 0;

  return String(integerValue);
}
