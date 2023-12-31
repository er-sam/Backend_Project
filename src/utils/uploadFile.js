import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

      
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadFileOnCloud=async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
        const response = cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })
        console.log("File hasbeen uploaded on cloudinary...");
        return response;
    } catch (error) {
        console.log("File-Upload-Err",error);
        fs.unlink(localFilePath);
        return null;
    }
}



const deleteFileOncloud= async(avatar)=>{
    try {
        const q = avatar.split("/").pop().split(".")[0];
        return await cloudinary.uploader.destroy(q);
    } catch (error) {
        console.log("avatardel",error);
        // throw new ApiError(500,error.message);
    }
}

export {uploadFileOnCloud,deleteFileOncloud};