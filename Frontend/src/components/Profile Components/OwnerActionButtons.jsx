import { useState } from "react";
import { useNavigate } from "react-router";
import StoryModal from "./StoryModal";

function OwnerActionButtons() {
  const navigate = useNavigate();
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  return (
    <div className="flex gap-2 pt-6">
      <button
        onClick={() => setIsStoryModalOpen(true)}
        className="flex-1 px-6 py-2.5 text-center rounded-lg bg-[#0a8dff] hover:bg-[#0a8dff]/90 text-white font-medium transition-all duration-300"
      >
        Add to Story
      </button>

      <button
        onClick={() => navigate("/onboarding")}
        className="flex-1 px-6 py-2.5 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-base-content font-medium transition-all duration-300"
      >
        Edit Profile
      </button>

      <StoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />
    </div>
  );
}

export default OwnerActionButtons;
