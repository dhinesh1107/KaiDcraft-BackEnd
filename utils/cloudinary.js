import cloudinary from 'cloudinary';
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

export const cloudinaryUploadImg = async(fileToUploads) => {
    return new Promise((resolve) => {
        cloudinary.uploader.upload(fileToUploads, (result) => {
            resolve(
            {
                url: result.secure_url
            },
            {
                resorce_type: "auto"
            }
            );
        });
    });
};
