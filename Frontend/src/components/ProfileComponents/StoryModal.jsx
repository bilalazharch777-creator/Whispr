import { useRef, useState } from "react";
import { Video, Upload, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadStory } from "../../lib/api";
import { uploadToCloudinary } from "../../hooks/useCloudinary";
import toast from "react-hot-toast";

const StoryModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCloudinaryLoading, setIsCloudinaryLoading] = useState(false);

  const { mutate: postStory, isPending: isBackendUpdating } = useMutation({
    mutationFn: uploadStory,
    onSuccess: () => {
      toast.success("Story posted successfully!");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      handleClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save story");
    },
  });

  const handlePostStory = async () => {
    if (!file) return;
    try {
      setIsCloudinaryLoading(true);
      setError("");
      const cloudinaryResult = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });
      postStory({
        cloudinaryLink: cloudinaryResult.url,
        mediaType: cloudinaryResult.type,
      });
    } catch (err) {
      setError("Failed to upload media to Cloudinary");
      console.error(err);
    } finally {
      setIsCloudinaryLoading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");
    setPreview(null);
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    if (selectedFile.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 60) {
          setError("Video must be 1 minute or shorter");
          setFile(null);
        } else {
          setFile(selectedFile);
          setPreview("video");
        }
      };
      video.src = URL.createObjectURL(selectedFile);
    } else {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const resetModal = () => {
    setFile(null);
    setPreview(null);
    setError("");
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const isUploading = isCloudinaryLoading || isBackendUpdating;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isUploading ? handleClose : undefined}
      />

      {/* Modal box */}
      <div className="relative z-10 w-full sm:max-w-lg bg-base-100 border border-white/5 overflow-hidden sm:rounded-2xl rounded-t-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Create Story</h3>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!file ? (
            <div
              onClick={() => !isUploading && fileInputRef.current.click()}
              className={`group border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all
                ${error ? "border-error/50 bg-error/5" : "border-base-content/10 hover:border-[#0a8dff]/50 hover:bg-[#0a8dff]/5"}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-[#0a8dff]" />
              </div>
              <div className="text-center">
                <p className="font-medium text-base-content">
                  Click to upload media
                </p>
                <p className="text-xs text-base-content/50 mt-1">
                  Image or Video (Max 10MB / 1 min)
                </p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-base-200 aspect-video flex items-center justify-center border border-white/5">
              {preview === "video" ? (
                <div className="flex flex-col items-center gap-2">
                  <Video className="w-12 h-12 text-[#0a8dff]" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              {!isUploading && (
                <button
                  onClick={resetModal}
                  className="absolute top-2 right-2 btn btn-circle btn-xs btn-error shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              {isCloudinaryLoading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4">
                  <progress
                    className="progress progress-primary w-56"
                    value={uploadProgress}
                    max="100"
                  />
                  <span className="text-white text-sm mt-2">
                    Uploading to Cloud... {uploadProgress}%
                  </span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 text-error text-sm flex items-center gap-2 px-1">
              <span className="w-1 h-1 rounded-full bg-error" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-base-200/50 flex gap-3 justify-end items-center">
          {isBackendUpdating && (
            <span className="text-xs opacity-60">Saving to database...</span>
          )}
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handlePostStory}
            disabled={!file || !!error || isUploading}
            className="btn bg-[#0a8dff] hover:bg-[#0a8dff]/80 text-white border-none min-w-[120px]"
          >
            {isUploading ? (
              <span className="loading loading-spinner" />
            ) : (
              "Post Story"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryModal;
