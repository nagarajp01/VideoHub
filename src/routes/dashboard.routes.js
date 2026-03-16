import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { getAllVideosUploadedByChannel, getChannelStats } from "../controllers/dashboard.controller.js";



const router=Router()



router.route("/channelstats").get(verifyJwt,getChannelStats)
router.route("/channelvideos").get(verifyJwt,getAllVideosUploadedByChannel)


export default router