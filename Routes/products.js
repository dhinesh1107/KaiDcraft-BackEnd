import express from 'express'
import { 
    updateProduct, 
    getSingleProduct,
    getProduct,
    removeProduct,
    addProduct,
    rarting,
    uploadImgs,
    addToWishlist,
} from "../Controllers/productControllers.js";
import { authenticate, isAdmin } from '../auth/verifiyToken.js';
import { productImgResize, uploadPhoto } from '../middleware/uploadImages.js';

const router = express.Router()

router.get('/:id', getSingleProduct)//
router.get('/',getProduct)//
router.put('/wishlist', authenticate, addToWishlist)
router.put('/:id', authenticate, isAdmin, updateProduct)//
router.delete('/:id',authenticate, isAdmin, removeProduct)
router.post('/add',authenticate, isAdmin, addProduct)//
router.post('/upload',authenticate, isAdmin, uploadPhoto.array('images', 10), productImgResize, uploadImgs )

router.post('/rate', authenticate, rarting)


export default router;