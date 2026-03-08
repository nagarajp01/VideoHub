import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import { uploadInCloudinary } from "../utils/cloudinary.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { v2 as cloudinary } from 'cloudinary';
// import { Subscription } from "../models/subscription.model.js"
import mongoose from "mongoose"

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        
        const user=await User.findById(userId)
        if(!user){
            throw new ApiError(400,"user not found")
        }
        const accessToken=await user.generateAccessToken()
        const refreshToken=await user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access and refresh tokens")
        
    }
}






const registerUser= asyncHandler(async(req,res)=>{
    const {fullName,userName,email,password,}=req.body
    if([fullName,userName,email,password].some(
        (field)=>field?.trim()==="")
     ){
        throw new ApiError(400,"All fields are mandatory")
     }
    const existedUser=await User.findOne({
        $or:[{userName},{email}]
    })
    if(existedUser){
        console.log("api object",new ApiError(409,"User already exits"))
        throw new ApiError(409,"User already exists with this email or username")
    }
    const avatarImageLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path;
    if(!avatarImageLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar=await uploadInCloudinary(avatarImageLocalPath);
    const coverImage=await uploadInCloudinary(coverImageLocalPath);
        if(!avatar){
        throw new ApiError(400,"avatar is missing")
    }
    const user= await User.create({
        fullName,
        userName:userName.toLowerCase(),
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    );
    console.log(createdUser)
    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering user")
    }

    console.log("Api response", new ApiResponse(200,createdUser))
    return res.status(201).json(
        new ApiResponse(201,createdUser,"user registered succesfully")
    )


})

const loginUser=asyncHandler(async(req,res)=>{
    const { email,userName,password}=req.body
    if(!userName && !email){
        throw new ApiError(400,"Email or UserName must required")
    }
    const user=await User.findOne({
        $or:[{email},{userName}]
    })
    if(!user){
        throw new ApiError(400,"User Not Found")
    }
    const isPasswordCorrect=await user.isPasswordCorrect(String(password))
    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid Password")
    }
    // const generateAccessToken=user.generateAccessToken()
    // const generateRefreshToken=user.generateRefreshToken()
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(201)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(201,{user:loggedInUser,accessToken,refreshToken},"Logged In successfully")
    )

})


const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $unset:{
            refreshToken:1
        },
        
    },{
        new:true
    })

    const options={
        httpOnly:true,
        secure:true
    }

    res.status(201)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(201,{},"user logout successfully")
    )

})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
   try {
     const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
     const user=await User.findById(decodedToken?._id)
     if(!user){
        throw new ApiError(401,"Invalid refreshToken")
     }
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"refresh token expired or used")
     }
     const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
     const options={
        httpOnly:true,
        secure:true
     }
    return res.status(200)
     .cookie("accessToken", accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(
        new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"access token refreshed")
     )
   } catch (error) {
    throw new ApiError(401,error?.message || "invalid refresh token")
   }
})


const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user=await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(401,"user Not Found")
    }
    const oldPasswordCheck=await user.isPasswordCorrect(oldPassword)
    if(!oldPasswordCheck){
        throw new ApiError(401,"invalid old Password")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200).json(new ApiResponse(200,{},"password changed successfully"));
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    const currentUser=req.user
    return res.status(200).json(
        new ApiResponse(200,currentUser,"User details Fetched successfully.....")
    )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const { fullName, email}=req.body
    if(!fullName && !email){
        throw new ApiError(400,"fill atleast one field")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            fullName:fullName,
            email:email
        }
    },{
        new:true
    }).select("-password")
    
    return res.status(200).json(
        new ApiResponse(200,user,"Account details updated successfully...")
    )
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarImage= req.file?.path
    if(!avatarImage){
        throw new ApiError(400,"new avatar image is required")
    }
    const oldAvatarUrl=req.user.avatar
    const oldAvatarPublic_id=oldAvatarUrl.split("/").pop().split(".")[0]
    const cloudImage= await uploadInCloudinary(avatarImage);
    if(!cloudImage.url){
        throw new ApiError(400,"Image Upload Failed...")
    }
    await cloudinary.uploader.destroy(oldAvatarPublic_id)
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:cloudImage.url
        }
    },{
        new:true
    }).select("-password")
return res.status(200).json(
    new ApiResponse(200,user,"avatar updated successfully...")
)
})


const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImage= req.file?.path
    if(!coverImage){
        throw new ApiError(400,"new avatar image is required")
    }
    const oldCoverUrl=req.user.coverImage
    const oldCoverPublic_id=oldCoverUrl.split("/").pop().split(".")[0]
    const cloudImage= await uploadInCloudinary(coverImage);
    if(!cloudImage.url){
        throw new ApiError(400,"Image Upload Failed...")
    }
   if(oldCoverPublic_id){
     await cloudinary.uploader.destroy(oldCoverPublic_id)
   }
    const user=await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage:cloudImage.url
        }
    },{
        new:true
    }).select("-password")
return res.status(200).json(
    new ApiResponse(200,user,"cover image updated successfully...")
)
})


const getChannelProfile=asyncHandler(async(req,res)=>{
    const {userName}=req.params
    if(!userName){
        throw new ApiError(400,"user not found")
    }
    const channel=await User.aggregate(
        [
            {
                $match:{
                    userName:userName?.toLowerCase()
                }

            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"Channel",
                    as:"subscribers"
                }

            },
           {
             $lookup: {
                from:"subscriptions",
                localField:"_id",
                foreignField:"Subscriber",
                as:"subscribedTo"
            },
           },
           {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[new mongoose.Types.ObjectId(req.user?._id),"$subscribers.Subscriber"]},
                        then:true,
                        else:false
                    }
                }

            }
           },
           {
            $project:{
                fullName:1,
                userName:1,
                subscribersCount:1,
                channelSubscribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1

            }
           }
        ]
    )

    if(!channel?.length){
        throw new ApiError(404,"channel not found")
    }
    return res.status(200).json(
        new ApiResponse(200,channel[0],"user channel fetched successfully")
    )

})


const getWatchHistory=(asyncHandler(async(req,res)=>{
    const user= await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        userName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }


                ]
            }
        },
        
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully...")
    )
}))


export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getChannelProfile,getWatchHistory}

