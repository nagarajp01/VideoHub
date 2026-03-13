import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Playlist } from "../models/playlist.model";
import { isValidObjectId } from "mongoose";




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
    return res.status(
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
    const addedVideo=await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet:{
            videos:videoId
        }
    },{new:true}).populate("videos")

    return res.status(200).json(
        new ApiResponse(200,addedVideo,"video successfully added")
    )

})

