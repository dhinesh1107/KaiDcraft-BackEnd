import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from './Routes/auth.js';
import productRoute from './Routes/products.js';
import user from './Routes/user.js';
import morgan from "morgan"; 

dotenv.config();

const app = express()
const port = process.env.PORT || 8000

const corsOption = {
    origin: true
}

app.get('/', (req,res) => {
    res.send('API is working')
})

//db connection
mongoose.set('strictQuery', false)
const connectDB = async()=> {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('db connected');
    } catch (err) {
        console.log(err);
    }
}

//middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/product', productRoute);
app.use('/api/v1/user', user);

app.listen(port, () => {
    connectDB();
    console.log("server is running on " + port);
});