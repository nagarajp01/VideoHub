import { app } from "./app.js";
import dotenv from "dotenv";
import dataBaseConnect from "../src/db/database.js"





dotenv.config({
    path:"./.env"
})

const PORT=process.env.PORT || 8000;

dataBaseConnect().then(()=>{
    app.on("error",(error)=>{console.log("express Error",error); throw error;})
    app.listen(PORT, ()=>{
        console.log(`Server Started and running at ${process.env.PORT}`)
    })
}).catch((error)=>{
    console.log("MongoDB connection FAILED!",error)
})

