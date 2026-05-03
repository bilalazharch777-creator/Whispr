import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  upload,
  allPosts,
  like,
  getComments,
  addComment,
  getFeed,
} from "../Controllers/post.controller.js";

const router = express.Router();

router.post("/upload", protectRoute, upload);
router.get("/feed", protectRoute, getFeed);
router.get("/user/:id", allPosts);
router.post("/:postId/like", protectRoute, like);
router.get("/:postId/comments", protectRoute, getComments);
router.post("/:postId/comment", protectRoute, addComment);

export default router;
