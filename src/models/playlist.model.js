import mongoose from "mongoose";


const playlistSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    videos:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"video",
        required:true
    },
    owner:{
        type:[mongoose.Schema.Types.ObjectId],
        required:true
    },
    description:{
        type:String
    }
},{timestamps:true})



export const Playlist=mongoose.model("Playlist",playlistSchema)