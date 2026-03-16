import Router from "express"

import verifyJwt from "../middlewares/auth.middleware"
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller"

const router=Router()



router.route("/like-video/:videoId").post(verifyJwt,toggleVideoLike)
router.route("/like-comment/:commentId").post(verifyJwt,toggleCommentLike)
router.route("/like-tweet/:tweetId").post(verifyJwt,toggleTweetLike)

router.route("/all-likes").get(verifyJwt,getLikedVideos)




export default router;