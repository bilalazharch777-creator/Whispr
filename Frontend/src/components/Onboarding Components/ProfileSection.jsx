import React from "react";
import { Upload, UserCircle, Sparkles } from "lucide-react";
import useAuthUser from "../../hooks/useAuthUser";
import ProgressBar from "./ProgressBar";
const ProfileSection = ({
  formState,
  handleFileUpload,
  handleRandomAvatar,
}) => {
  const { authUser } = useAuthUser();

  return (
    <div className="w-full lg:w-[35%] p-6 md:p-8 lg:p-10 flex flex-col bg-base-100">
      <div className="space-y-8 w-full max-w-sm mx-auto">
        {/* Logo and Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
            <img
              src="/logo.png"
              className="w-10 h-10 rounded-xl flex items-center justify-center"
            />
            <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#0a8dff] to-[#0a8dff]">
              WHISPRR
            </h1>
          </div>
          <p className="text-center lg:text-left text-base-content/70 text-sm">
            Tell us more about yourself
          </p>
        </div>

        {/* Profile Picture */}
        <div className="space-y-6">
          <div className="relative group pl-14 lg:mx-0">
            <div className="w-40 h-40 md:w-48 md:h-48 mx-auto lg:mx-0 rounded-full bg-gradient-to-br from-[#0a8dff] via-[#0a8dff]/60 to-[#0a8dff]/30 p-[3px] shadow-lg shadow-[#0a8dff]/20">
              <div className="w-full h-full rounded-full bg-base-200 overflow-hidden flex items-center justify-center border-4 border-base-100">
                <img
                  src={
                    formState.profilePic.startsWith("data:") ||
                    formState.profilePic.startsWith("/avatar")
                      ? formState.profilePic
                      : `http://localhost:5001${formState.profilePic}`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Upload Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <label className="block w-full cursor-pointer">
              <div className="p-3 md:p-4 rounded-xl border-2 border-dashed border-base-300 hover:border-[#0a8dff] hover:bg-[#0a8dff]/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#0a8dff]/10 flex items-center justify-center">
                    <Upload className="w-4 h-4 md:w-5 md:h-5 text-[#0a8dff]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs md:text-sm font-medium text-base-content">
                      Upload Photo
                    </p>
                    <p className="text-[10px] md:text-xs text-base-content/60">
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
              />
            </label>

            <button
              onClick={handleRandomAvatar}
              className="w-full p-3 md:p-4 rounded-xl bg-base-200 hover:bg-base-300 border border-base-300 hover:border-[#0a8dff] transition-all duration-300 flex items-center justify-center lg:justify-start gap-2 md:gap-3 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#0a8dff]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#0a8dff]" />
              </div>
              <span className="text-xs md:text-sm font-medium text-base-content">
                Choose Random Avatar
              </span>
            </button>
          </div>

          {/* Member Since */}
          <div className="p-3 md:p-4  text-center lg:text-left">
            <hr />
            <p className="mt-4 text-xs md:text-sm text-center text-base-content/60">
              Member since{" "}
              <span>
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

        {/* Progress Bar - Only show on mobile */}
        <div className="lg:hidden pt-4 border-t border-base-300/50">
          <ProgressBar percentage={formState.completionPercentage} />
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
