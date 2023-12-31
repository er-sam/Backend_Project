const asyncHandler=(requestHnadlerfn)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHnadlerfn(req,res,next))
        .catch((err)=>next(err))
    }
}

export {asyncHandler}