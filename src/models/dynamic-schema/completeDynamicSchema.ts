import mongoose, { Schema } from "mongoose";

export const yourSchemaComplete = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    uniqueId: { type: String, required: true },
    data: Schema.Types.Mixed,
  },
  { timestamps: true }
);

yourSchemaComplete.pre("validate", function (next) {
  const data = this.data;

  if (data?.["Debit Amount(INR)"]) {
    // Clean up Closing Balance field
    data["Debit Amount(INR)"] = cleanUpAmount(data?.["Debit Amount(INR)"]);
  }

  // Clean up Credit Amount field
  if (data?.["Credit Amount(INR)"]) {
    data["Credit Amount(INR)"] = cleanUpAmount(data?.["Credit Amount(INR)"]);
  }

  next();
});

function cleanUpAmount(closingBalance: any) {
  // Replace all special characters except digits, dots (.) and hyphens (-)
  const cleanedValue = closingBalance?.toString()?.replace(/[^\d.-]/g, "");
  // Convert to integer
  const integerValue = parseInt(cleanedValue, 10) || 0;

  return String(integerValue);
}
