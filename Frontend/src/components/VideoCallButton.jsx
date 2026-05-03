import { Video } from 'lucide-react';

const VideoCallButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="btn btn-ghost btn-circle hover:scale-105 transition-transform"
      title="Start video call"
    >
      <Video size={20} strokeWidth={1.5} className="text-gray-600" />
    </button>
  );
};

export default VideoCallButton;