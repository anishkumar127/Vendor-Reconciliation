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
    data["Debit Amount(INR)"] = cleanUpClosingBalance(
      data?.["Debit Amount(INR)"]
    );
  }

  next();
});
// Define the cleanUpClosingBalance function to remove special characters
function cleanUpClosingBalance(closingBalance: any) {
  // Replace all special characters except digits, dots (.) and hyphens (-)
  const cleanedValue = closingBalance?.toString()?.replace(/[^\d.-]/g, "");
  // Convert to floating-point number
  const floatValue: any = parseFloat(cleanedValue);

  // Convert to integer
  const integerValue = parseInt(floatValue, 10) ?? 0;

  return String(integerValue);
}
