import { User } from "../models/userModels.js";
import { ApiError } from "../utils/apierrorhandle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWt = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accesToken || req.header("Authorization")?.replace("Bearer ","");

        if(!token){
            throw new ApiError(401,"Unauthorized Access....");
        }
    
        const decode = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decode._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401,"Invalid acccess token......");
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("jwt-Err",error);
        throw new ApiError(500,"Internal Server Error")
    }
})