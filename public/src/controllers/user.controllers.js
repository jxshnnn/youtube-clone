
import { asyncHandler } from "../utils/asyn_handler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from 'mongoose'

const generateAccesAndRefreshTokens = async(userId) =>{
  try{
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}

  } catch(error){
    throw new ApiError(500,"something went wrong while generating refresh and acces token")
  }
}


console.log("CLOUDINARY ENV CHECK:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET,
});


const registerUser = asyncHandler(async (req, res) => {

  const { fullname, email, username, password } = req.body;

  // ✅ 1. Validate required fields
  if ([fullname, email, username, password].some(field => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // ✅ 2. Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // ✅ 3. Get file paths safely
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // ✅ 4. Upload to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar?.url) {
    throw new ApiError(400, "Avatar upload failed — check Cloudinary credentials in .env");
  }

console.log("CLOUDINARY RESPONSE:", avatar);

  // ✅ 5. Create user
  const user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
  });

  // ✅ 6. Remove sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User registration failed");
  }

  // ✅ 7. Send response
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req,res)=> {
  const {email, username, password} = req.body
  if(!(username || email)) {
    throw new ApiError(400,"username or email is required")
  }

  const user = await User.findOne({
    $or : [{username},{email}]
  })
  if(!user){
    throw new ApiError(404,"User not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"invlalid user credentials")

  }

  const {accessToken,refreshToken}= await generateAccesAndRefreshTokens(user._id)
  const loggedInUser = await User.findById(user._id).select("-perfect -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser,accessToken,refreshToken
      },
      "user logged in successfully"

    )
  )
})

  const logoutUser = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1
        }
      },
      {
        new: true
      }
    )

    const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logout successfully"))
  })


  const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies
    .refreshToken || req.body.refreshToken

    if (!incomingRefreshToken){
      throw new ApiError (401,"unauthorized request")
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET

    )

    const user = await User.findById(decodedToken?._id)

    if(!user){
      throw new ApiError(401,"Invalid refresh token")
    }

    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const {accessToken,newRefreshToken } = await generateAccesAndRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken: newRefreshToken},
        "Acess token refreshed"
      )
    )
  })

  const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const{oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
      throw new ApiError(400,"invalid old password")
    }

    user.password = newPassword
   await user.save({validateBeforeSave: false})
   
   return res
   .status(200)
   .json(new ApiResponse(200,{},"password changed successfully"))
  })

  const getCurrentUser = asyncHandler(async(req,res)=> {
    return res.status(200)
    .json( new ApiResponse(200,req.user,"current user fetched successfully"))
  })


const updateAccountDetails = asyncHandler(async(req,res)=>{
  const {fullname,email} = req.body

  if(!(fullname && email)){
    throw new ApiError(400,"All fields are required")
  }

const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set: {
      fullname,
      email
    }
  },
  {
    new:true
  }
).select("-password")

return res
.status(200)
.json(new ApiResponse(200, user, "account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.files?.path

  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is not missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400,"Error while uploading file")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {new: true}
  ).select("-password")

  return res
 .status(200)
 .json(
  new ApiResponse(200,user,"avatar image is updated")
 )


})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.files?.path

  if(!coverImageLocalPath){
    throw new ApiError(400,"cover image file is not missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading coverImage file")
  }

 const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {new: true}
  ).select("-password")


 return res
 .status(200)
 .json(
  new ApiResponse(200,user,"cover image is updated")
 )
})

const getUserCHannelProfile = asyncHandler(async(req,res)=> {
  const{username} = req.params

  if(!username?.trim()){
    throw new ApiError(400,"username is missing")
  }

 const channel = await User.aggregate([
  {
    $match: {
      username: username?.toLowerCase()
    }
  },
  {
    $lookup:{
      from: "subscriptions",
      localField: "_id",
      foreignField: "channel",
      as: "subscribers"
    }
  },
  {
    $lookup: {
      from: "subscriptions",
      localField: "_id",
      foreignField: "subscriber",
      as: "subscribedTo"

    }
  },{
    $addFields:{
      subscribersCount:{
        $size: "$subscribers"
      },
      channelsSubscribedToCount: {
        $size: "$subscribedTo"
      },
      
        isSubscribed: {
          $cond: {
            if:{$in: [req.user?._id,"$subscribers.subscriber"]},
            then: true,
            else: false
          }
        
      }
    }
  },
  {
    $project: {
      fullname:1,
      username:1,
      subscribersCount: 1,
      channelsSubscribedToCount: 1,
      isSubscribed:1,
      avatar: 1,
      coverImage: 1,
      email: 1
    }
  }

 ])

 if (!channel?.length){
  throw new ApiError(404,"channel does not exists")
 }

 return res
 .status(200)
 .json(
  new ApiResponse(200, channel[0], "User channel fetched successfully")
 )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as:"watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as:"owner",
              pipeline: [
                {
                  $project: {
                    fullname:1,
                    username:1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner : {
                $first: "$owner"
              }
            }
          }
        ]
      }
    }
  ])

  if(!user.length){
    throw new ApiError(404,"User not found")
  }
  return res
  .status(200)
  .json(
    new ApiResponse(200,user[0].WatchHistory || [],"watch history fetched successfully")
  )
})

export { registerUser,loginUser,logoutUser,
  refreshAccessToken,changeCurrentPassword,
  getCurrentUser,updateAccountDetails,updateUserAvatar,
  updateUserCoverImage,getUserCHannelProfile,getWatchHistory};