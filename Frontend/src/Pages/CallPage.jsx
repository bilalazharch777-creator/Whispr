import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const { authUser, isLoading } = useAuthUser();
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const initRef = useRef(false);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });
  useEffect(() => {
    if (!tokenData?.token || !authUser?._id || !callId) return;
    if (initRef.current) return;
    initRef.current = true;

    const initCall = async () => {
      try {
        if (!window.__videoClient) {
          window.__videoClient = StreamVideoClient.getOrCreateInstance({
            apiKey: STREAM_API_KEY,
            user: {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            token: tokenData.token,
          });
        }

        if (!window.__callInstance || window.__callInstance.id !== callId) {
          window.__callInstance = window.__videoClient.call("default", callId);
        }

        const state = window.__callInstance.state.callingState;
        console.log("📞 state before join:", state);

        if (state !== CallingState.JOINED && state !== CallingState.JOINING) {
          await window.__callInstance.join({ create: true });
        }

        console.log("✅ setting isReady true");
        setIsReady(true); // ✅ always set regardless of whether we joined or skipped
      } catch (error) {
        console.error("❌ Error:", error);
        toast.error("Could not join the call.");
        initRef.current = false;
      } finally {
        setIsConnecting(false); // ✅ always stop loading
      }
    };

    // ✅ If window instances already exist from previous render, just restore state
    if (
      window.__videoClient &&
      window.__callInstance &&
      window.__callInstance.id === callId
    ) {
      console.log("⚡ Restoring existing call session");
      setIsReady(true);
      setIsConnecting(false);
      return;
    }

    initCall();

    return () => {
      window.__callInstance?.leave().catch(console.error);
      window.__callInstance = null;
      window.__videoClient = null;
      initRef.current = false;
    };
  }, [tokenData?.token, authUser?._id, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Could not initialize call. Please refresh or try again.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <StreamVideo client={window.__videoClient}>
        <StreamCall call={window.__callInstance}>
          <CallContent />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      window.__callInstance = null;
      window.__videoClient = null;
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;