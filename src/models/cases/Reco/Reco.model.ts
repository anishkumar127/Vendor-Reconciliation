import mongoose from "mongoose";

const yourSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uniqueId: { type: String, required: true },
    data: {
      Particular: { type: String, required: false },
      Annexure: { type: String, required: false },
      Company: { type: String, required: false },
      Vendor: { type: String, required: false },
      // "Vendor Name": { type: String, required: false },
      // "Vendor Code": { type: String, required: false },
    },
    total: {
      type: String,
    },
    "Vendor Name": { type: String, required: false },
    "Vendor Code": { type: String, required: false },
  },
  { timestamps: true }
);

const Reco = mongoose.model("Reco", yourSchema);

export default Reco;
