// PendingFriends.jsx
import {
  UserCheck,
  UserPlus,
  UserX,
  X,
  Loader2,
  MapPin,
  Clock,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { getProfileImageSrc } from "../../lib/imageHelper";

const PendingFriends = ({
  pendingRequests = [],
  isLoading = false,
  onCancelRequest,
  onAcceptRequest,
  onRejectRequest,
}) => {
  const [filter, setFilter] = useState("all"); // 'all', 'outgoing', 'incoming'
  const [processingIds, setProcessingIds] = useState(new Set());

  // Calculate counts
  const outgoingCount = pendingRequests.filter(
    (req) => req.type === "outgoing",
  ).length;
  const incomingCount = pendingRequests.filter(
    (req) => req.type === "incoming",
  ).length;

  // Filter requests based on selected filter
  const filteredRequests =
    filter === "all"
      ? pendingRequests
      : pendingRequests.filter((req) => req.type === filter);

  // Handle accept with toast
  const handleAccept = async (requestId, requestName) => {
    if (!onAcceptRequest) return;

    setProcessingIds((prev) => new Set(prev).add(requestId));

    try {
      await onAcceptRequest(requestId);
      toast.success(`Friend request from ${requestName} accepted!`);
    } catch (error) {
      toast.error(`Failed to accept request from ${requestName}`);
      console.error("Accept error:", error);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Handle reject with toast
  const handleReject = async (requestId, requestName) => {
    if (!onRejectRequest) return;

    setProcessingIds((prev) => new Set(prev).add(requestId));

    try {
      await onRejectRequest(requestId);
      toast.success(`Friend request from ${requestName} rejected`);
    } catch (error) {
      toast.error(`Failed to reject request from ${requestName}`);
      console.error("Reject error:", error);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Handle cancel with toast
  const handleCancel = async (requestId, requestName) => {
    if (!onCancelRequest) return;

    setProcessingIds((prev) => new Set(prev).add(requestId));

    try {
      await onCancelRequest(requestId);
      toast.success(`Friend request to ${requestName} cancelled`);
    } catch (error) {
      toast.error(`Failed to cancel request to ${requestName}`);
      console.error("Cancel error:", error);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-fadeIn">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            Pending Friend Requests
          </h2>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  // Empty state
  if (pendingRequests.length === 0) {
    return (
      <div className="animate-fadeIn text-center py-16 px-4">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-base-content mb-2">
          No Pending Requests
        </h3>
        <p className="text-base-content/70 max-w-md mx-auto">
          You don't have any pending friend requests. Check out the suggestions
          tab to find new friends!
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header with counts and filters */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            Pending Friend Requests
          </h2>
          <p className="text-base-content/70 mt-1">
            You have {pendingRequests.length} pending{" "}
            {pendingRequests.length === 1 ? "request" : "requests"}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-base-200/50 p-1 rounded-xl self-start">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            All ({pendingRequests.length})
          </button>
          <button
            onClick={() => setFilter("outgoing")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              filter === "outgoing"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <ArrowUp className="w-3 h-3" />
            Sent ({outgoingCount})
          </button>
          <button
            onClick={() => setFilter("incoming")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              filter === "incoming"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            Received ({incomingCount})
          </button>
        </div>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => {
            const requestId = request.requestId || request.id;
            const isProcessing = processingIds.has(requestId);

            return (
              <div
                key={requestId}
                className={`bg-base-100/90 backdrop-blur-sm rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                  request.type === "incoming"
                    ? "border-green-200 hover:border-green-300"
                    : "border-yellow-200 hover:border-yellow-300"
                } ${isProcessing ? "opacity-70" : ""}`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={getProfileImageSrc(
                          request.profilePic || request.avatar,
                        )}
                        alt={request.name}
                        className="w-16 h-16 rounded-full border-4 border-base-100 shadow-md object-cover"
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                      {/* Type indicator */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-base-100 flex items-center justify-center ${
                          request.type === "incoming"
                            ? "bg-green-400"
                            : "bg-yellow-400"
                        }`}
                      >
                        {request.type === "incoming" ? (
                          <ArrowDown className="w-3 h-3 text-white" />
                        ) : (
                          <ArrowUp className="w-3 h-3 text-white" />
                        )}
                      </div>

                      {/* Processing spinner overlay */}
                      {isProcessing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-base-content truncate">
                        {request.name}
                      </h3>

                      {request.location && (
                        <div className="text-sm text-base-content/60 mt-1 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{request.location}</span>
                        </div>
                      )}

                      {/* Date display */}
                      <div className="text-xs text-base-content/40 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {request.type === "incoming" ? "Received" : "Sent"}{" "}
                        {request.formattedDate ||
                          request.formattedSentDate ||
                          (request.sentAt ||
                          request.receivedAt ||
                          request.createdAt
                            ? new Date(
                                request.sentAt ||
                                  request.receivedAt ||
                                  request.createdAt,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Date unavailable")}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Different based on request type */}
                  <div className="flex gap-2 mt-6">
                    {request.type === "incoming" ? (
                      <>
                        <button
                          onClick={() => handleAccept(requestId, request.name)}
                          disabled={isProcessing}
                          className="flex-1 btn bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:border-green-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(requestId, request.name)}
                          disabled={isProcessing}
                          className="flex-1 btn bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserX className="w-4 h-4" />
                          )}
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleCancel(requestId, request.name)}
                        disabled={isProcessing}
                        className="flex-1 btn btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Empty state for filtered view
        <div className="text-center py-12 bg-base-100/50 rounded-2xl border border-gray-200">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
            {filter === "outgoing" ? (
              <ArrowUp className="w-8 h-8 text-base-content/40" />
            ) : (
              <ArrowDown className="w-8 h-8 text-base-content/40" />
            )}
          </div>
          <p className="text-base-content/50">
            No {filter === "outgoing" ? "sent" : "received"} requests to show
          </p>
          <button
            onClick={() => setFilter("all")}
            className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            View all requests
          </button>
        </div>
      )}
    </div>
  );
};

export default PendingFriends;
