import Product from '../models/ProductSchema.js';
import User from '../models/UserSchema.js';
import mongoose from "mongoose";
import { cloudinaryUploadImg } from '../utils/cloudinary.js';
import fs from 'fs';

export const addProduct = async(req, res)=> {
    const { name, price, img_path, ratings, cat, description } = req.body

    try {
        let product = null

        product = await Product.findOne({name});

        console.log(req.body);

        if(product){
            return res.status(400).json({message: 'product already exist, try to another'})
        }
        else {
            product = new Product({
                name,
                price,
                img_path,
                ratings,
                cat,
                description
            })
        }
        await product.save();
        res.status(200).json({success: true, message: 'Product successfully Added', product})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error, try again'})
    } 
};

export const getSingleProduct = async(req, res) => {
    const { id } = req.params
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {

    try {
        const getProduct = await Product.findById(id)

        res.status(200).json({success: true, message: 'Product Product found',data: getProduct})
    } catch (error) {
        res.status(404).json({success: false, message: 'Failed to get Product'})
    }
}

};

export const getProduct = async(req, res) => {

    try {
        const getProduct = await Product.find({})

        res.status(200).json({success: true, message: 'Product Product found',data: getProduct})
    } catch (error) {
        res.status(404).json({success: false, message: 'Failed to get Product'})
    }

};

export const removeProduct = async(req, res) => {
    const { id } = req.params
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {

    try {
        await Product.findByIdAndDelete(id, {$set:req.body}, {new:true})

        res.status(200).json({success: true, message: 'Successfully Deleted'})
    } catch (error) {
        res.status(500).json({success: false, message: 'Failed to Delete'})
    }
}

};

export const updateProduct = async(req, res) => {
    const { id } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, {$set:req.body}, {new:true})

        res.status(200).json({success: true, message: 'Successfully updated',data: updatedProduct})
    } catch (error) {
        res.status(500).json({success: false, message: 'Failed to update'})
    }
}

};

export const rarting = async(req, res) => {

    const { _id, name } = req.user;
    const { star, prodId,comment } = req.body;
    try {
        const product = await Product.findById(prodId);
        let alreaddyRated = product.ratings.find((userId) => userId.postedbyId.toString() === _id.toString());
        if (alreaddyRated) {
            const updateRating = await Product.updateOne(
                {
                ratings: {$elemMatch: alreaddyRated},
            },
            {
                $set: {"ratings.$.star": star, "ratings.$.comment": comment}
            },
            {
                new: true,
            }
            );
        } else {
            const rateProd = await Product.findByIdAndUpdate(
                prodId, 
                {
                $push: {
                    ratings: {
                        star: star,
                        postedbyId: _id,
                        postedby_name: name,
                        comment: comment,
                    },
                },
                }, 
                {
                    new: true,
                });
        }
        const getallratings = await Product.findById(prodId);
        let totalRating = getallratings.ratings.length;
        let ratingsum = getallratings.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);
        let actualRating = Math.round(ratingsum / totalRating);
        let finalproduct = await Product.findByIdAndUpdate(
            prodId,
            {
              totalrating: actualRating,
            },
            { new: true }
          );
          res.status(200).json({success: true, message: 'Successfully Rated',data: finalproduct})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Failed to update'})
    }

};

export const addToWishlist = async(req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $pull: {wishlist: prodId},
                },
                {
                    new: true,
                }
            );
            res.status(200).json({data: user})
        } else {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $push: { wishlist: prodId },
                },
                {
                    new: true,
                }
            );
            res.status(200).json({data: user})
        }

    } catch (error) {
        console.log(error);
    }
};

export const uploadImgs = async(req, res) => {
    console.log(req.files)
    // const { id } = req.params;
    // const isValid = mongoose.Types.ObjectId.isValid(id);
    // if(!isValid){
    //     res.status(401).json({success: false, message: 'This id is not valid or not found'})
    // } else {
        try {
            const uploader = (path) => cloudinaryUploadImg(path, "images");
            const urls = [];
            const files = req.files;
            for( const file of files){
                const { path } = file;
                const newpath = await uploader(path);
                urls.push(newpath);
                //fs.unlinkSync(path);
            }
            console.log(urls)
            // const findproduct = await Product.findByIdAndUpdate( id, 
            // {
            //     img_path: urls.map((file)=> {
            //         return file;
            //     }),
            // },
            // {
            //     new: true,
            // });
        res.status(200).json({success: true, data: urls})
        } catch (error) {
            console.log(error)
            res.status(500).json({success: false, message: 'Failed to update'})
        }
    //}
};