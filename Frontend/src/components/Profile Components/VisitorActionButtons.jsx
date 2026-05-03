import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendFriendRequest } from "../../lib/api";
import { useNavigate } from "react-router";
import {
  UserPlus,
  UserCheck,
  MessageCircle,
  Clock,
  Inbox, // Using Inbox to represent "Received"
} from "lucide-react";
import toast from "react-hot-toast";

const VisitorActionButtons = ({ id, friendshipStatus }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: sendRequest, isPending: isSending } = useMutation({
    mutationFn: () => sendFriendRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["user", id]);
      toast.success("Friend Request Sent!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send request");
    },
  });

  const getButtonConfig = () => {
    switch (friendshipStatus) {
      case "friends":
        return {
          text: "Friends",
          icon: <UserCheck size={18} />,
          className:
            "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default",
          action: null,
        };
      case "pending_sent":
        return {
          text: "Request Sent",
          icon: <Clock size={18} />,
          className:
            "bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-default",
          action: null,
        };
      case "pending_received":
        return {
          text: "Sent you a request",
          icon: <Inbox size={18} />,
          // Soft styling to indicate it's info, not a primary action
          className:
            "bg-blue-500/10 text-blue-400 border border-blue-500/20 cursor-default",
          action: null,
        };
      default:
        return {
          text: "Add Friend",
          icon: <UserPlus size={18} />,
          className:
            "bg-[#0a8dff] hover:bg-[#0a8dff]/90 text-white shadow-lg shadow-[#0a8dff]/20",
          action: () => sendRequest(),
        };
    }
  };

  const config = getButtonConfig();

  return (
    <div className="flex gap-2 pt-6">
      <button
        onClick={config.action}
        disabled={isSending || !config.action}
        className={`flex-[1.5] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${config.className} ${
          isSending ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isSending ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <>
            {config.icon}
            <span className="whitespace-nowrap">{config.text}</span>
          </>
        )}
      </button>

      <button
        className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-base-content font-medium transition-all duration-300 border border-white/5"
        onClick={() => navigate("/chat", { state: { targetUserId: id } })}
      >
        <MessageCircle size={18} />
        Message
      </button>
    </div>
  );
};

export default VisitorActionButtons;
