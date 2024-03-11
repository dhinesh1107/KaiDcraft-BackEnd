import mongoose, { Schema } from "mongoose";

const ProductSchema = new mongoose.Schema({
    id: { type: Number},
    name: { type: String},
    price: { type: Number},
    img_path: [],
    ratings: [
        { 
            star: Number, 
            comment: String,
            postedbyId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
            postedby_name: { type: String }
        },
    ],
    cat : {type: String, require: true},
    totalrating: {
        type: String,
        default: 0,
    },
    description : {type: String, require: true},
});

export default mongoose.model("Product", ProductSchema);