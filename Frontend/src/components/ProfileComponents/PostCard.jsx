import React, { useState } from "react";
import { MoreHorizontal, MessageCircleMore } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { like } from "../../lib/api";
import LikeButton from "./PostCardComponents/LikeButton";
import ShareButton from "./PostCardComponents/ShareButton";
import Comments from "./PostCardComponents/Comments";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

const PostCard = ({ post = {} }) => {
  const [showComments, setShowComments] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);

  const queryClient = useQueryClient();

  const { mutate: likeMutate, isPending: isLiking } = useMutation({
    mutationFn: () => like(post._id),
    // Optimistic update — flip immediately, server confirms
    onMutate: () => {
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    },
    onError: () => {
      // Roll back on failure
      toast.error("Unable to Like the Post. Please try again Later!");
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
    },
    onSuccess: (data) => {
      // Invalidate posts so the feed refetches fresh like counts
      if (data.isLiked) {
        toast.success("Post Liked Successfully!");
      } else {
        toast.success("Post Unliked Successfully!");
      }
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleLike = () => {
    if (isLiking) return;
    likeMutate();
  };
  if (!post || typeof post !== "object") {
    return (
      <div className="card bg-base-100 shadow-md max-w-2xl mx-auto p-4">
        <p className="text-error">Invalid post data</p>
      </div>
    );
  }

  const user = post?.userId;

  const hasMedia =
    post?.media && Array.isArray(post?.media) && post.media.length > 0;

  const bgType = post?.background?.bgType;
  const bgValue = post?.background?.value;
  const isColorBg =
    !hasMedia && bgType === "color" && bgValue && bgValue !== "#ffffff";
  const isImageBg = !hasMedia && bgType === "image" && bgValue;
  const isTextWithBg = isColorBg || isImageBg;

  const timeAgo = post?.createdAt ? getTimeAgo(new Date(post.createdAt)) : "";

  const bgStyle = isImageBg
    ? {
        backgroundImage: `url(${bgValue})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : isColorBg
      ? { backgroundColor: bgValue }
      : {};

  return (
    <div className="card bg-base-100 shadow-md max-w-4xl mx-auto mb-1">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="avatar">
          <div className="w-11 h-11 rounded-full">
            <img
              src={user?.profilePic}
              alt={user?.fullName || "User"}
              onError={(e) => {
                e.target.src =
                  "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg";
              }}
            />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {user?.fullName || "Anonymous User"}
          </h3>
          {timeAgo && (
            <div className="flex items-center gap-1 text-xs text-base-content/60">
              <span>{timeAgo}</span>
            </div>
          )}
        </div>
        <button className="btn btn-ghost btn-sm btn-circle">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      {isTextWithBg ? (
        <div className="min-h-[120px] flex items-center p-6" style={bgStyle}>
          {post.text && (
            <p
              className="text-lg break-words w-full"
              style={{
                color: post?.textStyle?.color === "white" ? "#fff" : "#374151",
                fontWeight:
                  post?.textStyle?.fontWeight === "bold" ? "700" : "400",
                textShadow:
                  post?.textStyle?.color === "white"
                    ? "0 1px 3px rgba(0,0,0,0.5)"
                    : "none",
              }}
            >
              {post.text}
            </p>
          )}
        </div>
      ) : hasMedia ? (
        <>
          {post.text && <p className="px-4 pb-3 pt-4">{post.text}</p>}
          <div
            className={`grid gap-0.5 ${
              post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {post.media.map((media, index) => (
              <div
                key={index}
                className={
                  post.media.length === 3 && index === 2 ? "col-span-2" : ""
                }
              >
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt="Post content"
                    className="w-full object-cover"
                    style={{
                      maxHeight: post.media.length > 1 ? "250px" : "400px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <video controls className="w-full max-h-[400px]">
                    <source src={media.url} type="video/mp4" />
                  </video>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="px-4 pb-3 pt-4">{post.text && <p>{post.text}</p>}</div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-base-300 px-2 py-1">
        {/* LikeButton receives lifted state + handler from PostCard */}
        <LikeButton
          isLiked={isLiked}
          likeCount={likeCount}
          onLike={handleLike}
          isLiking={isLiking}
        />

        <button
          className={`btn btn-ghost btn-sm flex-1 gap-2 ${showComments ? "text-[#0a8dff]" : ""}`}
          onClick={() => setShowComments(!showComments)}
        >
          <span className="text-sm flex gap-2">
            {post?.comments?.length || 0}{" "}
            <span className="hidden sm:inline">
              {post?.comments?.length === 1 ? "Comment" : "Comments"}
            </span>
            <MessageCircleMore className="sm:hidden" />
          </span>
        </button>

        <ShareButton post={post} />
      </div>

      {/* Comments Section */}
      {showComments && (
        <AnimatePresence>
          <div className="border-t border-base-300">
            <Comments post={post} onClose={() => setShowComments(false)} />
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

const getTimeAgo = (date) => {
  if (!date || isNaN(date.getTime())) return "";
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 0) return "just now";
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "just now";
};

export default PostCard;
