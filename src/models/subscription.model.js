import mongoose from "mongoose";

const subscriptionSchema= new mongoose.Schema({
    Subcriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    Channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema);