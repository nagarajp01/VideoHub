import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { askAi } from "../controllers/groq.controller.js";



const router=Router()



router.route("/ask").post(verifyJwt,askAi)


export default router