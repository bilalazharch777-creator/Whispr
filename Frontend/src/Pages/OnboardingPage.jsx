// pages/OnboardingPage.jsx
import React, { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOnboarding } from "../lib/api";
import toast from "react-hot-toast";
import { Navigate } from "react-router";
import ImageUpload from "../components/Onboarding Components/ImageUpload";
import OnboardingForm from "../components/Onboarding Components/OnboardingForm";

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    email: authUser?.email || "",
    city: authUser?.city || "",
    country: authUser?.country || "",
    dateOfBirth: authUser?.dateOfBirth || "",
    education: authUser?.education || "",
    workAs: authUser?.workAs || "",
    maritalStatus: authUser?.maritalStatus || "",
    bio: authUser?.bio || "",
    profilePic: authUser?.profilePic || "",
  });

  const [redirect, setRedirect] = useState(false);

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully ✨");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setRedirect(true);
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    },
  });

  if (redirect) {
    return <Navigate to="/" />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const idx = Math.floor(Math.random() * 9) + 1;
    const randomAvatar = `/image${idx}.jpg`;
    setFormState({
      ...formState,
      profilePic: randomAvatar,
    });
    toast.success("Avatar changed successfully ✨");
  };

  const handleFileUpload = (fileData) => {
    setFormState({
      ...formState,
      profilePic: fileData,
    });
  };

  const completedFields = Object.values(formState).filter((val) => val).length;
  const totalFields = Object.keys(formState).length;
  const completionPercentage = Math.round(
    (completedFields / totalFields) * 100,
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-100 p-4 transition-colors duration-300">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0a8dff]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0a8dff]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl bg-base-100 border border-base-300/50">
        {/* Header - Mobile Top, Desktop Left */}
        <div className="flex flex-col lg:flex-row">
          {/* Profile Section - Mobile Top, Desktop Left */}
          <div className="w-full lg:w-[35%] p-6 md:p-8 lg:p-10 flex flex-col bg-base-100">
            <div className="space-y-8 w-full max-w-sm mx-auto">
              {/* Logo and Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                  <img
                    src="/logo.png"
                    className="w-10 h-10 flex items-center justify-center"
                  />
                  <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#0a8dff] to-[#0a8dff]">
                    WHISPRR
                  </h1>
                </div>
                <p className="text-center lg:text-left text-sm font-semibold text-base-content/60 uppercase tracking-[0.3em]">
                  Complete Your Profile
                </p>
              </div>

              {/* Image Upload Component */}
              <ImageUpload
                profilePic={formState.profilePic}
                onFileUpload={handleFileUpload}
                onRandomAvatar={handleRandomAvatar}
                authUser={authUser}
              />

              {/* Progress Bar - Only show on mobile */}
              <div className="lg:hidden pt-4 border-t border-base-300/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-base-content/60">
                    Profile Completion
                  </span>
                  <span className="font-medium text-[#0a8dff]">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="h-1.5 bg-base-300 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-[#0a8dff] transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section - Mobile Bottom, Desktop Right */}
          <div className="w-full lg:w-[65%] p-6 md:p-8 lg:p-10 xl:p-12 flex flex-col bg-base-100/50">
            <OnboardingForm
              formState={formState}
              setFormState={setFormState}
              onSubmit={handleSubmit}
              isPending={isPending}
              completionPercentage={completionPercentage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
