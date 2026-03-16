import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";





const createTweet= asyncHandler(async(req,res)=>{
    const{ content }=req.body
    if(!content){
        throw new ApiError(400,"enter your tweet")
    }
    const tweet=await Tweet.create({
        content:content,
        owner:req.user._id
    })
return res.status(200).json(
    new ApiResponse(200,tweet,"Tweet is successfully posted")
)
})


const getUserTweets=asyncHandler(async(req,res)=>{
    const {userId}=req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"no channel exists")
    }

    const allTweets=await Tweet.find({
        owner:userId
    })
    return res.status(200).json(
        new ApiResponse(200,allTweets,"tweets fetched successfully")
    )

})


const updateTweet= asyncHandler(async(req,res)=>{
    const { content }=req.body
    const { tweetId }=req.params
    if(!tweetId){
        throw new ApiError(400,"tweet not found")
    }
    if(!content){
        throw new ApiError(400,"please enter the tweet first")
    }
    const tweet= await Tweet.findById(tweetId)
    if(!tweet.owner.equals(req.user._id)){
        throw new ApiError(403,"you dont have access to delete")
    }

    const updatedTweet=await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content:content
        }
    },{new:true})

    return res.status(200).json(
        new ApiResponse(200,updatedTweet,"tweet updated successfully")
    )

})

const deleteTweet=asyncHandler(async(req,res)=>{
    const { tweetId }=req.params
    if(!tweetId){
        throw new ApiError(400,"tweet not found")
    }
    const tweet= await Tweet.findById(tweetId)
    if(!tweet.owner.equals(req.user._id)){
        throw new ApiError(403,"you dont have access to delete")
    }

    const deletedTweet=await Tweet.findByIdAndDelete(tweetId)
    return res.status(200).json(
        new ApiResponse(200,{},"tweet deleted successfully")
    )
})


export {createTweet , getUserTweets,updateTweet,deleteTweet}