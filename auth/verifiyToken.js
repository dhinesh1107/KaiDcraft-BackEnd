import jwt from 'jsonwebtoken';
import User from '../models/UserSchema.js';


export const authenticate = async(req, res, next) => {

    let token;
    if( req?.headers?.authorization?.startsWith("Beare")) {

        token = req.headers.authorization.split(" ")[1];
        try {
            if(token){
                const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
                const user = await User.findById(decode?.id);

               // console.log(user)
                req.user = user;
                next();
            }
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token Expired' })
            }

            return res.status(401).json({success: false, message: 'Invalid Token'})            
        }
    } else {
        return res.status(401).json({success: false, message: 'No header'})
    }
};

export const isAdmin = async(req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });

    if( adminUser.role !== "admin" ){
        return res.status(401).json({success: false, message: "you're not authorized"})
    } else {
        next();
    }
}