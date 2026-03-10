
import Router from "express"
import verifyJwt from "../middlewares/auth.middleware.js"
import { createTweet, deleteTweet, updateTweet, getUserTweets } from "../contollers/tweet.controller.js"


const router=Router()


router.route("/post-tweet").post(verifyJwt,createTweet);

router.route("/alltweets/:userId").get(verifyJwt,getUserTweets)

router.route("/update-tweet/:tweetId").patch(verifyJwt,updateTweet)

router.route("/delete/:tweetId").delete(verifyJwt,deleteTweet)


export default router