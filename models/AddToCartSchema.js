import mongoose, { Schema } from "mongoose";

const AddToCartSchema = new mongoose.Schema({
    product_id: { type: Number},
    product_name: { type: String}
});

export default mongoose.model("AddToCart", AddToCartSchema);