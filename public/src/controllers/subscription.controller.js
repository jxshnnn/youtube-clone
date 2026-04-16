import mongoose, {isValidObjectId} from "mongoose"
//import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyn_handler.js"
//import { channel } from "diagnostics_channel"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriberId = req.user._id;
    // TODO: toggle subscription
    const existingSubscription = await Subscription.findOne({
        subsriber: subscriberId,
        channel: channelId,
    });
    if(existingSubscription){
        await Subscription.findByIdAndDelete(existingSubscription._id);

        return res
        .status(200)
        .json(
            new ApiResponse(200,{ subscribed: false}, "unsubscribed success")
        );
    }

    const newSubscription = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId,
    });

    return res
    .status(201)
    .json(
        new ApiResponse(201,{subscribed: true},"subscribed successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const subscribers = await Subscription.find({channel: channelId})
    .populate("subscriber","username email avatar")
    .lean();

    return res.status(200).json(
        new ApiResponse(
            200,"channel subscribers fetched successfully",
            {
                totalSubscribers: subscribers.length,
                subscribers
            }
        )


    )
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscribedChannels = await Subscription.find({subscriber: subscriberId})
    .populate("channel","username email avatar coverImage")
    .lean();

    return res.status(200).json(
        new ApiResponse(
            200,"subscribed channnel fetched successfully",
            {
                totalChannels: subscribedChannels.length,
                channels: subscribedChannels
            }
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}