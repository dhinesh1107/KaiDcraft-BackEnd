import mongoose, { Schema } from "mongoose";

const CartSchema = new mongoose.Schema({
    products: [
    {
        product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        },
        count: Number,
        price: Number,
    },
    ],
    cartTotal: Number,
    orderby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    },
},
    {
        timestamps: true,
    }
);

export default mongoose.model("Cart", CartSchema);