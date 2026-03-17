import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { isValidObjectId } from "mongoose";



const getAllComments=asyncHandler(async(req,res)=>{
    const { videoId }=req.params
    const{page=1,limit=10}=req.query
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Video is missing")
    }
   const video= await Comment.find({
        video:videoId
    }).populate("owner","fullName userName avatar")
    .skip((page-1)*limit)
    .limit(Number(limit))
    return res.status(200).json(
        new ApiResponse(200,video,"comments fetched successfully")
    )

})

const addComment=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {content}=req.body
    if(!content){
        throw new ApiError(400,"Content is required")
    }
    const newComment=await Comment.create({
        content:content,
        owner:req.user._id,
        video:videoId

    })
    return res.status(200).json(
        new ApiResponse(200,newComment,"comment posted successfully")
    )
})



const updateComment=asyncHandler(async(req,res)=>{
    const {content}=req.body
    const {commentId}=req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"comment is missing")
    }
    if(!content){
        throw new ApiError(400,"content is required")
    }
    const comment=await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"comment not found")
    }
    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(404,"you dont have access")
    }
    const updatedComment=await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content:content
        }
    },{
        new:true
    })

    return res.status(200).json(new ApiResponse(200,updatedComment,"comment updated successfullyy"))

})


const deleteComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"invalid comment id")
    }
    const comment=await Comment.findById(commentId)
    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(404,"yop dont have access")
    }
    await Comment.findByIdAndDelete(commentId)
    return res.status(200).json(
        new ApiResponse(200,{},"comment deleted successfully")
    )

})



export {getAllComments,addComment,updateComment,deleteComment}