import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallingState,
  useCallStateHooks,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const AudioCallPage = () => {
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

    // Restore existing session
    if (
      window.__audioClient &&
      window.__audioCall &&
      window.__audioCall.id === callId
    ) {
      setIsReady(true);
      setIsConnecting(false);
      return;
    }

    const initCall = async () => {
      try {
        if (!window.__audioClient) {
          window.__audioClient = StreamVideoClient.getOrCreateInstance({
            apiKey: STREAM_API_KEY,
            user: {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            token: tokenData.token,
          });
        }

        if (!window.__audioCall || window.__audioCall.id !== callId) {
          window.__audioCall = window.__audioClient.call("default", callId);
        }

        const state = window.__audioCall.state.callingState;

        if (state !== CallingState.JOINED && state !== CallingState.JOINING) {
          await window.__audioCall.join({ create: true });
          await window.__audioCall.camera.disable();
          await window.__audioCall.microphone.enable();
        }

        setIsReady(true);
      } catch (error) {
        console.error("❌ Audio call error:", error);
        toast.error("Could not join the audio call.");
        initRef.current = false;
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    return () => {
      window.__audioCall?.leave().catch(console.error);
      window.__audioCall = null;
      window.__audioClient = null;
      initRef.current = false;
    };
  }, [tokenData?.token, authUser?._id, callId]);

  if (isLoading || isConnecting) return <PageLoader />;

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Could not initialize audio call. Please refresh or try again.</p>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <StreamVideo client={window.__audioClient}>
        <StreamCall call={window.__audioCall}>
          <AudioCallContent />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};
const AudioCallContent = () => {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      window.__audioCall = null;
      window.__audioClient = null;
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      {/* ✅ Hidden but MUST be rendered for audio to work */}
      <div style={{ display: "none" }}>
        <SpeakerLayout />
      </div>

      {/* ✅ Our fully custom UI */}
      <div className="flex flex-col items-center justify-between h-screen bg-base-100 py-12 px-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-base-content">
            🎙️ Audio Call
          </h2>
          <p className="text-sm text-base-content/50 mt-1">
            {participants.length} participant
            {participants.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Participants */}
        <div className="flex flex-wrap gap-10 justify-center items-center flex-1 py-8">
          {participants.map((participant) => (
            <div
              key={participant.sessionId}
              className="flex flex-col items-center gap-3"
            >
              {/* Avatar with speaking ring */}
              <div
                className={`rounded-full p-1 transition-all duration-300 ${
                  participant.isSpeaking
                    ? "ring-4 ring-primary ring-offset-2 ring-offset-base-100"
                    : "ring-4 ring-base-300"
                }`}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-base-300">
                  <img
                    src={participant.image || "/avatar.png"}
                    alt={participant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/avatar.png";
                    }}
                  />
                </div>
              </div>

              {/* Name */}
              <p className="text-base font-semibold text-base-content">
                {participant.name || "Unknown"}
              </p>

              {/* Speaking status */}
              <p className="text-xs text-base-content/40">
                {participant.isSpeaking ? "🟢 Speaking..." : "Silent"}
              </p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};
export default AudioCallPage;
