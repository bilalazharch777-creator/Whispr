import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMyFriends,
  getRecommendedUsers,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  getOutgoingFriendRequests,
  cancelFriendRequest,
  searchPeople,
  getUserProfile,
} from "../Controllers/user.controller.js";
const router = express.Router();

router.get("/search", searchPeople);

router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/profile/:id", getUserProfile);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);

router.delete("/friend-request/:id", cancelFriendRequest); // Delete/cancel any friend request (sent or received)

export default router;
