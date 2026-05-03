import {
  Channel,
  Window,
  MessageList,
  MessageInput,
  ChannelHeader,
  Thread,
  useChannelStateContext,
} from "stream-chat-react";
import { EmojiPicker } from "stream-chat-react/emojis";
import VideoCallButton from "../VideoCallButton.jsx";
import AudioCallButton from "../AudioCallButton.jsx";
import ChatOptionsDropdown from "../ChatOptionsDropdown.jsx";
import { MessageCircle } from "lucide-react";
import ChatLoadingSkeleton from "./ChatLoadingSkeleton.jsx";

// Separate inner component so we can use context hooks inside <Channel>
const ChatBoxInner = ({ activeChannel }) => {
  const { thread } = useChannelStateContext();

  const handleVideoCall = () => {
    const callUrl = `${window.location.origin}/call/${activeChannel.id}`;
    activeChannel.sendMessage({
      text: `📹 Come Join me in a Video Call: ${callUrl}`,
    });
  };

  const handleAudioCall = () => {
    if (!activeChannel) return;
    const audioCallId = `audio_${activeChannel.id}`;
    const callUrl = `${window.location.origin}/audio-call/${audioCallId}`;
    activeChannel.sendMessage({
      text: `📞 I've started an Audio Call. Join here: ${callUrl}`,
    });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row w-full h-full overflow-hidden">
      <Window hideOnThread>
        <div className="flex flex-col h-full bg-base-100 overflow-hidden">
          <div className="flex items-center justify-between px-1 py-1 border-b border-base-300 bg-base-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <ChannelHeader />
            </div>
            <div className="flex items-center gap-2">
              <AudioCallButton onClick={handleAudioCall} />
              <VideoCallButton onClick={handleVideoCall} />
              <ChatOptionsDropdown />
            </div>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden relative">
            <MessageList />
            <MessageInput focus grow />
          </div>
        </div>
      </Window>

      {thread && (
        <div className="lg:w-[360px] lg:min-w-[280px] lg:border-l lg:border-base-300 w-full border-b border-base-300 lg:border-b-0 bg-base-100 overflow-hidden flex flex-col flex-shrink-0">
          <Thread />
        </div>
      )}
    </div>
  );
};

const ChatBox = ({ activeChannel, goBack }) => {
  return (
    <Channel
      channel={activeChannel}
      EmojiPicker={EmojiPicker}
      LoadingIndicator={ChatLoadingSkeleton}
    >
      <ChatBoxInner activeChannel={activeChannel} goBack={goBack} />
    </Channel>
  );
};

export default ChatBox;
