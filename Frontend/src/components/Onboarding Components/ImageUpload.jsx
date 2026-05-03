import React, { useState } from "react";
import { Upload, Sparkles, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "../../hooks/UploadtoCloudinary";

const ImageUpload = ({
  profilePic,
  onFileUpload,
  onRandomAvatar,
  authUser,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const toastId = toast.loading("Preparing upload...");

      // Call the imported utility function
      // It returns { url, type }
      const result = await uploadToCloudinary(file, (percent) => {
        toast.loading(`Uploading: ${percent}%`, { id: toastId });
      });

      if (!result?.url) {
        throw new Error("Upload failed");
      }

      // Update parent state (OnboardingPage formState) with the returned URL
      onFileUpload(result.url);

      toast.success("Image uploaded successfully ✨", { id: toastId });
    } catch (error) {
      console.error("Cloudinary Error:", error);
      toast.dismiss();
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture Container */}
      <div className="relative group mx-auto lg:mx-0">
        <div className="w-40 h-40 md:w-48 md:h-48 mx-auto lg:mx-0 rounded-full bg-gradient-to-br from-[#0a8dff] via-[#0a8dff]/60 to-[#0a8dff]/30 p-[3px] shadow-lg shadow-[#0a8dff]/20">
          <div className="w-full h-full rounded-full bg-base-200 overflow-hidden flex items-center justify-center border-4 border-base-100">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle className="w-24 h-24 md:w-32 md:h-32 text-base-content/40" />
            )}
          </div>
        </div>
      </div>

      {/* Upload Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        <label className="block w-full cursor-pointer">
          <div
            className={`p-3 md:p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
              uploading
                ? "border-base-300 bg-base-200/50"
                : "border-base-300 hover:border-[#0a8dff] hover:bg-[#0a8dff]/5"
            }`}
          >
            <div className="flex items-center gap-3">
              <Upload
                className={`w-5 h-5 ${uploading ? "animate-bounce" : "text-[#0a8dff]"}`}
              />
              <div>
                <p className="text-sm font-medium">
                  {uploading ? "Processing..." : "Upload Photo"}
                </p>
                <p className="text-xs text-base-content/60">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>

        <button
          type="button"
          onClick={onRandomAvatar}
          disabled={uploading}
          className="w-full p-4 rounded-xl bg-base-200 border border-base-300 flex items-center gap-3 hover:bg-base-300 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5 text-[#0a8dff]" />
          <span className="text-sm font-medium">Choose Random Avatar</span>
        </button>
      </div>

      {/* Member Since Card */}
      <div className="p-4 rounded-xl bg-base-200/50 border border-base-300">
        <p className="text-sm text-base-content/60">
          Member since{" "}
          <span className="font-bold">
            {authUser?.createdAt
              ? new Date(authUser.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "—"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;
