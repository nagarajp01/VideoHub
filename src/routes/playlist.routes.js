import { Router } from "express";
import verifyJwt from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";




const router=Router()


router.route("/createplaylist").post(verifyJwt,createPlaylist)
router.route("/userplaylists/:userId").get(verifyJwt,getUserPlaylists)
router.route("/getplaylist/:playlistId").get(verifyJwt,getPlaylistById)
router.route("/addvideo/:playlistId/:videoId").patch(verifyJwt,addVideoToPlaylist)
router.route("/removevideo/:playlistId/:videoId").patch(verifyJwt,removeVideoFromPlaylist)
router.route("/deleteplaylist/:playlistId").delete(verifyJwt,deletePlaylist)
router.route("/updateplaylist/:playlistId").patch(verifyJwt,updatePlaylist)


export default router;