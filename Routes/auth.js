import express from 'express';
import cors from "cors";
import { register, login, handleRefreshToken, logout, } from '../Controllers/authControllers.js';

const router = express.Router()

router.options('/login',cors());

router.post('/register',cors(), register);
router.post('/login', cors(), login);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logout);
 
export default router;