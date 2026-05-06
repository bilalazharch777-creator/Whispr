import { useEffect, useState } from "react";
import { Chat } from "stream-chat-react";
import toast from "react-hot-toast";
import { useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import ChatList from "../components/ChatComponents/ChatList";
import ChatBox from "../components/ChatComponents/ChatBox";
import ChatLoader from "../components/ChatLoader";
import Layout from "../components/Layout"; // Import your Layout component
import { MessageCircle } from "lucide-react";

const ChatPage = ({ chatClientRef }) => {
  const { authUser } = useAuthUser();
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const targetUserId = location.state?.targetUserId ?? null;

  const chatClient = chatClientRef.current;

  // Handle window resizing to detect mobile/desktop
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!chatClient || !authUser) return;

    const setupChannel = async () => {
      try {
        if (targetUserId && targetUserId !== authUser._id) {
          const channel = chatClient.channel("messaging", {
            members: [authUser._id, targetUserId],
          });
          await channel.create();
          setActiveChannel(channel);
        }
      } catch (error) {
        console.error(error);
        toast.error("Could not open conversation");
      } finally {
        setLoading(false);
      }
    };

    setupChannel();
  }, [chatClient, authUser, targetUserId]);

  const handleSelectChannel = (channel) => {
    setActiveChannel(channel);
  };

  if (loading || !chatClient?.userID) return <ChatLoader />;

  // Logic: Hide layout if we are on mobile AND a channel is open
  const shouldHideLayout = isMobile && activeChannel;

  const content = (
    <div className={`h-dvh ${activeChannel ? "is-chatting" : ""}`}>
      <Chat client={chatClient}>
        <div className="flex h-full">
          {/* LEFT - Chat List */}
          <div
            className={`${activeChannel ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-base-300`}
          >
            <ChatList
              setActiveChannel={handleSelectChannel}
              userId={chatClient.userID}
              chatClient={chatClient}
            />
          </div>

          {/* RIGHT - Chat Box */}
          <div
            className={`${activeChannel ? "flex" : "hidden md:flex"} w-full md:flex-1 bg-gray-50`}
          >
            {activeChannel ? (
              <ChatBox
                className="flex-1 h-full overflow-hidden"
                activeChannel={activeChannel}
                // Pass a close handler to go back to list on mobile
                onBack={() => setActiveChannel(null)}
              />
            ) : (
              <div className="flex flex-1 bg-base-100 flex-col items-center justify-center gap-4 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle
                    size={32}
                    className="text-primary opacity-60"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-base-content">
                    Your Messages
                  </h2>
                  <p className="text-sm text-base-content/50 mt-1">
                    Select a conversation from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Chat>
    </div>
  );

  // Conditional Wrapper
  return shouldHideLayout ? content : <Layout>{content}</Layout>;
};

export default ChatPage;
