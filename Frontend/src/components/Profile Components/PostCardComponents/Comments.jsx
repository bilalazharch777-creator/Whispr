import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComments, addComment } from "../../../lib/api.js";
import toast from "react-hot-toast";

const Comments = ({ post, onClose }) => {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();
  const textareaRef = useRef(null);

  // 1. DISABLE BG SCROLL
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleTextareaChange = (e) => {
    setNewComment(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  useEffect(() => {
    // Save original styles
    const originalHtmlOverflow = window.getComputedStyle(
      document.documentElement,
    ).overflow;
    const originalBodyOverflow = window.getComputedStyle(
      document.body,
    ).overflow;

    // Prevent scrolling on both elements
    document.documentElement.style.setProperty(
      "overflow",
      "hidden",
      "important",
    );
    document.body.style.setProperty("overflow", "hidden", "important");

    return () => {
      // Restore original styles
      document.documentElement.style.setProperty(
        "overflow",
        originalHtmlOverflow,
      );
      document.body.style.setProperty("overflow", originalBodyOverflow);
    };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["comments", post?._id],
    queryFn: () => getComments(post._id),
    enabled: !!post?._id,
  });

  const comments = Array.isArray(data) ? data : data?.comments || [];

  const mutation = useMutation({
    mutationFn: (text) => addComment(post._id, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries(["comments", post._id]);
      setNewComment("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      toast.success("Comment added!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add comment");
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim() || mutation.isPending) return;
    mutation.mutate(newComment);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
        onClick={onClose}
      />

      {/* Panel - Using DaisyUI Theme Classes */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: "8vh" }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
        // CHANGED: bg-base-100 and text-base-content for theme support
        className="fixed inset-x-0 bottom-0 z-[50] flex flex-col h-[92vh] max-w-[680px] mx-auto bg-base-100 text-base-content rounded-t-[24px] shadow-2xl overflow-hidden border-t border-base-300"
        role="dialog"
      >
        {/* Drag Pill */}
        <div className="w-12 h-1.5 rounded-full bg-base-300 mx-auto mt-3 shrink-0" />

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-base-300 shrink-0">
          <button
            className="btn btn-circle btn-sm btn-ghost border border-base-300"
            onClick={onClose}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h3 className="text-lg font-bold tracking-tight">Comments</h3>
            <p className="text-xs opacity-50">
              {isLoading ? "Loading..." : `${comments.length} responses`}
            </p>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
          {isLoading ? (
            <div className="flex justify-center py-10 opacity-40">
              <Loader2 className="animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20 gap-3">
              <MessageCircle size={40} />
              <p className="text-sm">Be the first to whisper...</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="flex gap-3">
                <div className="avatar shrink-0">
                  <div className="w-10 h-10 rounded-full border border-base-300">
                    <img
                      src={c.userId?.profilePic || "/default-pic.png"}
                      alt="user"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-base-200 rounded-2xl rounded-tl-none p-3 border border-base-300/50">
                    {/* Using primary color for name */}
                    <p className="text-xs font-bold text-primary mb-1">
                      {c.userId?.fullName}
                    </p>
                    <p className="text-sm leading-relaxed">{c.text}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Dock - Using base-200 for distinct background */}
        <div className="p-4 pb-44 lg:pb-16 border-t border-base-300 bg-base-200 shrink-0">
          <div className="flex items-end gap-2.5 bg-base-100 border border-base-300 rounded-2xl px-3 py-2.5 focus-within:border-primary/40 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none text-sm resize-none max-h-32 py-1"
              placeholder="Add a comment..."
              value={newComment}
              onChange={handleTextareaChange}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), handleSubmit())
              }
            />
            <button
              className="btn btn-circle btn-sm btn-primary text-primary-content hover:scale-105 disabled:opacity-20 shadow-lg"
              onClick={handleSubmit}
              disabled={!newComment.trim() || mutation.isPending}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Comments;
