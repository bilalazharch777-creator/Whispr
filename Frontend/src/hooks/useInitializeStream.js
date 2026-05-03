import { useEffect, useRef, useState } from "react";
import { StreamChat } from "stream-chat";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import useAuthUser from "./useAuthUser";
import { getStreamToken } from "../lib/api";
import { addMessageNotification } from "../store/streamSlice";

const useInitializeStream = () => {
  const { authUser } = useAuthUser();
  const dispatch = useDispatch();
  const chatClientRef = useRef(null);
  const [clientReady, setClientReady] = useState(false);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser?._id) return;

    // ✅ If client already connected and ready, just attach listener
    if (chatClientRef.current?.userID) {
      return;
    }

    let isMounted = true;

    const initChat = async () => {
      try {
        const client = StreamChat.getInstance(
          import.meta.env.VITE_STREAM_API_KEY,
        );

        if (!client.userID) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            tokenData.token,
          );
        }

        // Watch all channels so message.new fires
        const filter = {
          type: "messaging",
          members: { $in: [authUser._id] },
        };
        const channels = await client.queryChannels(
          filter,
          { last_message_at: -1 },
          { watch: true, state: true, limit: 30 },
        );

        console.log("✅ Watching", channels.length, "channels");

        if (!isMounted) return;

        chatClientRef.current = client;
        setClientReady(true);

        const handleNewMessage = (event) => {
          const senderId = event.message?.user?.id;
          if (!senderId) return;
          if (senderId === authUser._id) {
            return;
          }

          const notif = {
            id: event.message.id,
            senderId,
            senderName: event.message.user.name,
            senderImage: event.message.user.image,
            text: event.message.text,
            channelId: event.channel_id,
            createdAt: event.created_at,
            read: false,
          };

          dispatch(addMessageNotification(notif));
        };

        client.on("message.new", handleNewMessage);

        // Store cleanup reference
        chatClientRef._cleanup = () => {
          client.off("message.new", handleNewMessage);
        };
      } catch (err) {
        return err;
      }
    };

    initChat();

    return () => {
      isMounted = false;
      chatClientRef._cleanup?.();
    };
  }, [
    tokenData?.token,
    authUser?._id,
    authUser?.fullName,
    authUser?.profilePic,
    dispatch,
  ]); // ✅ primitives only

  return { chatClientRef, clientReady };
};

export default useInitializeStream;
