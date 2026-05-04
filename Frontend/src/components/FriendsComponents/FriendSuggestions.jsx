// // FriendSuggestions.jsx

// FriendSuggestions.jsx
import { useState } from "react";
import {
  Users as UsersIcon,
  MapPin,
  Sparkles,
  UserPlus,
  Check,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendFriendRequest } from "../../lib/api";
import { toast } from "react-hot-toast";
import { useMemo, useCallback, useRef, useEffect } from "react";
import { getProfileImageSrc } from "../../lib/imageHelper";

const FriendSuggestions = ({
  suggestions = [],
  searchQuery = "",
  outgoingRequestsIds = new Set(),
  isLoading = false,
  hasMore = false,
  onLoadMore = () => {},
  isLoadMoreLoading = false,
}) => {
  const queryClient = useQueryClient();
  const [loadingRequests, setLoadingRequests] = useState({});

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return suggestions;

    return suggestions.filter((user) => {
      if (!user) return false;
      const searchLower = searchQuery.toLowerCase();
      return (
        (user.fullName?.toLowerCase() || "").includes(searchLower) ||
        (user.city?.toLowerCase() || "").includes(searchLower)
      );
    });
  }, [suggestions, searchQuery]);

  const { mutate: sendRequestMutation } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
        queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] }),
      ]);
    },
  });

  const handleSendRequest = useCallback(
    (userId) => {
      setLoadingRequests((prev) => ({ ...prev, [userId]: true }));

      sendRequestMutation(userId, {
        onSuccess: () => {
          setLoadingRequests((prev) => ({ ...prev, [userId]: false }));
          toast.success("Friend request sent successfully!");
        },
        onError: () => {
          setLoadingRequests((prev) => ({ ...prev, [userId]: false }));
          toast.error("Error sending friend request!");
        },
      });
    },
    [sendRequestMutation],
  );

  const isRequestSent = useCallback(
    (userId) => {
      return outgoingRequestsIds.has(userId);
    },
    [outgoingRequestsIds],
  );

  if (isLoading) {
    return <FriendSuggestionsSkeleton />;
  }

  if (filteredSuggestions.length === 0) {
    return (
      <div className="animate-fadeIn">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-base-content flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            People You May Know
          </h2>
          <p className="text-base-content/70">
            Discover new people who share similar interests with you
          </p>
        </div>
        <div className="text-center py-12 bg-base-100/50 rounded-2xl">
          <UsersIcon className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-base-content/70 mb-2">
            No suggestions found
          </h3>
          <p className="text-base-content/50">
            {searchQuery
              ? "No matches found for your search"
              : "Check back later for new suggestions"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-base-content flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          People You May Know
        </h2>
        <p className="text-base-content/70">
          Discover new people who share similar interests with you
        </p>
      </div>

      <LazyLoadImageGrid>
        {filteredSuggestions.map((user) => {
          const userId = user._id || user.id;
          const requestSent = isRequestSent(userId);
          const isLoadingReq = loadingRequests[userId];

          return (
            <div
              key={userId}
              className="bg-base-100/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
            >
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={getProfileImageSrc(user.profilePic)}
                  alt={user.fullName || "User"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Prevent infinite loops if default avatar is missing
                    if (e.target.src !== "/default-avatar.png") {
                      e.target.src = "/default-avatar.png";
                    }
                  }}
                />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-base-content">
                      {user.fullName || "Unknown User"}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-base-content/60 mt-1">
                      <MapPin className="w-3 h-3" />
                      {user.city || "No location"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {requestSent ? (
                    <button
                      className="flex-1 btn btn-outline border-green-200 text-green-600 hover:bg-green-50"
                      disabled
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Request Sent
                    </button>
                  ) : (
                    <button
                      className="flex-1 btn bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
                      onClick={() => handleSendRequest(userId)}
                      disabled={isLoadingReq}
                    >
                      {isLoadingReq ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Friend
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </LazyLoadImageGrid>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoadMoreLoading}
            className="btn btn-outline border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 min-w-[200px] transition-all duration-300 group"
          >
            {isLoadMoreLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                Load More Suggestions
              </>
            )}
          </button>
        </div>
      )}

      {!hasMore && suggestions.length > 0 && (
        <div className="text-center mt-8 py-4 border-t border-gray-100">
          <p className="text-base-content/40 text-sm">
            You've seen all suggestions for now
          </p>
        </div>
      )}
    </div>
  );
};

const FriendSuggestionsSkeleton = () => (
  <div className="animate-fadeIn">
    <div className="mb-6">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-base-100/90 rounded-2xl border border-gray-200 overflow-hidden"
        >
          <div className="h-48 bg-gray-200 animate-pulse" />
          <div className="p-5">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LazyLoadImageGrid = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {isVisible ? children : <FriendSuggestionsSkeleton />}
    </div>
  );
};

export default FriendSuggestions;
