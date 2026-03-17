import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { isValidObjectId } from "mongoose";
// import { Video } from "../models/video.model.js";



const createPlaylist= asyncHandler(async(req,res)=>{
    const {name,description}=req.body
    if(!name){
        throw new ApiError(400,"name is must required")
    }
    const playlist=await Playlist.create({
        name:name,
        description:description,
        videos:[],
        owner:req.user._id
    })
    return res.status(200).json(
        new ApiResponse(200,playlist,"playlist created successfully")
    )
})

const getUserPlaylists=asyncHandler(async (req,res)=>{
    const{userId}=req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"user/playlists not found")
    }
   const playlists= await Playlist.find({owner:userId})

   return res.status(200).json(
    new ApiResponse(200,playlists,"successfully fetched")
   )

})

const getPlaylistById=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"playlist not found")
    }

    const playlist=await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"no playlist found")
    }
    return res.status(200).json(
        new ApiResponse(200,playlist,"successfully fetched the playlist")
    )
})

const addVideoToPlaylist=asyncHandler(async(req,res)=>{
    const{playlistId,videoId}=req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid videoid")
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlist id")
    }
    const playlist=await Playlist.findById(playlistId)
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(404,"you dont have access")
    }
    const addedVideo=await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet:{
            videos:videoId
        }
    },{new:true}).populate("videos")

    return res.status(200).json(
        new ApiResponse(200,addedVideo,"video successfully added")
    )

})

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params
     if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid videoid")
    }
     if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlistid")
    }
      const playlist=await Playlist.findById(playlistId)
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(404,"you dont have access")
    }

    await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{
            videos:videoId
        }
    },{new:true})
    return res.status(200).json(
            new ApiResponse(200,{isVideoRemoved:true},"video removed from playlist")
    )
})

const deletePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
     if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlist")
    }
     const playlist=await Playlist.findById(playlistId)
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(404,"you dont have access")
    }
    await Playlist.findByIdAndDelete(playlistId)
    return res.status(200).json(
        new ApiResponse(200,{isPlaylistDeleted:true},"playlist deleted successfully")
    )

})

const updatePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
    const {name,description}=req.body
    if(!name && !description){
        throw new ApiError(400,"fields are must required")
    }
     const playlist=await Playlist.findById(playlistId)
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(404,"you dont have access")
    }
    const updatedPlaylist=await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name:name,
            description:description
        }
    },{new:true})
    return res.status(200).json(
        new ApiResponse(200,updatedPlaylist,"playlist updated successfully")
    )
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist

}