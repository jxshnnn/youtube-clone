import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
//import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyn_handler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // SORT TYPE
    const sortOrder = sortType === "asc" ? 1 : -1;

    // AGGREGATION PIPELINE
    const pipeline = [];

    // 1) SEARCH FILTER (title / description)
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        });
    }

    // 2) FILTER BY USER
    if (userId) {
        pipeline.push({
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        });
    }

    // 3) SORT
    pipeline.push({
        $sort: { [sortBy]: sortOrder }
    });

    // 4) PAGINATION
    pipeline.push(
        { $skip: (pageNumber - 1) * limitNumber },
        { $limit: limitNumber }
    );

    // 5) POPULATE OWNER (basic version)
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner"
        }
    });

    // owner comes as array, so take first element
    pipeline.push({
        $addFields: {
            owner: { $first: "$owner" }
        }
    });

    // RUN PIPELINE
    const videos = await Video.aggregate(pipeline);

    // COUNT total documents (only with filter)
    const countPipeline = pipeline.slice(0, 2); // only filters (no skip/limit/sort)
    countPipeline.push({ $count: "total" });

    const totalResult = await Video.aggregate(countPipeline);
    const totalVideos = totalResult[0]?.total || 0;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                totalVideos,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalVideos / limitNumber)
            },
            "Videos fetched using aggregation"
        )
    );
});


const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    // 1) BASIC VALIDATION
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    // 2) CHECK FILES (video + thumbnail)
    if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }

    // 3) GET PATHS FROM MULTER
    const videoFilePath = req.files.videoFile[0].path;
    const thumbnailPath = req.files.thumbnail[0].path;

    if (!videoFilePath || !thumbnailPath) {
        throw new ApiError(400, "Video/Thumbnail upload failed");
    }

    // 4) SAVE TO DATABASE
    const video = await Video.create({
        title,
        description,
        videoFile: videoFilePath,
        thumbnail: thumbnailPath,
        duration: req.body.duration || 0,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                video,
                "Video published successfully"
            )
        );
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "The video id you entered is invalid");
    }

    const video = await Video.findById(videoId)
        .populate("owner", "username fullName avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // increment views and save
    video.views = (video.views || 0) + 1;
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
});

 const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    // 1) VALIDATE VIDEO ID
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // 2) FIND VIDEO
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 3) CHECK IF USER OWNS THE VIDEO
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video");
    }

    // 4) UPDATE FIELDS IF THEY EXIST
    if (title) video.title = title;
    if (description) video.description = description;

    // 5) UPDATE THUMBNAIL (OPTIONAL)
    if (req.files?.thumbnail) {
        video.thumbnail = req.files.thumbnail[0].path;
    }

    // 6) (OPTIONAL) UPDATE VIDEO FILE — usually not needed
    if (req.files?.video) {
        video.videoFile = req.files.video[0].path;
    }

    // 7) SAVE CHANGES
    await video.save();

    // 8) SEND RESPONSE
    return res.status(200).json(
        new ApiResponse(200, video, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not found");
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"you dont have access to delete this video")
    }

    await Video.findByIdAndDelete(video);

    return res
    .status(200)
    .json(new ApiResponse(200,{},"video deleted successfully"))


})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 2️⃣ Step: Only owner can toggle
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video");
    }

    // 3️⃣ Step: Toggle publish status
    video.isPublished = !video.isPublished;

    // 4️⃣ Step: Save updated video
    await video.save();

    return res
    .status(200)
        .json(
            new ApiResponse(
                200,
                { isPublished: video.isPublished },
                `Video is now ${video.isPublished ? "Published" : "Unpublished"}`
            )

        );
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}