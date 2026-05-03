import Story from "../Models/Story.js";
import User from "../Models/User.js";

export const uploadStory = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { cloudinaryLink, mediaType } = req.body; // Sent from frontend

    if (!cloudinaryLink || !mediaType) {
      return res.status(400).json({ message: "Missing story media data" });
    }

    // 1. Create the story
    const newStory = new Story({
      owner: userId,
      cloudinaryLink,
      mediaType,
    });

    const savedStory = await newStory.save();

    // 2. Update the user to link this story
    await User.findByIdAndUpdate(userId, {
      currentStory: savedStory._id,
    });

    res.status(201).json({
      message: "Story posted successfully",
      story: savedStory,
    });
  } catch (error) {
    console.error("Story Upload Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const toggleLikeStory = async (req, res) => {
  try {
    const { id: storyId } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(storyId);

    if (!story) {
      return res
        .status(404)
        .json({ message: "Story not found or has expired" });
    }

    // Check if user already liked the story
    const isLiked = story.likes.includes(userId);

    if (isLiked) {
      // Unlike: Remove user ID from array
      await Story.findByIdAndUpdate(storyId, {
        $pull: { likes: userId },
      });
    } else {
      // Like: Add user ID uniquely
      await Story.findByIdAndUpdate(storyId, {
        $addToSet: { likes: userId },
      });
    }

    res.status(200).json({
      message: isLiked ? "Story unliked" : "Story liked",
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error("Error toggling like:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getStory = async (req, res) => {
  try {
    const { id: storyId } = req.params;
    const { _id: userId, fullName, profilePic } = req.user;

    // 1. Fetch story and populate owner details (for the avatar/name in story header)
    const story = await Story.findById(storyId).populate(
      "owner",
      "fullName profilePic",
    );

    if (!story) {
      return res
        .status(404)
        .json({ message: "Story has expired or doesn't exist" });
    }

    // 2. Logic: If the requester is NOT the owner, record their view
    if (story.owner._id.toString() !== userId.toString()) {
      // Avoid duplicate view entries for the same user session (optional)
      const alreadyViewed = story.views.some((v) => v.fullName === fullName);

      if (!alreadyViewed) {
        story.views.push({
          fullName,
          profilePic,
          viewedAt: new Date(),
        });
        await story.save();
      }
    }

    // 3. Prepare response
    // If owner, send the full views list. If not, maybe hide the list for privacy.
    const storyData = story.toObject();
    if (story.owner._id.toString() !== userId.toString()) {
      delete storyData.views; // Viewers shouldn't see who else watched
    }

    res.status(200).json(storyData);
  } catch (error) {
    console.error("Error fetching story:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getStoryFeed = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("currentStory")
      .populate({
        path: "friends",
        select: "fullName profilePic currentStory",
        populate: {
          path: "currentStory",
          model: "Story",
        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.currentStory === null && user.toObject().currentStory !== null) {
      await User.findByIdAndUpdate(userId, { currentStory: null });
    }

    const friendsStories = [];

    for (const friend of user.friends) {
      if (friend.currentStory) {
        friendsStories.push({
          userId: friend._id,
          fullName: friend.fullName,
          profilePic: friend.profilePic,
          storyId: friend.currentStory._id,
          mediaType: friend.currentStory.mediaType, // Added for frontend hint
        });
      } else if (friend.toObject().currentStory !== null) {
        await User.findByIdAndUpdate(friend._id, { currentStory: null });
      }
    }

    const myStory = user.currentStory
      ? {
          userId: user._id,
          fullName: "My Story",
          profilePic: user.profilePic,
          storyId: user.currentStory._id,
          mediaType: user.currentStory.mediaType,
        }
      : null;

    // 4. Return combined data
    res.status(200).json({
      myStory, // Single object or null
      friendsStories, // Array of active story objects
    });
  } catch (error) {
    console.error("Error in getStoryFeed:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
