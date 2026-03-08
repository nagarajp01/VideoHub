import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../contollers/subscription.controller.js";


const router=Router()


router.route("/channel/:channelId").get(verifyJwt,getUserChannelSubscribers)
router.route("/channel/:channelId").post(verifyJwt,toggleSubscription)
router.route("/user/:subscriberId").get(verifyJwt,getSubscribedChannels)


export default router