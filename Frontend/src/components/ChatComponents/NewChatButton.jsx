import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../../lib/api";
import { getProfileImageSrc } from "../../lib/imageHelper";
import { Plus, Search, User, X } from "lucide-react";

const NewChatButton = ({ chatClient, onChannelCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: friendsData, isLoading } = useQuery({
    queryKey: ["userFriends"],
    queryFn: getUserFriends,
    enabled: isOpen,
  });

  const friends = friendsData || [];

  const filteredFriends = friends.filter((friend) => {
    const name = friend?.fullName || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleCreateChannel = async (friendId) => {
    try {
      const channel = chatClient.channel("messaging", {
        members: [chatClient.userID, friendId],
      });
      await channel.watch();
      onChannelCreated(channel);
      handleClose();
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  return (
    <>
      {/* + Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-6 right-6 btn btn-circle shadow-xl border-none text-white z-50 hover:scale-110 active:scale-95 transition-all duration-300 bg-[#0a8dff]"
      >
        <Plus size={28} />
      </button>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-base-100 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-base-300" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-base-300">
          <h3 className="text-lg font-bold text-base-content">New Message</h3>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-base-300">
          <label className="input input-bordered input-sm flex items-center gap-2 w-full bg-base-200">
            <Search size={14} className="text-base-content/40" />
            <input
              type="text"
              placeholder="Search friends..."
              className="grow bg-transparent outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus={isOpen}
            />
          </label>
        </div>

        {/* Friends count label */}
        <div className="px-5 py-2">
          <p className="text-xs text-base-content/40 font-medium uppercase tracking-wider">
            Friends — {filteredFriends.length}
          </p>
        </div>

        {/* Friends List — scrollable, max height */}
        <div
          className="overflow-y-auto hide-scrollbar"
          style={{ maxHeight: "60vh" }}
        >
          {isLoading ? (
            <div className="flex flex-col gap-0">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 border-b border-base-200"
                >
                  <div className="w-11 h-11 rounded-full bg-base-300 animate-pulse flex-shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-3.5 bg-base-300 rounded-full animate-pulse w-2/5" />
                    <div className="h-3 bg-base-300 rounded-full animate-pulse w-3/5 opacity-60" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <button
                key={friend._id || friend}
                onClick={() => handleCreateChannel(friend._id || friend)}
                className="flex items-center gap-3 w-full px-5 py-3 hover:bg-base-200 border-b border-base-200 transition-colors text-left"
              >
                <div className="avatar flex-shrink-0">
                  <div className="w-11 h-11 rounded-full">
                    {friend.profilePic ? (
                      <img
                        src={getProfileImageSrc(friend.profilePic)}
                        alt={friend.fullName || "User"}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="bg-base-300 flex items-center justify-center h-full rounded-full">
                        <User size={20} className="text-base-content/50" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-base-content truncate">
                    {friend.fullName || "Unknown"}
                  </p>
                  <p className="text-xs text-base-content/40 truncate">
                    {friend.bio || "Tap to start chatting"}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="text-4xl">🔍</div>
              <p className="text-sm text-base-content/50">
                {searchTerm
                  ? `No friends matching "${searchTerm}"`
                  : "No friends yet"}
              </p>
            </div>
          )}
        </div>

        {/* Bottom safe area padding */}
        <div className="h-20" />
      </div>
    </>
  );
};

export default NewChatButton;
