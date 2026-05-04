import { useState } from "react";
import { useParams } from "react-router"; // Import useParams
import { useQuery } from "@tanstack/react-query";
import { getUserPosts, getUserProfile } from "../lib/api"; // Added getUserProfile for others

import ProfileHeader from "../components/ProfileComponents/ProfileHeader";
import ProfileBio from "../components/ProfileComponents/ProfileBio";
import useAuthUser from "../hooks/useAuthUser";
import PostUpload from "../components/ProfileComponents/PostUpload";
import PostCard from "../components/ProfileComponents/PostCard";
import OwnerActionButtons from "../components/ProfileComponents/OwnerActionButtons";
import VisitorActionButtons from "../components/ProfileComponents/VisitorActionButtons";

const ProfilePage = () => {
  const { id: urlId } = useParams(); // Extract ID from URL
  const { authUser, isLoading: isAuthLoading } = useAuthUser();
  const [tempProfilePic, setTempProfilePic] = useState(null);

  // Determine if we are looking at our own profile
  const isOwnProfile = !urlId || urlId === authUser?._id;

  // The ID we actually want to fetch data for
  const targetUserId = isOwnProfile ? authUser?._id : urlId;

  // 1. Fetch Target User Data (only if it's someone else)
  const { data: targetUser, isLoading: isTargetUserLoading } = useQuery({
    queryKey: ["user", targetUserId],
    queryFn: () => getUserProfile(targetUserId),
    enabled: !!targetUserId && !isOwnProfile, // Only run if it's NOT our profile
  });

  // Use authUser if it's our profile, otherwise use the fetched targetUser
  const displayUser = isOwnProfile ? authUser : targetUser;

  // 2. Fetch Posts for whoever we are viewing
  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ["posts", targetUserId],
    queryFn: () => getUserPosts(targetUserId),
    enabled: !!targetUserId,
  });

  const posts = postsData?.posts || [];

  if (isAuthLoading || isTargetUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const userStats = {
    friends: displayUser?.friends?.length || 0,
    posts: displayUser?.posts?.length || 0,
    likes: displayUser?.receivedLikes?.length || 0,
  };

  const userBio = {
    livesIn: {
      city: displayUser?.city || "Unknown",
      country: displayUser?.country || "",
    },
    bornOn: displayUser?.dateOfBirth || "Not specified",
    studied: displayUser?.education || "Not specified",
    workAs: displayUser?.workAs || "Not specified",
    relationshipStatus: displayUser?.maritalStatus || "Single",
    detailedBio: displayUser?.bio || "No bio yet.",
  };

  const handleEditClick = () => {
    if (!isOwnProfile) return; // Guard
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setTempProfilePic(reader.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="container mx-auto max-w-4xl px-2 pb-10 pt-10">
      <ProfileHeader
        profilePic={tempProfilePic || displayUser?.profilePic}
        stats={userStats}
        username={displayUser?.fullName || displayUser?.username || "User"}
        onEditClick={handleEditClick}
        isOwnProfile={isOwnProfile} // Pass this prop to hide/show buttons
      />
      <ProfileBio bioData={userBio} isOwnProfile={isOwnProfile} />
      {isOwnProfile ? (
        <OwnerActionButtons />
      ) : (
        <VisitorActionButtons
          id={urlId}
          friendshipStatus={displayUser?.friendshipStatus || "none"}
        />
      )}
      <div className="mt-6 space-y-6">
        {/* Only show PostUpload on your own profile */}
        {isOwnProfile && <PostUpload />}

        {isPostsLoading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-dots loading-md"></span>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        ) : (
          <div className="text-center py-10 bg-base-100 rounded-xl border-2 border-dashed border-base-300">
            <p className="text-gray-500">
              {isOwnProfile
                ? "You haven't posted anything yet."
                : "This user hasn't posted anything yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
