import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser())


// app.use((err,req,res,next)=>{
//     const statusCode=err.statusCode || 500;
//     const message=err.message || "Something went wrong";
//     return res.status(statusCode).json({
//         success:false,
//         statusCode,
//         message,
//         errors:err.errors || [],
//     })
// })


//routers import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/subscription",subscriptionRouter)
app.use("/api/v1/tweets",tweetRouter)
















export {app}