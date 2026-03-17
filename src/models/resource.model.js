import mongoose from "mongoose";



const resourceSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    file:{
        type:String,
        required:true
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})


export const Resource=mongoose.model("Resource",resourceSchema)