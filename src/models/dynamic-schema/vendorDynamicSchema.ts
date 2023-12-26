import mongoose, { Schema } from "mongoose";

export const yourSchemaVendor = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    uniqueId: { type: String, required: true },
    data: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// const requiredFields = [
// "Business Partner",
// "Business Partner Name",
// "Closing Balance",
// "Invoice Amount",
// "Currency",
// "Due Date",
// "Document Date",
// "Document Number",
//   "Invoice Number",
// ];

// yourSchemaVendor.pre("validate", function (next) {
//   const data = this.data as Record<string, any>;

//   const missingFields = requiredFields.filter((field) => !data || !data[field]);

//   if (missingFields.length > 0) {
//     const errorMessage = `Data is missing required fields: ${missingFields.join(
//       ", "
//     )}`;
//     this.invalidate("data", errorMessage);
//   }

//   next();
// });
