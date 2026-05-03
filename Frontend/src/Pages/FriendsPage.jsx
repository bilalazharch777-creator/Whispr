// FriendsPage.jsx
import { useEffect, useState, useRef } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  X,
  Sparkles,
  Clock,
  Loader2,
} from "lucide-react";
import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import AllFriendsSection from "../components/friends components/AllFriends";
import FriendSuggestions from "../components/friends components/FriendSuggestions";
import PendingFriends from "../components/friends components/PendingFriends";
import {
  getRecommendedUsers,
  getUserFriends,
  getOutgoingFriendReqs,
  getFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
} from "../lib/api";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const loaderRef = useRef(null);

  // Fetch user's friends
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
  });

  const {
    data: recommendedUsersData,
    isLoading: loadingUsers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError: recommendedUsersError,
  } = useInfiniteQuery({
    queryKey: ["recommendedUsers"],
    queryFn: ({ pageParam = 1 }) => getRecommendedUsers(pageParam, 12),
    getNextPageParam: (lastPage) => {
      return lastPage?.pagination?.hasNextPage
        ? lastPage.pagination.nextPage
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Flatten all users from all pages
  const recommendedUsers =
    recommendedUsersData?.pages.flatMap((page) => page.users || []) || [];

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          activeTab === "suggestions"
        ) {
          fetchNextPage();
        }
      },
      { threshold: 0.5, rootMargin: "100px" },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, activeTab]);

  // Fetch OUTGOING friend requests (requests you sent)
  const { data: outgoingFriendReqs = [], isLoading: loadingOutgoing } =
    useQuery({
      queryKey: ["outgoingFriendReqs"],
      queryFn: getOutgoingFriendReqs,
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    });

  // Fetch INCOMING friend requests (requests you received)
  const { data: incomingFriendReqs, isLoading: loadingIncoming } = useQuery({
    queryKey: ["incomingFriendReqs"],
    queryFn: getFriendRequest,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Extract the incoming requests array from the response object
  const safeIncomingRequests = incomingFriendReqs?.incommingReqs || [];

  // Set outgoing requests IDs (to disable send button for users you already requested)
  useEffect(() => {
    const outgoingIds = new Set();
    if (
      outgoingFriendReqs &&
      Array.isArray(outgoingFriendReqs) &&
      outgoingFriendReqs.length > 0
    ) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(
          req.receiverId || req.recipient?._id || req.id || req.userId,
        );
      });
    }
    setOutgoingRequestsIds(outgoingIds);
  }, [outgoingFriendReqs]);

  // Handle cancel outgoing request or reject incoming request
  const handleCancelRequest = async (requestId) => {
    try {
      setActionLoading(true);

      const response = await cancelFriendRequest(requestId);

      // Invalidate queries to refresh the data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
        queryClient.invalidateQueries({ queryKey: ["incomingFriendReqs"] }),
        queryClient.invalidateQueries({ queryKey: ["friends"] }),
      ]);
    } catch (error) {
      console.error("Error canceling friend request:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle accept incoming request
  const handleAcceptRequest = async (requestId) => {
    try {
      setActionLoading(true);

      const response = await acceptFriendRequest(requestId);

      // Invalidate queries to refresh the data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["incomingFriendReqs"] }),
        queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
        queryClient.invalidateQueries({ queryKey: ["friends"] }),
      ]);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject incoming request
  const handleRejectRequest = async (requestId) => {
    try {
      setActionLoading(true);

      const response = await cancelFriendRequest(requestId);

      // Invalidate queries to refresh the data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["incomingFriendReqs"] }),
        queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
      ]);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    } finally {
      setActionLoading(false);
    }
  };

  // Format outgoing pending requests
  const pendingOutgoingRequests = Array.isArray(outgoingFriendReqs)
    ? outgoingFriendReqs
        .filter((req) => req && req.recipient)
        .map((req) => {
          const recipient = req.recipient || {};

          return {
            id: recipient._id,
            requestId: req._id,
            name: recipient.fullName || "Unknown User",
            location: recipient.location || "",
            profilePic: recipient.profilePic || "",
            sentAt: req.createdAt,
            type: "outgoing",
            formattedDate: req.createdAt
              ? new Date(req.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Date unavailable",
          };
        })
    : [];

  // Format incoming pending requests
  const pendingIncomingRequests = Array.isArray(safeIncomingRequests)
    ? safeIncomingRequests
        .filter((req) => req && req.sender)
        .map((req) => {
          const sender = req.sender || {};

          return {
            id: sender._id,
            requestId: req._id,
            name: sender.fullName || "Unknown User",
            location: sender.location || "",
            profilePic: sender.profilePic || "",
            receivedAt: req.createdAt,
            type: "incoming",
            formattedDate: req.createdAt
              ? new Date(req.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Date unavailable",
          };
        })
    : [];

  // Combine both types of requests
  const allPendingRequests = [
    ...pendingOutgoingRequests,
    ...pendingIncomingRequests,
  ];

  // Filter friends based on search query
  const filteredFriends = Array.isArray(friends)
    ? friends.filter(
        (friend) =>
          (friend.fullName || friend.name)
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (friend.location &&
            friend.location
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (friend.email &&
            friend.email.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : [];

  // Filter suggestions based on search query (only on already loaded data)
  const filteredSuggestions = recommendedUsers.filter(
    (user) =>
      user &&
      ((user.fullName || user.name)
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        (user.location &&
          user.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.bio &&
          user.bio.toLowerCase().includes(searchQuery.toLowerCase()))),
  );

  const getFriendCardStyle = (friend) => {
    if (friend.friendStatus === "close") {
      return "border-2 border-yellow-400 bg-gradient-to-br from-base-100 to-yellow-50";
    }
    if (friend.isOnline) {
      return "border border-blue-200 bg-gradient-to-br from-base-100 to-blue-50";
    }
    return "border border-gray-200 bg-base-100";
  };

  // Loading state for initial load
  if (loadingFriends || (loadingUsers && !recommendedUsers.length)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-base-content/70">Loading friends...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (recommendedUsersError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-base-content mb-2">
            Failed to load recommendations
          </h3>
          <p className="text-base-content/70">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pt-6 sm:pt-0 px-4">
      {/* Header with Gradient */}
      <div className="mb-8 relative md:block hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-400/5 to-transparent rounded-2xl -z-10" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              <span className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Friends
              </span>
            </h1>
            <p className="text-base-content/70 mt-2">
              Connect with your friends and discover new people
            </p>
          </div>

          {/* Stats Badge */}
          <div className="stat flex w-44 bg-base-100/80 backdrop-blur-sm rounded-xl shadow-sm p-3 border border-blue-100">
            <div className="stat-title text-xl text-base-content/70">
              Total Friends
            </div>
            <div className="stat-value text-xl font-bold text-blue-600">
              {friends?.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="mb-6 relative">
        <div className="overflow-x-auto overflow-y-hidden pb-2 hide-scrollbar">
          <div className="flex gap-2 w-max md:mt-0 mt-6">
            {[
              {
                id: "all",
                label: "All Friends",
                icon: Users,
                count: friends?.length || 0,
              },
              {
                id: "suggestions",
                label: "Suggestions",
                icon: Sparkles,
                count: filteredSuggestions.length,
              },
              {
                id: "pending",
                label: "Pending Requests",
                icon: UserCheck,
                count: allPendingRequests.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                    : "bg-base-100/80 backdrop-blur-sm text-base-content/70 hover:bg-base-100 border border-gray-200 hover:border-blue-200 shadow-sm"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id
                        ? "bg-white/20"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar - Only shows on All Friends tab */}
      {activeTab === "all" && (
        <div className="mb-12">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10 pr-10 py-3 rounded-xl bg-base-100/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content/70"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8">
        {/* All Friends Section */}
        {activeTab === "all" && (
          <AllFriendsSection
            friends={filteredFriends}
            searchQuery={searchQuery}
            onFindFriendsClick={() => setActiveTab("suggestions")}
            getFriendCardStyle={getFriendCardStyle}
            isLoading={loadingFriends}
          />
        )}

        {/* Friend Suggestions Section with Infinite Scroll */}
        {activeTab === "suggestions" && (
          <>
            <FriendSuggestions
              suggestions={filteredSuggestions}
              searchQuery={searchQuery}
              outgoingRequestsIds={outgoingRequestsIds}
              isLoading={loadingUsers && !recommendedUsers.length}
              hasMore={hasNextPage}
              onLoadMore={fetchNextPage}
              isLoadMoreLoading={isFetchingNextPage}
            />

            {/* Optional: You can remove the loader ref if you're using button only */}
            {hasNextPage && !isFetchingNextPage && (
              <div ref={loaderRef} className="h-10" /> // Keep this if you want both button and infinite scroll
            )}
          </>
        )}
        {/* Pending Friends Section */}
        {activeTab === "pending" && (
          <PendingFriends
            pendingRequests={allPendingRequests}
            onCancelRequest={handleCancelRequest}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            isLoading={loadingOutgoing || loadingIncoming || actionLoading}
          />
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
