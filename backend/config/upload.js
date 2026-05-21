// import fs from "fs/promises";
// import dotenv from "dotenv";
// import { v2 as cloudinary } from "cloudinary";



// dotenv.config({ path: "../.env" });

// const hasCloudinaryConfig = () =>
//   Boolean(
//     process.env.CLOUDINARY_CLOUD_NAME &&
//       process.env.CLOUDINARY_API_KEY &&
//       process.env.CLOUDINARY_API_SECRET
//   );

// const configureCloudinary = () => {
//   if (!hasCloudinaryConfig()) return false;

//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   });

//   return true;
// };

// export const uploadFile = async (file, folder = "fynk") => {
//   if (!file) {
//     return {
//       media: "",
//       mediaUrl: "",
//       mediaPublicId: "",
//       fileType: "",
//       storageProvider: "local",
//     };
//   }

//   if (configureCloudinary()) {
//     const result = await cloudinary.uploader.upload(file.path, {
//       folder,
//       resource_type: "auto",
//     });

//     await fs.unlink(file.path).catch(() => {});

//     return {
//       media: result.secure_url,
//       mediaUrl: result.secure_url,
//       mediaPublicId: result.public_id,
//       fileType: file.mimetype,
//       storageProvider: "cloudinary",
//     };
//   }

//   return {
//     media: file.filename,
//     mediaUrl: "",
//     mediaPublicId: "",
//     fileType: file.mimetype,
//     storageProvider: "local",
//   };
// };
// console.log(process.env.CLOUDINARY_CLOUD_NAME);
// console.log(process.env.CLOUDINARY_API_KEY);
// console.log(process.env.CLOUDINARY_API_SECRET);

import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

dotenv.config();

const hasCloudinaryConfig = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const configureCloudinary = () => {
  if (!hasCloudinaryConfig()) return false;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return true;
};

const uploadFromBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const uploadFile = async (file, folder = "fynk") => {
  if (!file) {
    return {
      media: "",
      mediaUrl: "",
      mediaPublicId: "",
      fileType: "",
      storageProvider: "local",
    };
  }

  if (configureCloudinary()) {
    const result = await uploadFromBuffer(file.buffer, folder);
    return {
      media: result.secure_url,
      mediaUrl: result.secure_url,
      mediaPublicId: result.public_id,
      fileType: file.mimetype,
      storageProvider: "cloudinary",
    };
  }

  return {
    media: file.originalname,
    mediaUrl: "",
    mediaPublicId: "",
    fileType: file.mimetype,
    storageProvider: "local",
  };
};
