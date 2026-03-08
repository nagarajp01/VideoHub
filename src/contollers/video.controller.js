import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from "../models/user.model.js"
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadInCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from 'cloudinary';
// import { json } from "express";


const getAllvideos=asyncHandler(async(req,res)=>{
    const {page=1,limit=10,query,sortBy="createdAt",sortType=-1}=req.query

    const filter={isPublished:true}
    if(query){
        filter.title={$regex:query,$options:"i"}
    }
    const allVideos=await Video.find(filter)
    .sort({
        [sortBy]:sortType
    })
    .skip((page-1)*limit)
    .limit(Number(limit))
if(allVideos.length===0){
    throw new ApiError(400,"No videos found")
}
return res.status(200).json(
    new ApiResponse(200,allVideos,"Videos fetched Successfully...")
)

})


const publishAVideo=asyncHandler(async(req,res)=>{
    const{title,description}=req.body
    if(!title){
        throw new ApiError(400,"title must required");
    }
    const thumbnailPath=req.files?.thumbnail[0]?.path;
    const videoPath=req.files?.video[0]?.path;
    if(!thumbnailPath){
        throw new ApiError(400,"thumbnail is missing");
    }
    if(!videoPath){
        throw new ApiError(400,"Video is missing");
    }
    const thumbnailCloud=await uploadInCloudinary(thumbnailPath);
    if(!thumbnailCloud){
        throw new ApiError(400,"thumbnail upload failed")
    }
    const videoCloud=await uploadInCloudinary(videoPath);
    if(!videoCloud){
        throw new ApiError(400,"video upload failed")
    }
    const duration=videoCloud.duration;
    const owner=req.user._id
    const video=await Video.create({
        title,
        description,
        thumbnail:thumbnailCloud.url,
        videoFile:videoCloud.url,
        duration:duration,
        owner:owner,
        isPublished:true
    })
    return res.status(200)
    .json( new ApiResponse(200,video,"Video Uploaded Successfully...."))


})



const getVideoById = asyncHandler(async(req,res)=>{
const{ videoId }=req.params
if(!videoId){
    throw new ApiError(400,"video not found")
}
const video=await Video.findByIdAndUpdate(videoId,
    {
        $inc:{
            views:1
        }
    },{new:true}
).populate("owner","fullName userName avatar");
if(!video){
    throw new ApiError(400,"video file missing...")
}
await User.findByIdAndUpdate(req.user._id,{
    $addToSet:{
        watchHistory:videoId
    },

},{
    new:true
})


return res.status(200)
.json(
    new ApiResponse(200,video,"video fetched successfully....")
)


})

const updateVideo =asyncHandler(async(req,res)=>{
    const {title,description}=req.body
    const { videoId }=req.params
    if(!videoId){
        throw new ApiError(400,"video file missing")
    }
    const video=await Video.findById(videoId).populate("owner","fullName userName avatar")
    if(!video.owner._id.equals(req.user._id)){
        throw new ApiError(403,"you dont have access to edit this video")
    }
    if(!title && !description){
        throw new ApiError(400,"above fields must required to update")
    }
    const thumbnailPath=req.file?.path
    let thumbnailUrl
    if(thumbnailPath){
        // throw new ApiError(400,"thumbnail not found");
        const oldThumnailPublic_id=video.thumbnail.split("/").pop().split(".")[0]
        const updateThumbnailCloud=await uploadInCloudinary(thumbnailPath);
            if(!updateThumbnailCloud){
        throw new ApiError(400,"thumnail update failed...")
    }
    await cloudinary.uploader.destroy(oldThumnailPublic_id)
    thumbnailUrl=updateThumbnailCloud.url

    }
    
    const videoUpdate=await Video.findByIdAndUpdate(videoId,{
        $set:{
            title:title,
            description:description,
            ...(thumbnailUrl && {thumbnail : thumbnailUrl})
            // thumbnail:updateThumbnailCloud.url
        }
    },{
        new:true
    })
    return res.status(200)
    .json(
        new ApiResponse(200,videoUpdate,"video updated successfully..")
    )



})

const deleteVideo =asyncHandler(async(req,res)=>{
    const { videoId }=req.params
    if(!videoId){
        throw new ApiError(400,"video file is missing")
    }
    const video=await Video.findById(videoId).populate("owner","fullName userName avatar")
    if(!video.owner._id.equals(req.user._id)){
        throw new ApiError(403,"you dont access to delete")
    }
    const oldThumbnail=video.thumbnail.split("/").pop().split(".")[0]
    const oldVideo=video.videoFile.split("/").pop().split(".")[0]
    if(!oldThumbnail){
        throw new ApiError(400,"thumbnail file is missing")
    }
    await cloudinary.uploader.destroy(oldThumbnail)
    if(!oldVideo){
        throw new ApiError(400,"old video file is missing")
    }
    await cloudinary.uploader.destroy(oldVideo,{
        resource_type:"video"
    })
    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(200,{},"video deleted succcessfully")
    )
})
const togglePublishStatus= asyncHandler(async(req,res)=>{
    const { videoId }=req.params
    if(!videoId){
        throw new ApiError(400,"video File is missing")
    }
    const video=await Video.findById(videoId)
    if(!video.owner._id.equals(req.user._id)){
        throw new ApiError(403,"you dont have access")
    }
    const toggledPublish=await Video.findByIdAndUpdate(videoId,{
        $set:{
            isPublished:!video.isPublished
        }
    },{
        new:true
    })

    return res.status(200).json(
    new ApiResponse(200,toggledPublish,"publish status toggled succsessfully")
)
})












export {getAllvideos , publishAVideo, getVideoById,updateVideo,deleteVideo,togglePublishStatus}