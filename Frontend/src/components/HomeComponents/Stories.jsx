import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getFeed } from "../../lib/api";
import useAuthUser from "../../hooks/useAuthUser";
import { getProfileImageSrc } from "../../lib/imageHelper";
const Stories = ({ onStoryClick }) => {
  const { authUser } = useAuthUser();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["story-feed"],
    queryFn: getFeed,
  });
  if (isLoading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto hide-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-20 h-20 rounded-full bg-base-300 animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  if (isError)
    return (
      <div className="p-6 text-center opacity-50 text-sm">
        Error loading stories.
      </div>
    );

  return (
    <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar bg-base-100 border-white/5">
      {/* My Story / Add Story Circle */}
      {data?.myStory ? (
        <StoryCircle
          item={data.myStory}
          isMe={true}
          getImageSrc={getProfileImageSrc}
          onClick={() => onStoryClick(data.myStory.storyId)}
        />
      ) : (
        <AddStoryCircle
          user={authUser}
          getImageSrc={getProfileImageSrc}
          onClick={() => onStoryClick(null)}
        />
      )}

      {/* Friends Stories */}
      {data?.friendsStories?.map((friendStory) => (
        <StoryCircle
          key={friendStory.storyId}
          item={friendStory}
          isMe={false}
          getImageSrc={getProfileImageSrc}
          onClick={() => onStoryClick(friendStory.storyId)}
        />
      ))}
    </div>
  );
};

const AddStoryCircle = ({ onClick, user, getImageSrc }) => (
  <div
    onClick={onClick}
    className="group flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
  >
    <div className="relative p-[2.5px] rounded-full bg-white/10 transition-transform group-hover:scale-105 active:scale-95">
      <div className="bg-base-100 p-[2px] rounded-full">
        <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center overflow-hidden">
          {user?.profilePic ? (
            <img
              src={getImageSrc(user.profilePic)}
              alt="Profile"
              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
              onError={(e) => {
                e.target.src = "/avatar.png";
              }}
            />
          ) : (
            <div className="text-2xl opacity-40">+</div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-500 border-2 border-base-100 flex items-center justify-center text-white font-bold text-xs">
        +
      </div>
    </div>
    <span className="text-[11px] font-medium opacity-80">Add Story</span>
  </div>
);

const StoryCircle = ({ item, isMe, onClick, getImageSrc }) => (
  <div
    onClick={onClick}
    className="group flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
  >
    <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-[#0a8dff] to-cyan-400 transition-transform group-hover:scale-105">
      <div className="bg-base-100 p-[2px] rounded-full">
        <img
          src={getImageSrc(item.profilePic)}
          alt="Story"
          className="w-20 h-20 rounded-full object-cover border border-white/5"
          onError={(e) => {
            e.target.src = "/avatar.png";
          }}
        />
      </div>
    </div>
    <span className="text-[11px] font-medium opacity-80">
      {isMe ? "Your Story" : item.fullName?.split(" ")[0]}
    </span>
  </div>
);

export default Stories;
