import { User } from "../models/userModels.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apierrorhandle.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloud,deleteFileOncloud } from "../utils/uploadFile.js";
import jwt from 'jsonwebtoken'


//GENEREATE TOKENS
const generateAccessAndRefreshTokens = async(user_id)=>{
  try {
    const user = await User.findById(user_id);
    const accesToken = user.accessTokenGen();
    const refToken = user.refreshTokenGen();
    user.refreshToken = refToken;
    await user.save({validateBeforeSave:false});

    return {accesToken,refToken};
  } catch (error) {
    console.log("Token Err",error)
    throw new ApiError(500,"Err in generating token")
  }
}





//Register User
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { userName, email, fullName, password} = req.body;
    if(!userName || !email || !fullName ||!password){
        throw new ApiError(401,"Inavlid Fileds......")
    }

    const avtarlocalfilepath = req.files?.avatar[0]?.path;
    if (!avtarlocalfilepath) {
        throw new ApiError(400, "Avatar file is required......")
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    const avtarimg = await uploadFileOnCloud(avtarlocalfilepath);
    const coverimg = await uploadFileOnCloud(coverImageLocalPath);

    const existedUser = await User.findOne({
        $or:[
            {email},{userName}
        ]
    });


     
    if (!existedUser) {
      const response = await new User({
        userName : userName.toLowerCase(),
        email,
        fullName,
        password,
        avatar : avtarimg.url,
        coverImage : coverimg?.url || ""
      }).save();
      return res.status(201).json(new ApiResponse(200, response, "User Created.."));
    }
    throw new ApiError(401,"Email already exist.....",)

  } catch (error) {
    console.log("Registration-Err", error);
    return res.status(500).send({data : new ApiResponse(500, error, "Internal server error..")})
  }
});



// LOGIN 
const loginUser = asyncHandler(async(req,res)=>{
  //email or username
  //find user
  //verify pass
  //gen token
  //send to user using cookies
    const {email,password,userName} = req.body;
    console.log(email,password,userName);
    if((!email && !userName) || !password){
        throw new ApiError(401,"Invalid fields....");
    }

    const user = await User.findOne({
        $or:[
            {email},{userName}
        ]
    });

    if(!user){
      throw new ApiError(400,"User does not exist....");
    }
    // console.log("user",user); 

    const validUser = await user.validatePassword(password);
    if(!validUser){
      throw new ApiError(401,"Invalid User....");
    }

    const data = await generateAccessAndRefreshTokens(user._id);
    const userinfo = {
      _id: user._id,
      userName: user.userName ,
      email: user.email ,
      fullName: user.fullName,
      avatar: user.avatar,
      watchHistory: user.watchHistory,
    }

    const options = {
      httpOnly :true,
      secure : true
    } 

    return res.status(200)
    .cookie("accessToken",data.accesToken,options)
    .cookie("refreshToken",data.refToken,options)
    .json(new ApiResponse(200,{
      userinfo,
      "accesToken" : data.accesToken,
      "refToken" : data.refToken
    }))
})





//LOG-OUT
const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,{
    $set:{
      refreshToken : null
    }},
    {
      new : true
    }
    )
    const options = {
      httpOnly :true,
      secure : true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json({message : "User logged out successfully"});
})



//Refresh Token Re-generated
const refreshAccessToken=asyncHandler(async(req,res)=>{
  try {
    const oldrefreshtoken = req.cookies?.refToken || req.body.refreshToken
    if(!oldrefreshtoken){
        throw new ApiError(401,"Unauthorized request...");
    }

    const decode = jwt.verify(oldrefreshtoken,process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decode._id).select("-password");
    if(!user){
        throw new ApiError(401,"Invalid refresh token......");
    }

    if(user?.refreshToken !== oldrefreshtoken){
      throw new ApiError(401,"Refresh token is expired or invalid...");
    }

    const data = await generateAccessAndRefreshTokens(user._id);
    const options = {
      httpOnly :true,
      secure : true
    } 

    return res.status(200)
    .cookie("accessToken",data.accesToken,options)
    .cookie("refreshToken",data.refToken,options)
    .json(new ApiResponse(200,{
      "accesToken" : data.accesToken,
      "refToken" : data.refToken},
      "Refresh token generated..."
      ))

} catch (error) {
  console.log("ref",error);
    console.log("Refresh-token",error);
    throw new ApiError(500,"Internal Server Error")
}
})




const changePassword = asyncHandler(async(req,res)=>{
try {
  const {password,newPassword} = req.body;
  const user = await User.findById(req.user._id);

  if(!user){
    throw new ApiError(400,"User not found");
  }
  const isvalid = await user.validatePassword(password);

  if(!isvalid){
    throw new ApiError(401,"Inavlid password....");
  }

  user.password = newPassword;
  await user.save({validateBeforeSave:false});

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"))
} catch (error) {
  console.log("changepass",error);
  throw new ApiError(500,"Internal Server Error")
}
   
})




const getCurrentUser = asyncHandler(async(req, res) => {
  return res
  .status(200)
  .json(new ApiResponse(
      200,
      req.user,
      "User fetched successfully"
  ))
})




const updateAccount=asyncHandler(async(req,res)=>{
  try {
    const {email,fullName} = req.body;
    if(!email && !fullName){
      throw new ApiError(401,"Bad request...");
    }
    const user = User.findByIdAndUpdate(req.user?._id,{
      $set:{
        fullName,
        email
      }},
      {
        new:true
      }).select("-password");
  
      return res
      .status(200)
      .json(new ApiResponse(200,user,"Account updated...."))
  } catch (error) {
    console.log("AccountUpErr",error);
    throw new ApiError(500,"Error in updating account..");
  }
})



const updateAvatar = asyncHandler(async(req,res)=>{
  try {
    const avtarimgPath = req.file?.path;
    if(!avtarimgPath){
      throw new ApiError(401,"Avatar image not found");
    }
    const user = await User.findById(req.user._id);
    if(!user){
      throw ApiError(400,"User not found");
    }
    const delres = deleteFileOncloud(user.avatar);
    // if(delres !== 'ok'){
    //   throw new ApiError(401,"Error in deleting avatar...");
    // }
    const avtarimg = await uploadFileOnCloud(avtarimgPath);
    if(!avtarimg.url){
      throw new ApiError(401,"Error in uploading avatar...");
    }
    const updatedUser = await User.findByIdAndUpdate(user?._id,{
      $set:{
        avatar:avtarimg?.url
      }},{
        new:true
      })
      return res
      .status(200)
      .json(new ApiResponse(200,updatedUser,"Avatar updated.."));
  } catch (error) {
    console.log("AvatarErr",error);
    throw new ApiError(500,"Error in uploading avatar..");
  }
})



const updateCover = asyncHandler(async(req,res)=>{
  try {
    const {coverimgPath} = req.file?.path;
    if(!coverimgPath){
      throw new ApiError(401,"Cover image not found");
    }
    const coverimg = await uploadFileOnCloud(coverimgPath);
    if(!coverimg.url){
      throw new ApiError(401,"Error in uploading cover...");
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
      $set:{
        coverImage:coverimg?.url
      }},{
        new:true
      })
      return res
      .status(200)
      .json(new ApiResponse(200,user,"Cover updated.."));
  } catch (error) {
    console.log("AvatarErr",error);
    throw new ApiError(500,"Error in uploading Cover..");
  }
})




export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccount,
  updateAvatar,
  updateCover
};
