import { app } from "./app.js";
import dotenv from "dotenv";
import dataBaseConnect from "../src/db/database.js"





dotenv.config({
    path:"./.env"
})

dataBaseConnect().then(()=>{
    app.on("error",(error)=>{console.log("express Error",error); throw error;})
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server Started and running at ${process.env.PORT}`)
    })
}).catch((error)=>{
    console.log("MongoDB connection FAILED!",error)
})

