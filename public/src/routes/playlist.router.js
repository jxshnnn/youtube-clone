import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJwT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwT); // apply verifyJWT middleware to all routes in this file

router.route("/").post(createPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

router.route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

export default router;