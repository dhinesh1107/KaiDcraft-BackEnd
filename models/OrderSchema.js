import mongoose, { Schema } from "mongoose";

const OrderSchema = new mongoose.Schema({
    products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          count: Number,
        },
      ],
      paymentIntent: {},
      orderStatus: {
        type: String,
        default: "Not Processed",
        enum: [
          "Not Processed",
          "Processing",
          "Dispatched",
          "Cancelled",
          "Delivered",
        ],
      },
      orderby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Order", OrderSchema);