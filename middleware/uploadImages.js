import multer from "multer";
import sharp from "sharp";
import path from 'path';
import fs from 'fs';

const __dirname = path.resolve();
const destination = `${__dirname}\\images\\`
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //cb(null, path.join(__dirname, "/public/images/")); //.replace("\\","/"))
      cb(null, destination);
    },
    filename: function (req, file, cb) {
      const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg");
    },
    path: function (req, res, cb) {
      console.log(req)
    }
  });

  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false);
    }
  };

export const uploadPhoto = multer({
    storage: storage,
    fileFilter: multerFilter,
    limits: { fieldSize: 1000000 },
});

export const productImgResize = async(req, res, next) => {
    console.log(req,"into product img resize")
    if(!req.body.files) return next();
    await Promise.all(
        req.body.files.map( async (file) => {
            await sharp(file.path)
            .resize(300,300)
            .toFormat('jpeg')
            .jpeg({quality: 100})
            .toFile(`images/products/${file.filename}`);
            fs.unlinkSync(`images/products/${file.filename}`);
        })
    );
    next();
}