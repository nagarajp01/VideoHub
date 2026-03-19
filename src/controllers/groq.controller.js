import OpenAI from "openai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const client= new OpenAI({
    apiKey:process.env.GROQ_API_KEY,
    baseURL:"https://api.groq.com/openai/v1"
})

const askAi= asyncHandler(async(req,res)=>{
    const {question}=req.body
    if(!question){
        throw new ApiError(400,"question must required")
    }

    const response=await client.responses.create({
        model: "openai/gpt-oss-20b",
        input:question
    })

    return res.status(200).json(
        new ApiResponse(200,response.output_text,"successfully fetched the response of your question")
    )

})


export {askAi}