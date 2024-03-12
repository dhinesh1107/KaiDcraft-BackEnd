import User from '../models/UserSchema.js';
import Cart from '../models/CartSchema.js';
import Product from '../models/ProductSchema.js';
import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import { sendEmail } from './emailController.js';
import crypto from "crypto";
import Order from '../models/OrderSchema.js';
import uniqid from 'uniqid';


export const getSingleUser = async(req, res) => {
    const { id } = req.params
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {

    try {
        const getUser = await User.findById(id).select("-refreshToken").select("-password");

        res.status(200).json({success: true, message: 'User found',data: getUser})
    } catch (error) {
        res.status(404).json({success: false, message: 'Failed to get User'})
    }
}

};

export const getUser = async(req, res) => {

    try {
        const getUser = await User.find({}).select("-refreshToken").select("-password");

        res.status(200).json({success: true, message: 'User found',data: getUser})
    } catch (error) {
        res.status(404).json({success: false, message: 'Failed to get Product'})
    }

};

export const removeUser = async(req, res) => {
    const { id } = req.params
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {

    try {
        await User.findByIdAndDelete(id, {$set:req.body}, {new:true}).select("-refreshToken").select("-password");

        res.status(200).json({success: true, message: 'Successfully Deleted'})
    } catch (error) {
        res.status(500).json({success: false, message: 'Failed to Delete'})
    }
}

};

export const updateUser = async(req, res) => {
    const { id } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {

    try {
        const updatedUser = await User.findByIdAndUpdate(id, {$set:req.body}, {new:true}).select("-refreshToken").select("-password");

        res.status(200).json({success: true, message: 'Successfully updated',data: updatedUser})
    } catch (error) {
        res.status(500).json({success: false, message: 'Failed to update'})
    }
}

};

export const saveAddress = async(req, res, next) => {
    const { _id } = req.user;
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {

    try {
        const updatedUser = await User.findByIdAndUpdate(_id, {address:req?.body?.address}, {new:true}).select("-refreshToken").select("-password");

        res.status(200).json({success: true, message: 'Successfully updated',data: updatedUser})
    } catch (error) {
        res.status(500).json({success: false, message: 'Failed to update'})
    }
}

};

export const updatePassword = async(req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {
        const user = await User.findById(_id);
        if(password){
            const salt = await bcrypt.genSalt(10);
            const hashpassword = await bcrypt.hash(password, salt);
            user.password = hashpassword;
            const updatedPassword = await user.save();
            res.status(200).json({success: true, message: 'Successfully updated',data: updatedPassword})
        }
        else{
            res.status(500).json({success: false, message: 'Failed to update', data: user});
        }
    }
};

export const forgotPasswordToken = async(req, res) => {

    const { email } =req.body;
    const user = await User.findOne({ email });
    if(!user){
        res.status(401).json({success: false, message: 'This email is not found'});
    }
    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/v1/user/reset-password/${token}'>Click Here</>`;
        const data = {
            to: email,
            subject: "Forgot password Link",
            htm: resetURL,
            text: "Hey User",
        };
        sendEmail(data);
        res.status(200).json({success: true, token});
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false});
    }
};

export const resetPassword = async(req, res) => {
    const { password }= req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if(!user){
        res.status(401).json({success: false, message: 'Token Expired, Please try again'});
    }
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);
    user.password = hashpassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({success: true, user});
};

export const getWishlist = async(req, res) => {
    const { _id } = req.user;
    try {
        const finduser = await User.findById(_id).populate('wishlist');
        res.status(200).json({data: finduser});
    } catch (error) {
        console.log(error)
    }
};

export const usercart = async(req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {
    try {
      let products = [];
      const user = await User.findById(_id);
      // check if user already have product in cart
      const alreadyExistCart = await Cart.findOne({ orderby: user._id });
      if (alreadyExistCart) {
        //alreadyExistCart.remove();
        // const cartId = alreadyExistCart._id;
        // const products = [];
        // for (let i = 0; i < cart.length; i++) {
        //     let object = {};
        //     object.product = cart[i]._id;
        //     object.count = cart[i].count;
        //     let getPrice = await Product.findById(cart[i]._id).select("price").exec();
        //     object.price = getPrice.price;
        //    products.push(object);
        //   }
        //   let cartTotal = alreadyExistCart.cartTotal;
        //   for (let i = 0; i < products.length; i++) {
        //     cartTotal = cartTotal + products[i].price * products[i].count;
        //   }
        //   const updatedCart = await Cart.findByIdAndUpdate(cartId,
        //     { $push: {
        //         products: products,
        //     }, cartTotal, orderby: user?._id },
        //     {
        //         new: true
        //     })
        //     console.log(updatedCart)
          //res.status(200).json({data: updatedCart});
       res.status(401).json({message: 'cart already exist'});
      } else {
      for (let i = 0; i < cart.length; i++) {
        let object = {};
        object.product = cart[i]._id;
        object.count = cart[i].count;
        let getPrice = await Product.findById(cart[i]._id).select("price").exec();
        object.price = getPrice.price;
       products.push(object);
      }
      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count;
      }
      let newCart = await new Cart({
        products,
        cartTotal,
        orderby: user?._id,
      }).save();
      res.status(200).json({data: newCart});
    }
    } catch (error) {
      console.log(error);
    }
}
};

export const getUserCart = async(req, res) => {
    const { _id } = req.user;
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {
    try {
      const cart = await Cart.findOne({ orderby: _id }).populate(
        "products.product"
      );
      res.status(200).json({data: cart});
    } catch (error) {
        console.log(error);
    }
}
}; //checked

export const emptyUserCart = async(req, res) => {
    const { _id } = req.user;
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndDelete({ orderby: _id });
    res.status(200).json({success: true, message: 'User Cart removed', data: cart});
  } catch (error) {
    console.log(error);
    res.status(500).json({success: false});
  }
}
};//checked

export const createOrder = async(req, res) => {
  const { _id } = req.user;
  const isValid = mongoose.Types.ObjectId.isValid(_id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {
  try {
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({ orderby: user._id });
    let finalAmout = userCart.cartTotal;
    // if (couponApplied && userCart.totalAfterDiscount) {
    //   finalAmout = userCart.totalAfterDiscount;
    // } else {
    //   finalAmout = userCart.cartTotal;
    // }

    let newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: uniqid(),
        method: "COD",
        amount: finalAmout,
        status: "Processing",
        created: Date.now(),
        currency: "INR",
      },
      orderby: user._id,
      orderStatus: "Processing",
    }).save();
    // let update = userCart.products.map((item) => {
    //   return {
    //     updateOne: {
    //       filter: { _id: item.product._id },
    //       update: { $inc: { quantity: -item.count, sold: +item.count } },
    //     },
    //   };
    // });
    // const updated = await Product.bulkWrite(update, {});
    res.status(200).json({ success: false, newOrder});
  } catch (error) {
    console.log(error)
    res.status(500).json({success: false});
  }
}
}; //checked

export const getOrder = async(req, res) => {
    const { _id } = req.user;
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {
  try {
    const userorders = await Order.findOne({ orderby: _id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.status(200).json(userorders);
  } catch (error) {
    res.status(500).json({success: false});
  }
}
};// checked

export const getAllOrders = async(req, res) => {
    try {
        const alluserorders = await Order.find()
          .populate("products.product")
          .populate("orderby")
          .exec();
        res.status(200).json(alluserorders);
      } catch (error) {
        console.log(error)
        res.status(500).json({success: false});
      }
}; //cheaked

export const updateOrder = async(req, res) => {
    const { status } = req.body;
  const { _id } = req.user;
  const isValid = mongoose.Types.ObjectId.isValid(_id);
    if(!isValid){
        res.status(401).json({success: false, message: 'This id is not valid or not found'})
    } else {
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      _id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      { new: true }
    );
    res.status(200).json(updateOrderStatus);
  } catch (error) {
    console.log(error)
    res.status(500).json({success: false});
  }
}
}; //checked