import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new mongoose.Schema(
    {

    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    fullName:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String
    },
    watchHistory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    refreshToken:{
        type:String
    }


},{timestamps:true})



userSchema.pre("save", async function(next){
    console.log("pre save triggered, next type",typeof next)
    if(!this.isModified("password")) return;
    this.password= await bcrypt.hash(this.password,(10))
})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken= function(){
    const payLoad={
        _id:this._id,
        email:this.email,
        userName:this.userName,
        fullName:this.fullName,
        
    }
    return jwt.sign(payLoad,process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
   
    

}

userSchema.methods.generateRefreshToken= function(){
    const payLoad={
        _id:this._id,
    }
    return jwt.sign(payLoad,process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}










export const User=mongoose.model("User",userSchema)