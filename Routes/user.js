import express from 'express'
import { 
    updateUser, 
    getSingleUser,
    getUser,
    removeUser,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    getWishlist,
    saveAddress,
    usercart,
    getUserCart,
    emptyUserCart,
    createOrder,
    getOrder,
    getAllOrders,
    updateOrder,
} from "../Controllers/userControllers.js";
import { authenticate, isAdmin } from '../auth/verifiyToken.js';

const router = express.Router();

router.get("/getallorders", authenticate, isAdmin, getAllOrders);
router.get("/get-orders", authenticate, getOrder);
router.get('/cart', authenticate, getUserCart);
router.get('/wishlist', authenticate, getWishlist);
router.get('/:id', authenticate, isAdmin, getSingleUser);
router.get('/', authenticate, isAdmin, getUser);

router.put("/order/update-order/:id", authenticate, isAdmin, updateOrder);
router.put('/password', authenticate, updatePassword);
router.put('/save-address', authenticate, saveAddress);
router.put('/:id', authenticate, isAdmin, updateUser);

router.post("/order", authenticate, createOrder);
router.post('/forgot-password', forgotPasswordToken);
router.post('/reset-password/:token', resetPassword);
router.post('/cart', authenticate, usercart);

router.delete("/empty-cart", authenticate, emptyUserCart);
router.delete('/:id',authenticate, isAdmin, removeUser);

export default router;