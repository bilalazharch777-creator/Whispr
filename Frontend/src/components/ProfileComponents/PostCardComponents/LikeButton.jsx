import React from "react";
import { Heart } from "lucide-react";

// State is lifted to PostCard — this component is purely presentational
const LikeButton = ({ isLiked, likeCount, onLike, isLiking }) => {
  return (
    <button
      className={`btn btn-ghost flex-1 gap-2 transition-colors ${
        isLiked ? "text-red-500" : "hover:text-[#0a8dff]"
      }`}
      onClick={onLike}
      disabled={isLiking}
    >
      <span className="text-sm font-medium">
        {likeCount}
        <span className="hidden sm:inline">
          {" "}
          {likeCount === 1 ? "Like" : "Likes"}
        </span>
      </span>
      <Heart
        size={20}
        fill={isLiked ? "currentColor" : "none"}
        className={isLiked ? "scale-110 transition-transform" : ""}
      />
    </button>
  );
};

export default LikeButton;
