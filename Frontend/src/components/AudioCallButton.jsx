import React from 'react';
import { Phone } from 'lucide-react';

const AudioCallButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="btn btn-ghost btn-circle hover:scale-105 transition-transform"
      title="Start audio call"
    >
      <Phone size={20} strokeWidth={1.5} className="text-gray-600" />
    </button>
  );
};

export default AudioCallButton;