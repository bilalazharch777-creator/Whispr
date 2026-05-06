import mongoose from "mongoose";
import FriendRequest from "../Models/FriendRequest.js";
import User from "../Models/User.js";

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params; // The ID of the user being searched (e.g., Alex Mahone)
    const currentUserId = req.user._id; // Assuming you have auth middleware providing the logged-in user

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Check if they are already friends
    // .lean() converts Mongoose doc to plain JS object so we can add properties
    const isFriend = user.friends.some(
      (friendId) => friendId.toString() === currentUserId.toString(),
    );

    let friendshipStatus = "none";

    if (isFriend) {
      friendshipStatus = "friends";
    } else {
      // 2. If not friends, check for a pending request
      const request = await FriendRequest.findOne({
        $or: [
          { sender: currentUserId, recipient: id },
          { sender: id, recipient: currentUserId },
        ],
        status: "pending",
      });

      if (request) {
        // Distinguish between who sent it so the UI knows to show "Cancel" or "Accept"
        friendshipStatus =
          request.sender.toString() === currentUserId.toString()
            ? "pending_sent"
            : "pending_received";
      }
    }

    // Return the user data with the status attached
    res.status(200).json({ ...user, friendshipStatus });
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid User ID format" });
    }
    res.status(500).json({ message: "Server error" });
  }
};
export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Run the "exclusion" lookups in parallel to save time
    const [currentUser, pendingRequests] = await Promise.all([
      User.findById(currentUserId).select("friends"),
      mongoose
        .model("FriendRequest")
        .find({ sender: currentUserId, status: "pending" })
        .select("recipient"),
    ]);

    const excludeIds = [
      currentUserId,
      ...(currentUser?.friends || []),
      ...pendingRequests.map((r) => r.recipient),
    ];

    // Use find() instead of aggregate for better index usage
    const query = { _id: { $nin: excludeIds } };

    // Execute count and data fetch in parallel
    const [totalUsers, recommendedUsers] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select("_id fullName location profilePic isOnboarded")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // .lean() makes the query 3x faster by returning plain JS objects
    ]);

    res.status(200).json({
      users: recommendedUsers,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getMyFriends(req, res) {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate("friends", "-password")
      .select("friends");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friends || []);
  } catch (error) {
    console.error("Error in getMyFriends controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res.status(400).json({
        message: "You cannot send a friend request to yourself",
      });
    }
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        message: "Recipient not found",
      });
    }
    if (recipient.friends.includes(myId)) {
      return res.status(400).json({
        message: "You are already friends with this user",
      });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A Friend request already exists between you and this user.",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });
    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to accept this friend request",
      });
    }
    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });
    res.status(200).json({
      message: "Friend request accepted successfully",
    });
  } catch (error) {
    console.log("Error in acceptFriendRequest Controller", error.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const incommingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({
      incommingReqs,
      acceptedReqs,
    });
  } catch (error) {
    console.log("Error in getFriendRequests Controller", error.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function getOutgoingFriendRequests(req, res) {
  try {
    const outgoingReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json(outgoingReqs);
  } catch (error) {
    console.log("Error in getOutgoingFriendRequests Controller", error.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const requestId = req.params.id;

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Check if the user is either the sender or recipient of this request
    if (
      friendRequest.sender.toString() !== userId.toString() &&
      friendRequest.recipient.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this request" });
    }

    // Check if the request is still pending
    if (friendRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Cannot cancel ${friendRequest.status} request` });
    }

    // Delete the request
    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({
      message: "Friend request cancelled successfully",
      requestId,
    });
  } catch (error) {
    console.error("Error in cancelFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function searchPeople(req, res) {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Optimization 1: Use a Regex with 'i' flag for case-insensitive search
    // Optimization 2: Use .select() to only fetch required fields from DB (Projection)
    // Optimization 3: Limit results to prevent massive payloads
    const people = await User.find({
      fullName: { $regex: `^${query}`, $options: "i" }, // The '^' means "starts with"
    })
      .select("profilePic fullName city country")
      .limit(10)
      .lean(); // Optimization 4: Returns plain JS objects instead of heavy Mongoose documents

    res.status(200).json(people);
  } catch (error) {
    console.error("Error in searchPeople:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export const getRandomUsers = async (req, res) => {
  try {
    const randomUsers = await User.aggregate([
      { $match: { _id: { $ne: req.user._id } } },
      { $sample: { size: 10 } },
      { $project: { fullName: 1, profilePic: 1 } },
    ]);

    res.status(200).json(randomUsers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
