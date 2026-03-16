import mongoose ,{isValidObjectId} from "mongoose";
// import {User} from "../models/user.model"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";



const toggleSubscription=asyncHandler(async (req,res)=>{
    const { channelId }=req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "channle not found")
    }
    const checkIsSubscribed=await Subscription.findOne({
        Subscriber:req.user._id,
        Channel:channelId
    })
    if(checkIsSubscribed){
        await Subscription.deleteOne({
            Subscriber:req.user._id,
            Channel:channelId
        })
        return res.status(200).json(
            new ApiResponse(200,{isSubscribed:false},"Successfully Unsubscribed.....")
        )
    }
    await Subscription.create({
        Subscriber:req.user._id,
        Channel:channelId
    })
    return res.status(200).json(
        new ApiResponse(200,{isSubscribed:true},"Subscribed SuccessFully.....")
    )

})

const getUserChannelSubscribers=asyncHandler(async(req,res)=>{
    const {channelId}=req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "channle not found")
    }
    const subscribersList=await Subscription.aggregate(
        [
            {
                $match:{
                    Channel:new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"Subscriber",
                    foreignField:"_id",
                    as:"subscriberDetails"
                }
            },
           {
             $addFields:{
                subscriberDetails:{
                    $first:"$subscriberDetails"
                }
            }
           },
           {
            $project:{
                "subscriberDetails.fullName":1,
                "subscriberDetails.userName":1,
                "subscriberDetails.avatar":1,
                "subscriberDetails.email":1
            }
           }

        ]
    )
    return res.status(200).json(
         new ApiResponse(200,subscribersList,"subscribers details fetched successfully")
    )








})

const getSubscribedChannels=asyncHandler(async(req,res)=>{
    const {subscriberId}=req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"invalid subscriber id")
    }
    const subscribedTo=await Subscription.aggregate([
        {
            $match:{
                Subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"Channel",
                foreignField:"_id",
                as:"channelDetails"
            }
        },
        {
            $addFields:{
                channelDetails:{
                    $first:"$channelDetails"
                }
            }
        },
        {
            $project:{
                "channelDetails.fullName":1,
                "channelDetails.userName":1,
                "channelDetails.avatar":1,
                "channelDetails.email":1
            }
        }
    ])
    return res.status(200).json(
        new ApiResponse(200,subscribedTo,"channels details fetched successfully")
    )
})













export {toggleSubscription,getUserChannelSubscribers,getSubscribedChannels}