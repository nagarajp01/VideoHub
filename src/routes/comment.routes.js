import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";


const router=Router()


router.route("/allcomments/:videoId").get(verifyJwt,getAllComments)
router.route("/addcomment/:videoId").post(verifyJwt,addComment)
router.route("/updatecomment/:commentId").patch(verifyJwt,updateComment)
router.route("/deletecomment/:commentId").delete(verifyJwt,deleteComment)

export default router