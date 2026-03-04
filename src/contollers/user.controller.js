import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import { uploadInCloudinary } from "../utils/cloudinary.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"


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




export {registerUser,loginUser}