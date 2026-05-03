import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PostForm from "./PostForm";
import toast from "react-hot-toast";
import { uploadPost } from "../../lib/api";
import useAuthUser from "../../hooks/useAuthUser";
import { uploadToCloudinary } from "../../hooks/UploadToCloudinary";

const PostUpload = () => {
  const queryClient = useQueryClient();
  const { authUser, isLoading: isAuthLoading } = useAuthUser();

  const [postData, setPostData] = useState({
    text: "",
    mediaFiles: [], // Array of media items: [{ file, type, previewUrl }]
    background: { bgType: "color", value: "#ffffff" },
    textStyle: { color: "black", fontWeight: "normal" },
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: uploadPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setPostData({
        text: "",
        mediaFiles: [],
        background: { bgType: "color", value: "#ffffff" },
        textStyle: { color: "black", fontWeight: "normal" },
      });
      setUploadProgress(0);
      toast.success("Post uploaded!");
    },
    onError: (error) => {
      const errorMsg =
        error.response?.data?.error || error.message || "Failed to create post";
      toast.error(errorMsg);
    },
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!authUser?._id) {
      return toast.error("User not authenticated. Please wait...");
    }

    if (!postData.text.trim() && postData.mediaFiles.length === 0) {
      return toast.error("Please add some text or media to your post");
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload all media files to Cloudinary
      const uploadedMedia = [];

      if (postData.mediaFiles.length > 0) {
        for (let i = 0; i < postData.mediaFiles.length; i++) {
          const mediaItem = postData.mediaFiles[i];

          const result = await uploadToCloudinary(
            mediaItem.file,
            (fileProgress) => {
              // Calculate overall progress considering multiple files
              const overallProgress =
                ((i + fileProgress / 100) / postData.mediaFiles.length) * 100;
              setUploadProgress(Math.round(overallProgress));
            },
          );

          uploadedMedia.push({
            url: result.url,
            type: result.type,
          });
        }
      }

      const payload = {
        id: authUser._id,
        text: postData.text,
        background: postData.background,
        textStyle: postData.textStyle,
        media: uploadedMedia, // Array of { url, type } from Cloudinary
      };

      console.log("Submitting Payload:", payload);
      mutation.mutate(payload);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload media. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Upload progress indicator */}
      {isUploading && uploadProgress > 0 && (
        <div className="mb-4 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Uploading media...
            </span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <PostForm
        postData={postData}
        setPostData={setPostData}
        onSubmit={handleSubmit}
        isUploading={isUploading || mutation.isPending || isAuthLoading}
        uploadProgress={uploadProgress}
      />
    </div>
  );
};

export default PostUpload;
