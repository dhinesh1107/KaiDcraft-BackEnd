import mongoose, { Schema } from "mongoose";

const ProductDetailSchema = new mongoose.Schema({
    product_id: { type: Number},
    product_name: { type: String},
    img_path: { type: String},
    price: { type: Number},
    product_desc: { type: String},
    product_features: { 
        0: {type: String},
        1: {type: String},
        2: {type: String},
    },
    product_spec: { 
        size: { type: String},
        color: { type: String}
    }
});

export default mongoose.model("ProductDetail", ProductDetailSchema);