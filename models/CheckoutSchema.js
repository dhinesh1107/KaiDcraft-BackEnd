import mongoose from "mongoose";

const checkoutSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: Number, required: true },
    region: { type: String, required: true },
    billing_address: {
      email: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: Number, required: true },
      region: { type: String, required: true },
    }
    // isPaid: {
    //   type: Boolean,
    //   default: true,
    // },
  },
  { timestamps: true }
);

export default mongoose.model("checkout", checkoutSchema);
