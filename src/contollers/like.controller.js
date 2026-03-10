import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { isValidObjectId } from "mongoose"
import { Like } from "../models/likes.model.js"




const toggleVideoLike=asyncHandler(async(req,res)=>{
    const { videoId }=req.params
    if(!videoId){
        throw new ApiError(400,"Video is missing")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"video not found")
    }
    const likeExist=await Like.findOne({
        likesBy:req.user._id,
        video:videoId
    })
    if(likeExist){
        await Like.findOneAndDelete({
            likesBy:req.user._id,
            video:videoId
        })
        return res.status(200).json(
            new ApiResponse(200,{isLiked:false},"disliked successfully")
        )
    }
    await Like.create({
        likesBy:req.user._id,
        video:videoId,
    })
    return res.status(200).json(
        new ApiResponse(200,{isliked:true},"likes successfully")
    )

})

const toggleTweetLike=asyncHandler(async(req,res)=>{
    const{ tweetId }=req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError (400,"video not found")
    }
    const likeExist=await Like.findOne({
        likesBy:req.user._id,
        tweet:tweetId
    })
    if(likeExist){
       await Like.findOneAndDelete({
        likesBy:req.user._id,
        tweet:tweetId
       })
       return res.status(200).json(
        new ApiResponse(200,{isLiked:false},"disliked successfully")
       )
    }
    await Like.create({
        likesBy:req.user._id,
        tweet:tweetId
    })
    return res.status(200).json(new ApiResponse(200,{isLiked:true},"liked successfully"))

})


const toggleCommentLike=asyncHandler(async(req,res)=>{
    const { commentId }=req.params
    if(!commentId){
        throw new ApiError(400,"comment is missing")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"comment not found")
    }
    const likeExist=await Like.findOne({
        likesBy:req.user._id,
        comment:commentId
    })
    if(likeExist){
        await Like.findOneAndDelete({
            likesBy:req.user._id,
            comment:commentId
        })
        return res.status(200).json(
            new ApiResponse(200,{isLiked:false},"disliked successfully")
        )
    }
    await Like.create({
        likesBy:req.user._id,
        comment:commentId,
    })
    return res.status(200).json(
        new ApiResponse(200,{isliked:true},"likes successfully")
    )

})



const getLikedVideos=asyncHandler(async(req,res)=>{
    const likedVideos=await Like.find({
        likesBy:req.user._id,
        video:{$ne:null}
    }).populate("video")
    return res.status(200).json(
        new ApiResponse(200,likedVideos,"videos Fetched succefully")
    )


})

export{toggleVideoLike,toggleTweetLike,toggleCommentLike,getLikedVideos}