import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const dataBaseConnect=async()=>{
    try {
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n mongoDB connected successfully!!! DB:HOST:${connectionInstance.connection.host}`)
        
    } catch (error) {
        console.log("there was an error while connecting to database",error)
        process.exit(1);
        
    }

}

export default dataBaseConnect