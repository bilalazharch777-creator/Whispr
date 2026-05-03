import Post from "../Models/Post.js";
import User from "../Models/User.js";
import mongoose from "mongoose";
export async function upload(req, res) {
  // Destructure 'id' from body (assuming frontend sends it as 'id')
  const { id, text, media, background, textStyle } = req.body;

  try {
    // 1. Authorization Check
    // Ensure the logged-in user matches the ID provided in the request
    if (!req.user || req.user._id.toString() !== id) {
      return res.status(403).json({
        error: "You are not authorized to create a post for this user.",
      });
    }

    // 2. Create the post instance
    const post = new Post({
      userId: id, // Map 'id' from req.body to 'userId' in Schema
      text,
      media,
      background,
      textStyle,
    });

    // 3. Save to MongoDB
    await post.save();

    // 4. Return the created post
    res.status(201).json(post);
  } catch (err) {
    // Added (err) here
    console.error("Upload Error:", err);
    res.status(400).json({ error: err.message });
  }
}
export async function allPosts(req, res) {
  try {
    const { id } = req.params;

    // 1. Validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    // 2. Optimized Fetching
    const posts = await Post.find({ userId: id })
      .populate("userId", "fullName profilePic") // Fetch only needed user fields
      .sort({ createdAt: -1 }) // Newest first
      .lean(); // Converts Mongoose docs to plain JS objects (faster, less memory)

    // 3. Response Handling
    // Even if posts is empty [], it's technically a successful query
    if (!posts || posts.length === 0) {
      return res.status(200).json({
        message: "No posts found for this user",
        userId: id,
        count: 0,
        posts: [],
      });
    }

    res.status(200).json({
      userId: id,
      count: posts.length,
      posts,
    });
  } catch (err) {
    console.error("Error fetching user posts:", err);
    res.status(500).json({
      error: "Server error while fetching posts",
      details: err.message,
    });
  }
}
export async function like(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID format" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // .includes is cleaner for boolean checks
    const isLiked = post.likes.includes(userId);
    let action;

    if (!isLiked) {
      post.likes.push(userId);
      action = "liked";
    } else {
      // Pull is a Mongoose-specific method that's cleaner than splice
      post.likes.pull(userId);
      action = "unliked";
    }

    await post.save();

    res.status(200).json({
      message: `Post ${action} successfully`,
      likesCount: post.likes.length,
      isLiked: action === "liked",
    });
  } catch (error) {
    console.error("Error in like controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate({
      path: "comments.userId",
      select: "fullName profilePic", // only fetch what you need for the UI
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Sort comments by createdAt descending (latest first)
    const sortedComments = post.comments.sort(
      (a, b) => b.createdAt - a.createdAt,
    );

    res.status(200).json(sortedComments);
  } catch (error) {
    console.error("Error in getComments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const newComment = { userId, text };

    post.comments.push(newComment);
    await post.save();

    // Optionally populate the user info of the new comment before sending back
    const updatedPost = await Post.findById(postId).populate(
      "comments.userId",
      "fullName profilePic",
    );

    const latestComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(201).json(latestComment);
  } catch (error) {
    console.error("Error in addComment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export async function getFeed(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Get only the friends array — no need to fetch the whole user doc
    const user = await User.findById(req.user._id).select("friends").lean();

    if (!user || user.friends.length === 0) {
      return res.status(200).json({ posts: [], hasMore: false });
    }

    // 2. Fetch posts in a single query — no populate, manual lookup only what's needed
    const posts = await Post.find({ userId: { $in: user.friends } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1) // fetch one extra to check if there's a next page
      .select("-__v -updatedAt")
      .populate("userId", "fullName profilePic")
      .lean();

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop(); // remove the extra one

    return res.status(200).json({ posts, hasMore, page });
  } catch (error) {
    console.error("Feed error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
