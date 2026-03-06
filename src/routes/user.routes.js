import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changeCurrentPassword, getChannelProfile, getCurrentUser, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../contollers/user.controller.js";
import verifyJwt from "../middlewares/auth.middleware.js";


const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJwt,changeCurrentPassword)
router.route("/current-user",verifyJwt,getCurrentUser)
router.route("/update-account-details",verifyJwt,updateAccountDetails)
router.route("/update-avatar",verifyJwt,upload.single("avatar"),updateUserAvatar)
router.route("/update-coverImage",verifyJwt,upload.single("coverImage"),updateUserCoverImage)
router.route("/channel/:userName",verifyJwt,getChannelProfile)
router.route("/watchHistory",verifyJwt,getWatchHistory)

export default router