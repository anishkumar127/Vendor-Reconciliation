import mongoose, { Schema } from "mongoose";

export const yourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    uniqueId: { type: String, required: true },
    // data: {
    //   Vendor: { type: String, required: true },
    //   "Vendor Name": { type: String, required: true },
    //   "Document Number": { type: String, required: true },
    //   "Invoice Number": { type: String, required: true },
    //   "Closing Balance": { type: String, required: true },
    //   "Invoice Amount": { type: String, required: true },
    //   Currency: { type: String, required: true },
    //   "Due Date": { type: Date, required: true },
    //   "Document Date": { type: Date, required: true },
    // },
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

// WORKING BUT DON'T KNOW WHAT FIELD IS MISSING.
// yourSchema.pre("validate", function (next) {
//   const data = this.data as Record<string, any>;

//   const isValid = requiredFields?.every((field) => data && data[field]);

//   if (!isValid) {
//     this.invalidate("data", "Data is missing required fields.");
//   }

//   next();
// });
//
yourSchema.pre("validate", function (next) {
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

// yourSchema.path("data").validate(function (value: any) {
//   return requiredFields.every((field: any) => value && value[field]);
// }, "Data is missing required fields.");

// yourSchema.pre("save", function (next) {
//   // Validate that each required field is present in the 'data' field
//   for (const field of requiredFields) {
//     if (!this.data || !this.data[field]) {
//       return next(new Error(`${field} is required in the 'data' field.`));
//     }
//   }

//   // Continue with the save operation
//   next();
// });

// working  but it's not generate the error on insertMany.
// yourSchema.pre("insertMany", function (next, docs) {
//   const errors: string[] = [];

//   for (const doc of docs) {
//     for (const field of requiredFields) {
//       if (!doc.data || !doc.data[field]) {
//         errors.push(`${field} is required in the 'data' field.`);
//       }
//     }
//   }

//   if (errors.length > 0) {
//     // return next(new Error(errors.join(" ")));
//     const error = new Error(errors.join(" "));
//     console.error(error);
//     return next(error);
//   }

//   next();
// });
