import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getStory,
  getStoryFeed,
  toggleLikeStory,
  uploadStory,
} from "../Controllers/story.controller.js";
const router = express.Router();

router.use(protectRoute);

router.post("/upload", uploadStory);
router.patch("/like/:id", toggleLikeStory);
router.get("/feed", getStoryFeed);
router.get("/:id", getStory);

export default router;
