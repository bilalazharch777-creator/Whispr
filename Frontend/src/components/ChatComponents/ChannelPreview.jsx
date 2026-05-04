import { useState, useEffect } from "react";
import { useChatContext } from "stream-chat-react";

const ChannelPreview = ({
  channel,
  isSelected,
  setActiveChannel,
  currentUserId,
  searchQuery,
}) => {
  const { client } = useChatContext();
  const myId = currentUserId || client?.userID;

  const [unreadCount, setUnreadCount] = useState(
    () => channel.countUnread() ?? 0,
  );
  const [lastMessage, setLastMessage] = useState(() => {
    const messages = channel.state?.messages || [];
    const lastMsg = messages[messages.length - 1];
    return lastMsg ? lastMsg.text || "Attachment" : "No messages yet";
  });

  useEffect(() => {
    const handleNewMessage = (event) => {
      setUnreadCount(channel.countUnread());
      setLastMessage(event.message?.text || "Attachment");
    };
    const handleMarkRead = () => setUnreadCount(0);

    channel.on("message.new", handleNewMessage);
    channel.on("message.read", handleMarkRead);
    channel.on("notification.mark_read", handleMarkRead);

    return () => {
      channel.off("message.new", handleNewMessage);
      channel.off("message.read", handleMarkRead);
      channel.off("notification.mark_read", handleMarkRead);
    };
  }, [channel]);

  const displayUnreadCount = isSelected ? 0 : unreadCount;

  const members = Object.values(channel.state?.members || {});
  const otherMembers = members.filter((m) => {
    const memberId = m.user?.id || m.user_id || m.userId;
    return memberId !== myId;
  });

  const targetUser = otherMembers[0]?.user;
  const channelName =
    targetUser?.name || targetUser?.id || channel.data?.name || "Unknown Chat";
  const avatarUrl = targetUser?.image || null;

  if (
    searchQuery &&
    !channelName.toLowerCase().includes(searchQuery.toLowerCase())
  ) {
    return null;
  }

  const initial = channelName.charAt(0).toUpperCase();
  const hasUnread = displayUnreadCount > 0;

  const handleSelect = () => {
    setActiveChannel(channel);
    setUnreadCount(0);
  };

  return (
    <button
      onClick={handleSelect}
      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-base-200 transition-all text-left
        hover:bg-base-200
        ${isSelected ? "bg-primary/10 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"}
      `}
    >
      {/* AVATAR */}
      <div className="avatar placeholder flex-shrink-0">
        <div className="w-11 h-11 rounded-full bg-primary/15 text-primary font-semibold ring-1 ring-base-300 overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={channelName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerText = initial;
              }}
            />
          ) : (
            <span className="text-sm">{initial}</span>
          )}
        </div>
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`font-semibold truncate text-sm ${hasUnread ? "text-base-content" : "text-base-content/80"}`}
          >
            {channelName}
          </h3>

          {hasUnread && (
            <span
              className="flex-shrink-0 flex items-center justify-center rounded-full text-white font-bold leading-none"
              style={{
                backgroundColor: "#0a8dff",
                fontSize: "11px",
                minWidth: "20px",
                height: "20px",
                padding: "0 5px",
              }}
            >
              {displayUnreadCount > 9 ? "9+" : displayUnreadCount}
            </span>
          )}
        </div>

        <p
          className={`text-xs truncate ${hasUnread ? "text-base-content font-medium" : "text-base-content/50"}`}
        >
          {lastMessage}
        </p>
      </div>
    </button>
  );
};
export default ChannelPreview;
