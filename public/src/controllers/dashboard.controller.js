import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
//import { Like } from "../models/like.model.js";
//import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyn_handler.js";

// ─── Get Channel Stats ────────────────────────────────────────────────────────
// Returns: total videos, total views, total subscribers, total likes

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  // Total Subscribers
  const totalSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        subscribersCount: { $sum: 1 },
      },
    },
  ]);

  // Total Videos, Views, Likes
  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: { $size: "$likes" } },
      },
    },
  ]);

  const channelStats = {
    totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalViews: videoStats[0]?.totalViews || 0,
    totalLikes: videoStats[0]?.totalLikes || 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "Channel stats fetched successfully")
    );
});

// ─── Get All Videos of Channel ────────────────────────────────────────────────
// Returns all videos uploaded by the logged-in channel owner
// with likes count, views, publish status

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        createdAt: {
          $dateToParts: { date: "$createdAt" },
        },
        likesCount: { $size: "$likes" },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        videoFile: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        likesCount: 1,
        createdAt: {
          year: 1,
          month: 1,
          day: 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, videos, "Channel videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };