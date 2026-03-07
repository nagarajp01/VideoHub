import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import verifyJwt from "../middlewares/auth.middleware";
import { deleteVideo, getAllvideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../contollers/video.controller";


const router=Router()

router.route("/allvideos").get(verifyJwt,getAllvideos)
router.route("/upload-video").post(verifyJwt,upload.fields([
    {
        name:"thumbnail",
        maxCount:1
    },
    {
        name:"video",
        maxCount:1
    }
]),publishAVideo)
router.route("/:videoId").get(verifyJwt,getVideoById)
router.route("/update-video/:videoId").patch(verifyJwt,upload.single("thumbnail"),updateVideo)
router.route("/delete-video/:videoId").delete(verifyJwt,deleteVideo)
router.route("/publish-status/:videoId").patch(verifyJwt,togglePublishStatus)