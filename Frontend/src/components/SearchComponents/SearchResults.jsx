import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  MapPin,
  X,
  UserPlus,
  UserCheck,
  MessageCircle,
  Search,
} from "lucide-react";

// --- User Card ---
const UserCard = ({ user }) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const name = user.fullName || "Unknown User";
  const location =
    user.city && user.country
      ? `${user.city}, ${user.country}`
      : user.city || user.country || "Unknown Location";
  const avatar =
    user.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // Navigate to profile but ignore if action buttons are clicked
  const handleCardClick = (e) => {
    if (e.target.closest("button")) return;
    navigate(`/profile/${user._id}`);
  };

  return (
    <div
      className="py-4 transition-transform duration-300 hover:-translate-y-1 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4">
        {/* Avatar Section */}
        <div className="avatar">
          <div className="w-12 h-12 rounded-full ring ring-primary/20 ring-offset-2 ring-offset-base-100 transition-all group-hover:ring-[#0a8dff]">
            <img src={avatar} alt={name} className="object-cover" />
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1">
          <h3 className="font-semibold text-base text-base-content group-hover:text-[#0a8dff] transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-base-content/60 text-xs">
            <MapPin className="w-3 h-3" />
            <span>{location}</span>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            style={
              !isFollowing
                ? { backgroundColor: "#0a8dff", color: "white", border: "none" }
                : {}
            }
            className={`btn btn-xs rounded-full gap-1 transition-all duration-200 ${
              !isFollowing ? "shadow-md shadow-[#0a8dff]/30" : "hover:btn-error"
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3 h-3" />
                <span className="text-xs">
                  {isHovered ? "Unfollow" : "Following"}
                </span>
              </>
            ) : (
              <>
                <UserPlus className="w-3 h-3" />
                <span className="text-xs">Follow</span>
              </>
            )}
          </button>
          <button className="btn btn-ghost btn-xs rounded-full hover:bg-base-300">
            <MessageCircle className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Skeleton Card ---
const SkeletonCard = () => (
  <div className="py-4 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="skeleton w-12 h-12 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-32 rounded-full"></div>
        <div className="skeleton h-3 w-24 rounded-full"></div>
      </div>
      <div className="skeleton h-7 w-20 rounded-full"></div>
    </div>
  </div>
);

// --- Main Search Results Component ---
const SearchResults = ({
  results = [],
  isLoading,
  isError,
  isFetched,
  error,
  debouncedTerm,
  onSuggestionClick,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Error State */}
      {isError && (
        <div className="alert alert-error mb-6 shadow-sm">
          <X className="w-4 h-4" />
          <span>
            {error?.response?.data?.message ||
              "Search failed. Check your connection."}
          </span>
        </div>
      )}

      {/* Result Stats */}
      {isFetched && debouncedTerm && !isLoading && !isError && (
        <div className="mb-4 pb-2 border-b border-base-200">
          <p className="text-base-content/60 text-xs">
            Found{" "}
            <span className="font-semibold text-base-content">
              {results.length}
            </span>{" "}
            people
          </p>
        </div>
      )}

      {/* Results List */}
      <div className="divide-y divide-base-200">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => <SkeletonCard key={idx} />)
        ) : results.length > 0 ? (
          results.map((user) => <UserCard key={user._id} user={user} />)
        ) : isFetched && debouncedTerm && !isLoading ? (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-base-content/30 mx-auto mb-3" />
            <h3 className="font-bold text-lg">No results found</h3>
            <p className="text-base-content/60 text-sm">
              No one matches "{debouncedTerm}"
            </p>
          </div>
        ) : (
          /* Empty/Initial State */
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="relative w-18 h-18">
              <div className="w-16 h-16 rounded-full bg-base-200 border border-base-300 flex items-center justify-center">
                <Search className="w-7 h-7 text-base-content/40" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-base-100 border border-base-300 flex items-center justify-center">
                <Users className="w-3 h-3 text-base-content/40" />
              </div>
            </div>

            <div className="text-center max-w-xs">
              <p className="text-base font-medium text-base-content mb-1">
                Find someone
              </p>
              <p className="text-sm text-base-content/50 leading-relaxed">
                Type a name above to search across all community members
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {["Alex", "Sarah", "Jordan"].map((name) => (
                <button
                  key={name}
                  onClick={() => onSuggestionClick(name)}
                  className="btn btn-xs btn-ghost rounded-full border border-base-300 text-base-content/50 text-xs"
                >
                  Try "{name}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
