import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/likes.model.js";



const getChannelStats=asyncHandler(async(req,res)=>{

    const videoStats=await Video.aggregate(
        [
            {
                $match:{
                    owner:new mongoose.Types.ObjectId(req.user._id)
                }
            },{
                $group:{
                    _id:null,
                    totalVideos:{
                        $sum:1
                    },
                    totalViews:{
                        $sum:"$views"
                    }
                }
            }
        ])
    const subscribers=await Subscription.aggregate(
        [
            {
                $match:{
                    Channel:new mongoose.Types.ObjectId(req.user._id)}
            },
            {
                $group:{
                    _id:null,
                    totalSubscribers:{
                        $sum:1
                    }
                }
            }
        ]

    )

    const videoIds= await Video.find({owner:req.user._id}).distinct("_id")
    const totalLikes=await Like.countDocuments(
        {
            video:{
                $in:videoIds
            }
        }
    )
return res.status(200).json(
    new ApiResponse(200,{
        totalVideos:videoStats[0].totalVideos,
        totalViews:videoStats[0].totalViews,
        totalLikes:totalLikes,
        totalSubscribers:subscribers[0]?.totalSubscribers || 0
    })
)


})


const getAllVideosUploadedByChannel=asyncHandler(async(req,res)=>{
   const videos= await Video.aggregate(
    [
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user._id)
            }
        },

    ]
)

return res.status(200).json(
    new ApiResponse(200,videos,"all videos fetched successfully")
)





})




export {
    getAllVideosUploadedByChannel,
    getChannelStats
}
