import { Subsciption } from "../models/subcription";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";



const subscription =asyncHandler(async(req,res)=>{
  const response =  await new Subsciption({
        subscriber:req.user._id,
        channel: req.params._id
    }).save({validateBeforeSave:false})
    return res.status(200).json(new ApiResponse(200,response,"Subscribe successfully......"));
})





export {
    subscription
}