import {v2 as cloudinary} from 'cloudinary';
import { log } from 'console';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config(); // ✅ Load env variables early


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });

        console.log("✅ File uploaded on Cloudinary:", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.error("❌ Cloudinary Upload Error:", error.message);
        fs.unlinkSync(localFilePath); // Remove temp file
        return null;
    }
};

export {uploadOnCloudinary}