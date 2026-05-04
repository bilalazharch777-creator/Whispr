import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStory, likeStory } from "../../lib/api";
import { useEffect, useRef, useState } from "react";

const STORY_DURATION = 60000; // 30 seconds

const StoryPage = ({ storyId, onClose }) => {
  const queryClient = useQueryClient();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["story", storyId],
    queryFn: () => getStory(storyId),
  });

  const { mutate: handleLike } = useMutation({
    mutationFn: () => likeStory(storyId),
    onSuccess: () => {
      setLiked(true);
      queryClient.invalidateQueries(["story", storyId]);
      console.log("Story Like sucksexfull!");
    },
  });

  // Progress timer for images
  useEffect(() => {
    if (!data || data.mediaType !== "image") return;

    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current);
        onClose();
      }
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [data, onClose]);

  // Video progress tracking
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pct =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(pct);
  };

  const handleVideoEnd = () => onClose();

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Check out this story!",
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Loading */}
      {isLoading && (
        <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-white/60 text-sm">Story not found or expired.</p>
          <button onClick={onClose} className="text-blue-400 text-sm">
            Go back
          </button>
        </div>
      )}

      {/* Story Content */}
      {data && (
        <div className="relative w-full max-w-sm h-screen md:h-[90vh] md:rounded-2xl overflow-hidden flex flex-col bg-neutral-900">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-3">
            <div className="w-full h-[3px] bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Header */}
          <div className="absolute top-6 left-0 right-0 z-10 flex items-center gap-3 px-4 pt-2">
            <img
              src={data.owner.profilePic || "/avatar.png"}
              alt={data.owner.fullName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white/30"
            />
            <div>
              <p className="text-white text-sm font-semibold leading-tight">
                {data.owner.fullName}
              </p>
              <p className="text-white/50 text-[11px]">
                {new Date(data.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Media */}
          <div className="flex-1 flex items-center justify-center">
            {data.mediaType === "image" ? (
              <img
                src={data.cloudinaryLink}
                alt="story"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                src={data.cloudinaryLink}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
              />
            )}
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-6 pt-10 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
            {/* Video play/pause — only for video */}
            {data.mediaType === "video" ? (
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                )}
              </button>
            ) : (
              <div /> // spacer to keep like/share right-aligned
            )}

            {/* Like + Share */}
            <div className="flex items-center gap-3">
              {/* Like */}
              <button
                onClick={() => !liked && handleLike()}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full backdrop-blur transition-all
                  ${liked ? "bg-red-500/80 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill={liked ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                  />
                </svg>
                <span className="text-xs font-medium">
                  {liked ? data.likesCount + 1 : data.likesCount}
                </span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="text-xs font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryPage;
