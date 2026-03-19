import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";
import { deleteResource, getVideoResource, updateResource, uploadResource } from "../controllers/resource.controller.js";




const router=Router()



router.route("/upload-resource/:videoId").post(verifyJwt,upload.single("material"),uploadResource)
router.route("/update-resource/:resourceId").patch(verifyJwt,upload.single("material"),updateResource)
router.route("/delete-resource/:resourceId").delete(verifyJwt,deleteResource)
router.route("/video-resource/:videoId").get(verifyJwt,getVideoResource)




export default router
