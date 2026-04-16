import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyn_handler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;
    
    if(!name || !description){
        throw new ApiError(400,"name and description are required")

    }

    //TODO: create playlist

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
        videos:[],
    });

    if(!playlist){
        throw new ApiError(500,"failed to create playlist")
    }

    return res
      .status(201)
      .json(new ApiResponse(201,playlist,"playlist created successfully"))
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"invalid userId")
    }
    //TODO: get user playlists
    const playlists = await Playlist.aggregate([
       { $match: {
            owner: new mongoose.Types.ObjectId(userId)
        },
    },
    {
        $lookup:{
            from:"videos",
            localField:"videos",
            foreignField: "_id",
            as:"videos",

        },
    },
    {
        $addFields:{
            totalVideos: {$size: "$videos"},
            totalViews:{$sum: "$videos.views"},

        },
    },
    {
        $project:{
            _id: 1,
            name: 1,
            description:1,
            totalVideos: 1,
            totalViews:1,
            updatedAt:1,
        },

    },

    ])

    if(!playlists){
        throw new ApiError(404,"no playlist found");

    }
    return res
    .status(200)
    .json(new ApiResponse(200,playlists,"user playlist fetched successfully"))
})
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        // nested lookup to get video owner details
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalVideos: { $size: "$videos" },
        totalViews: { $sum: "$videos.views" },
        owner: { $first: "$owner" },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videos: 1,
        owner: 1,
        totalVideos: 1,
        totalViews: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!playlist?.length) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }

  const playlist = await Playlist.findById(playlistId);
  const video = await Video.findById(videoId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // check if the user is the owner of the playlist
  if (playlist.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to add video to this playlist");
  }

  // check if video already exists in playlist
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: videoId },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to add video to playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }

  const playlist = await Playlist.findById(playlistId);
  const video = await Video.findById(videoId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // check if the user is the owner of the playlist
  if (playlist.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to remove video from this playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to remove video from playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // check if the user is the owner of the playlist
  if (playlist.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this playlist");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  // check if the user is the owner of the playlist
  if (playlist.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this playlist");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Failed to update playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}