import mongoose, { Schema } from "mongoose";

export const yourSchemaMaster = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    uniqueId: { type: String, required: true },
    data: Schema.Types.Mixed,
  },
  { timestamps: true }
);

const requiredFields = [
  "Vendor",
  "Vendor Name",
  "Document Number",
  "Invoice Number",
  "Closing Balance",
  "Invoice Amount",
  "Currency",
  "Due Date",
  "Document Date",
];

yourSchemaMaster.pre("validate", function (next) {
  const data = this.data as Record<string, any>;

  const missingFields = requiredFields.filter((field) => !data || !data[field]);

  if (missingFields.length > 0) {
    const errorMessage = `Data is missing required fields: ${missingFields.join(
      ", "
    )}`;
    this.invalidate("data", errorMessage);
  }

  next();
});
