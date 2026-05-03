import { useState } from "react";
import Feed from "../components/HomeComponents/Feed";
import Stories from "../components/HomeComponents/Stories";
import StoryPage from "../components/HomeComponents/StoryPage";

const HomePage = () => {
  const [activeStoryId, setActiveStoryId] = useState(null);
  return (
    <>
      {activeStoryId && (
        <StoryPage
          storyId={activeStoryId}
          onClose={() => setActiveStoryId(null)}
        />
      )}
      <div className="md:max-w-2xl md:mx-auto lg:max-w-3xl">
        <Stories onStoryClick={(storyId) => setActiveStoryId(storyId)} />
        <Feed />
      </div>
    </>
  );
};

export default HomePage;
