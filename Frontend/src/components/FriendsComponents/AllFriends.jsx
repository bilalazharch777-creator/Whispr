import {
  Users,
  MessageCircle,
  MapPin,
  Sparkles,
  Video,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router";
import { getProfileImageSrc } from "../../lib/imageHelper";

const AllFriends = ({
  friends,
  searchQuery,
  onFindFriendsClick,
  getFriendCardStyle,
}) => {
  // const [friendStatus] = useState({});
  const navigate = useNavigate();
  // Safe filtering with null/undefined checks - updated to use fullName
  const filteredFriends = friends.filter((friend) => {
    // Check if friend and friend.fullName exist before calling toLowerCase
    const friendName = friend?.fullName || friend?.name || "";
    return friendName.toLowerCase().includes((searchQuery || "").toLowerCase());
  });

  // Log the first friend to see its structure
  if (friends.length > 0) {
    console.log("First friend object structure:", friends[0]);
  }

  if (filteredFriends.length === 0) {
    return (
      <div className="animate-fadeIn">
        <div className="text-center py-16 bg-base-100/80 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
          <Users className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-base-content/70 mb-2">
            No friends found
          </h3>
          <p className="text-base-content/60 mb-4">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : "Try adjusting your search or explore suggestions"}
          </p>
          <button
            className="btn bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 hover:from-blue-700 hover:to-blue-600"
            onClick={onFindFriendsClick}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Find Friends
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Mobile View - Compact Cards */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Your Friends
        </h2>
      </div>

      <div className="block md:hidden space-y-2">
        {filteredFriends.map((friend) => {
          // Log each friend to see their structure
          console.log("Rendering friend:", friend);

          return (
            <div
              key={friend._id || friend.id}
              className="flex items-center justify-between p-3 bg-base-100/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={getProfileImageSrc(friend.profilePic || friend.avatar)}
                    alt={friend.fullName || friend.name || "Friend"}
                    className="w-12 h-12 rounded-full border-2 border-base-100 shadow-sm"
                    onError={(e) => {
                      console.log("Image failed to load:", e.target.src);
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                  {friend.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base-content text-sm truncate">
                    {friend.fullName || friend.name || "Unknown User"}
                  </h3>
                  {friend.location && (
                    <div className="flex items-center gap-1 text-xs text-base-content/60 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{friend.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-sm transition-all flex-shrink-0 ml-2"
                onClick={() =>
                  navigate("/chat", { state: { targetUserId: friend._id } })
                }
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Desktop/Tablet View - Original Large Cards */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredFriends.map((friend) => (
          <div
            key={friend._id || friend.id}
            className={`group relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${getFriendCardStyle ? getFriendCardStyle(friend) : ""}`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative p-5">
              {/* Avatar with Status Ring */}
              <div className="flex flex-col items-center mb-4">
                <img
                  src={getProfileImageSrc(friend.profilePic || friend.avatar)}
                  alt={friend.fullName || friend.name || "Friend"}
                  className="w-32 h-32 rounded-full border-4 border-base-100 shadow-lg"
                  onError={(e) => {
                    console.log("Image failed to load:", e.target.src);
                    e.target.src = "/default-avatar.png";
                  }}
                />
                {friend.isOnline && (
                  <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                )}

                <h3 className="text-lg font-bold text-base-content text-center">
                  {friend.fullName || friend.name || "Unknown User"}
                </h3>
                {friend.location && (
                  <div className="flex items-center gap-1 text-sm text-base-content/60 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{friend.location}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  className="flex-1 btn btn-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700"
                  onClick={() =>
                    navigate("/chat", { state: { targetUserId: friend._id } })
                  }
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllFriends;
