import { MoreVertical, User, BellOff, Trash2 } from 'lucide-react';

const ChatOptionsDropdown = () => {
  return (
    <div className="dropdown dropdown-end">
      <button 
        tabIndex={0} 
        className="btn btn-ghost btn-circle hover:scale-105 transition-transform"
      >
        <MoreVertical size={20} strokeWidth={1.5} className="text-gray-600" />
      </button>
      
      {/* Dropdown Menu */}
      <ul 
        tabIndex={0} 
        className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-2 border border-gray-100"
      >
        <li>
          <a className="flex items-center gap-3 py-3">
            <User size={16} strokeWidth={1.5} /> View Info
          </a>
        </li>
        <li>
          <a className="flex items-center gap-3 py-3 text-warning">
            <BellOff size={16} strokeWidth={1.5} /> Mute Notifications
          </a>
        </li>
        <div className="divider my-0"></div>
        <li>
          <a className="flex items-center gap-3 py-3 text-error">
            <Trash2 size={16} strokeWidth={1.5} /> Delete Chat
          </a>
        </li>
      </ul>
    </div>
  );
};

export default ChatOptionsDropdown;