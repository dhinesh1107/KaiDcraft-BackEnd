import User from "../models/UserSchema.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import generateRefreshToken from "../auth/refreshToken.js";
import { sendEmail } from "./emailController.js";

const generateToken = user => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
        // expiresIn: Math.floor(Date.now() / 1000) + (60 * 60),
        expiresIn: "1d",
    })
}

export const register = async (req, res) => {
    const { email, name, password, phone, role } = req.body
    try {
        const user = await User.findOne({email})

        //check user
        if(user){
            return res.status(400).json({message: 'User already exist, try to login'})
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);

        //user = await User.findOne({email})

    
        const users = new User({
            name,
            email,
            password: hashpassword,
            phone,
            role,
        });
        const htm = `Hi ${name}, Thank You For registring in Kai_D_Carft Happy Knots, Email: ${email} and Password: ${password}`;
        const data = {
            to: email,
            subject: "Kai_D_Craft Registration",
            htm: htm,
            text: `Hey ${name}`,
        };
        sendEmail(data);

        await users.save();
        res.status(200).json({success: true, message: 'User successfully created'})

    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: 'Internal server error, try again'})
    }
};

export const login = async (req, res) => {

    const { email } = req.body;
    const user = await User.findOne({ email })

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: 'User not exist, try to register' })
        }

        //compare password
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password)

        if (!isPasswordMatch) {
            return res.status(400).json({ status: false, message: 'Invalid password' })
        }
        else {

            //get token
            const token = await generateToken(user);
            const refreshToken = await generateRefreshToken(user._id);
            const updateUser = await User.findByIdAndUpdate(user.id, {
                refreshToken: refreshToken,
            },
                {
                    new: true
                });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000
            });

            const { password, role, ...rest } = user._doc

            res.status(200).json({ status: true, message: 'Successfully Logged In', token, data: { ...rest }, role })
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to Login' })
    }
};

export const handleRefreshToken = async(req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken){
        res.status(401).json({success: false, message: 'No refresh Token'})
    };

    const refreshToken = cookie.refreshToken;

    const user = await User.findOne({ refreshToken });
    if(!user){
        res.status(401).json({success: false, message: 'No refresh Token present in db or not matched'});
    } 
    jwt.verify(refreshToken, process.env.JWT_SECRET_KEY,(err,decoded) => {
        if(err || user.id !== decoded.id ){
            res.status(401).json({success: false, message: 'Something went wrong with Refresh Token'});
        } 
        const accessToken = generateToken(user); 
        res.status(200).json({ status: true, accessToken })
    })
};

export const logout = async(req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken){
        res.status(401).json({success: false, message: 'No Refresh Token in Cookies'});
    }
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: true,
        });
        return res.sendStatus(204); // forbidden
    }
    await User.findOneAndUpdate({refreshToken}, {
        refreshToken: " ",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204); // forbidden
}