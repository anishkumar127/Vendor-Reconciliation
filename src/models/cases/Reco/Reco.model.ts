import mongoose from "mongoose";

const yourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uniqueId: { type: String, required: true, index: true },
    data: {
      Particular: { type: String, required: false },
      Annexure: { type: String, required: false },
      "Company Open": { type: String, required: false },
      "Vendor Open": { type: String, required: false },
      Difference: { type: String, required: false },
      // "Vendor Name": { type: String, required: false },
      // "Vendor Code": { type: String, required: false },
    },
    companyTotal: {
      type: String,
    },
    vendorTotal: {
      type: String,
    },
    "Vendor Name": { type: String, required: false },
    "Vendor Code": { type: String, required: false },
  },
  { timestamps: true }
);

const Reco = mongoose.model("Reco", yourSchema);

export default Reco;
