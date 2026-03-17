import { Resource } from "../models/resource.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadInCloudinary} from "../utils/cloudinary.js"
import { v2 as cloudinary } from 'cloudinary';


const uploadResource=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {title,description}=req.body
    if(!videoId){
        throw new ApiError(400,"video is missing")
    }
    if(!title){
        throw new ApiError(400,"title must required")
    }
    const resource=req.file?.path
    if(!resource){
        throw new ApiError(400,"resource must required")
    }
    const cloudPdf=await uploadInCloudinary(resource)
    if(!cloudPdf){
        throw new ApiError(400,"pdf is missing something went wrong please upload again")
    }
    const resourceUploaded=await Resource.create({
        title:title,
        description:description,
        file:cloudPdf.url,
        video:videoId,
        owner:req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200,resourceUploaded,"resources uploaded successfully")
    )

})

const updateResource=asyncHandler(async(req,res)=>{
    const{resourceId}=req.params
    const {title,description}=req.body
    if(!resourceId){
        throw new ApiError(400,"resource is missing")
    }
    const resource=await Resource.findById(resourceId)
    if(!resource.owner.equals(req.user._id)){
        throw new ApiError(400,"you dont have access")
    }
    if(!title){
        throw new ApiError(400,"title must required")
    }
    
    const filePath=req.file?.path
    let resourceUrl
    if(filePath){
        const oldresource=resource.file.split("/").pop().split(".")[0]
        const cloudResource=await uploadInCloudinary(filePath)
        resourceUrl=cloudResource.url
        if(!cloudResource){
            throw new ApiError(400,"upload failed please try again")
        }
        await cloudinary.uploader.destroy(oldresource)
    }
    const resourceUpdate=await Resource.findByIdAndUpdate(resourceId,{
        $set:{
            title:title,
            description:description,
            ...(resourceUrl && {file:resourceUrl})
        }
    },{
        new:true
    })
    return res.status(200).json(
        new ApiResponse(200,resourceUpdate,"resource updated successfully")
    )
})



const deleteResource=asyncHandler(async(req,res)=>{
    const {resourceId}=req.params
    if(!resourceId){
        throw new ApiError(400,"resource is missing")
    }
    const resource=await Resource.findById(resourceId)
    if(!resource.owner.equals(req.user._id)){
        throw new ApiError(400,"you dont have access")
    }
    const oldresource=resource.file.split("/").pop().split(".")[0]
    if(!oldresource){
        throw new ApiError(400,"resource is missing")
    }
    await cloudinary.uploader.destroy(oldresource)
    await Resource.findByIdAndDelete(resourceId)

    return res.status(200).json(
        new ApiResponse(200,{isResourceDeleted:true},"deleted successfully")
    )

})


const getVideoResource=asyncHandler(async(req,res)=>{
    const {videoId}=req.params

    if(!videoId){
        throw new ApiError(400,"video is missing")
    }

    const resources=await Resource.find({
        video:videoId
    })
    return res.status(200).json(
        new ApiResponse(200,resources,"resources fetched successfully")
    )





})


export {uploadResource,deleteResource,updateResource,getVideoResource}