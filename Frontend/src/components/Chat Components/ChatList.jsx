import React, { useMemo, useState } from "react";
import { ChannelList } from "stream-chat-react";
import ChannelPreview from "./ChannelPreview";
import NewChatButton from "./NewChatButton";

const ChatListSkeleton = () => (
  <div className="flex flex-col gap-0">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 px-4 py-3 border-b border-base-200"
      >
        <div className="w-11 h-11 rounded-full bg-base-300 animate-pulse flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-3.5 bg-base-300 rounded-full animate-pulse w-2/5" />
          <div className="h-3 bg-base-300 rounded-full animate-pulse w-3/5 opacity-60" />
        </div>
      </div>
    ))}
  </div>
);

const ChatList = ({ setActiveChannel, userId, chatClient }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filters = useMemo(
    () => ({ type: "messaging", members: { $in: [userId] } }),
    [userId],
  );
  const sort = useMemo(() => ({ last_message_at: -1 }), []);
  const options = useMemo(() => ({ limit: 20, state: true, watch: true }), []);

  return (
    <div className="w-full h-[82%] md:h-full flex flex-col bg-base-100 border-r border-base-300 relative">
      {/* ^ Added 'relative' to the container above ^ */}

      {/* HEADER */}
      <div className="px-4 pt-5 pb-3 border-b border-base-300 bg-base-100">
        <h1 className="text-xl font-bold text-base-content mb-3">Messages</h1>
        <label className="input input-bordered input-sm flex items-center gap-2 w-full bg-base-200">
          {/* ... search svg ... */}
          <input
            type="text"
            placeholder="Search conversations..."
            className="grow bg-transparent outline-none text-sm text-base-content"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
      </div>

      {/* CHANNEL LIST */}
      <div className="flex-1 overflow-y-auto relative hide-scrollbar">
        <ChannelList
          filters={filters}
          sort={sort}
          options={options}
          onSelect={(channel) => setActiveChannel(channel)}
          LoadingIndicator={() => <ChatListSkeleton />}
          EmptyStateIndicator={() => <EmptyState searchQuery={searchQuery} />}
          Preview={(props) => (
            <ChannelPreview
              {...props}
              setActiveChannel={setActiveChannel}
              currentUserId={userId}
              searchQuery={searchQuery}
            />
          )}
          List={(props) => {
            const hasChannels = React.Children.count(props.children) > 0;
            if (props.loading) return <ChatListSkeleton />;

            return (
              <div className="h-full">
                {hasChannels ? (
                  props.children
                ) : (
                  <EmptyState searchQuery={searchQuery} />
                )}
              </div>
            );
          }}
        />

        {/* 2. REPLACED HARDCODED BUTTON WITH COMPONENT */}
        <div className="absolute bottom-6 right-6 z-50">
          <NewChatButton
            chatClient={chatClient}
            onChannelCreated={(channel) => setActiveChannel(channel)}
          />
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ searchQuery }) => (
  <div className="flex flex-col items-center justify-center h-full px-4 text-center gap-3">
    <div className="text-5xl">{searchQuery ? "🔍" : "💬"}</div>
    <h2 className="text-base font-semibold text-base-content">
      {searchQuery ? `No results for "${searchQuery}"` : "No conversations yet"}
    </h2>
    <p className="text-sm text-base-content/50">
      {searchQuery ? "Try a different name" : "Start a chat to begin messaging"}
    </p>
  </div>
);

export default ChatList;
