
const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch(
            (err)=>{
            res.status(err.statusCode || 500).json({
            success:false,
            statusCode:err.statusCode || 500,
            message:err.message || "something went wrong",
            errors:err.errors || [],
    })
            })
    }

}

export {asyncHandler}