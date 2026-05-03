import React from "react";
import { Share2 } from "lucide-react";
import toast from "react-hot-toast";

const ShareButton = ({ post }) => {
  const handleShare = async () => {
    const shareData = {
      title: "Check out this post!",
      text: post?.text?.substring(0, 50),
      url: window.location.href, // Or post specific URL
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="btn btn-ghost flex-1 gap-2 hover:text-[#0a8dff]"
    >
      <Share2 size={18} />
      <span className="text-sm font-medium text-base-content/70">Share</span>
    </button>
  );
};

export default ShareButton;
