import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequest } from "../lib/api";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../store/themeSlice";
import {
  Home,
  Users,
  Search,
  MessageCircle,
  UserCircle,
  Bell,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import LogoutModal from "./LogoutModal";

const SideBar = ({ isExpanded, setIsExpanded }) => {
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Theme state
  const theme = useSelector((state) => state.theme.theme);
  const darkMode = theme === "dark";

  // Navigation state
  const location = useLocation();
  const currentPath = location.pathname;

  // 1. Get Message Notifications from Redux
  const messageNotifications = useSelector(
    (state) => state.stream.messageNotifications || [],
  );

  // 2. Get Friend Requests from TanStack Query
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequest,
  });

  // 3. Calculate Notification Counts
  const friendCount = (friendRequests?.incommingReqs || []).length;
  const chatCount = messageNotifications.length;
  const totalNotifications = friendCount + chatCount;

  const checkActive = (itemId) => {
    if (itemId === "/") return currentPath === "/";
    return currentPath === itemId || currentPath.startsWith(`${itemId}/`);
  };

  // 4. Dynamic Navigation Items with conditional badges
  const navItems = [
    { id: "/", icon: Home, label: "Home", iconSize: "1.5rem" },
    {
      id: "/friends",
      icon: Users,
      label: "Friends",
      iconSize: "1.5rem",
      // Added badge for friend requests
      badge: friendCount > 0 ? friendCount : null,
    },
    {
      id: "/notification",
      icon: Bell,
      label: "Notifications",
      iconSize: "1.5rem",
      badge: totalNotifications > 0 ? totalNotifications : null,
    },
    { id: "/search", icon: Search, label: "Search", iconSize: "1.5rem" },
    {
      id: "/chat",
      icon: MessageCircle,
      label: "Messages",
      iconSize: "1.5rem",
      badge: chatCount > 0 ? chatCount : null,
    },
    { id: "/profile", icon: UserCircle, label: "Profile", iconSize: "1.5rem" },
  ];

  const NavItem = ({ item, isActive }) => {
    const Icon = item.icon;

    return (
      <Link
        to={item.id}
        className={`
          relative flex items-center 
          w-full rounded-xl
          transition-all duration-300 ease-out
          group
          ${isExpanded ? "px-4 py-3 space-x-3" : "px-2 py-2 justify-center"}
          hover:bg-base-200/50
        `}
      >
        <div
          className={`
          relative flex items-center justify-center 
          rounded-xl
          transition-all duration-300 ease-out
          ${isExpanded ? "w-10 h-10" : "w-12 h-12"}
          group-hover:bg-base-200
        `}
        >
          <Icon
            className={`
              transition-all duration-300 ease-out
              ${
                isActive
                  ? "text-[#0a8dff]"
                  : "text-base-content/70 group-hover:text-base-content"
              }
            `}
            size={item.iconSize}
            strokeWidth={isActive ? 2.5 : 2}
          />

          {/* Badge logic: Only renders if item.badge is not null */}
          {item.badge && (
            <div className="absolute -top-[0.25rem] -right-[0.25rem]">
              <div className="relative">
                <div
                  className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                    isActive ? "bg-[#0a8dff]" : "bg-red-500"
                  }`}
                />
                <div
                  className={`
                  relative rounded-full flex items-center justify-center 
                  border border-base-100
                  ${isExpanded ? "w-4 h-4" : "w-5 h-5"}
                  ${
                    isActive
                      ? "bg-gradient-to-br from-[#0a8dff] to-[#0066cc]"
                      : "bg-gradient-to-br from-red-500 to-red-400"
                  }
                `}
                >
                  <span
                    className={`
                    font-bold text-white
                    ${isExpanded ? "text-[0.5rem]" : "text-[0.625rem]"}
                  `}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={`
          overflow-hidden transition-all duration-300 ease-out
          ${
            isExpanded
              ? "w-auto opacity-100 translate-x-0"
              : "w-0 opacity-0 translate-x-4"
          }
        `}
        >
          <span
            className={`
            font-medium transition-all duration-300
            ${
              isActive
                ? "text-[#0a8dff]"
                : "text-base-content/70 group-hover:text-base-content"
            }
          `}
          >
            {item.label}
          </span>
        </div>

        {isActive && (
          <div
            className={`
            absolute right-0 w-[0.25rem] h-6 bg-[#0a8dff] rounded-l-full
            transition-all duration-300 ease-out
            ${isExpanded ? "opacity-100" : "opacity-0"}
          `}
          />
        )}

        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a8dff]/5 to-transparent rounded-xl blur-[2px]" />
        </div>
      </Link>
    );
  };

  return (
    <>
      <div
        className={`
        fixed left-0 top-0 h-screen
        flex flex-col
        transition-all duration-500 ease-out
        bg-base-100/95 backdrop-blur-xl
        border-r border-base-300/50
        overflow-hidden
        hover:shadow-2xl
        z-50
        ${isExpanded ? "w-64" : "w-20"}
      `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-base-300/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {isExpanded && (
              <div className="transition-all duration-300 animate-fadeIn">
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#0a8dff] to-[#0066cc] bg-clip-text text-transparent">
                  WHISPRR
                </h2>
                <p className="text-sm text-base-content/60">v1.0.0</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Nav Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={checkActive(item.id)}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-base-300/50 space-y-2">
          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`
            relative flex items-center 
            w-full rounded-xl
            transition-all duration-300 ease-out
            group
            ${isExpanded ? "px-4 py-3 space-x-3" : "px-2 py-2 justify-center"}
            hover:bg-base-200/50
          `}
          >
            <div
              className={`
            flex items-center justify-center 
            rounded-xl
            transition-all duration-300 ease-out
            ${isExpanded ? "w-10 h-10" : "w-12 h-12"}
            group-hover:bg-base-200
          `}
            >
              {darkMode ? (
                <Sun
                  size="1.5rem"
                  className="text-base-content/70 group-hover:text-base-content"
                />
              ) : (
                <Moon
                  size="1.5rem"
                  className="text-base-content/70 group-hover:text-base-content"
                />
              )}
            </div>

            <div
              className={`
            overflow-hidden transition-all duration-300 ease-out
            ${
              isExpanded
                ? "w-auto opacity-100 translate-x-0"
                : "w-0 opacity-0 translate-x-4"
            }
          `}
            >
              <span className="font-medium text-base-content/70 group-hover:text-base-content">
                {darkMode ? "Light Mode" : "Dark Mode"}
              </span>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              setShowLogoutModal(true);
            }}
            className={`
            relative flex items-center 
            w-full rounded-xl
            transition-all duration-300 ease-out
            group
            ${isExpanded ? "px-4 py-3 space-x-3" : "px-2 py-2 justify-center"}
            hover:bg-error/10
          `}
          >
            <div
              className={`
            flex items-center justify-center 
            rounded-xl
            transition-all duration-300 ease-out
            ${isExpanded ? "w-10 h-10" : "w-12 h-12"}
            group-hover:bg-error/20
          `}
            >
              <LogOut size="1.5rem" className="text-error" />
            </div>

            <div
              className={`
            overflow-hidden transition-all duration-300 ease-out
            ${
              isExpanded
                ? "w-auto opacity-100 translate-x-0"
                : "w-0 opacity-0 translate-x-4"
            }
          `}
            >
              <span className="font-medium text-error group-hover:text-error/80">
                Logout
              </span>
            </div>
          </button>
        </div>
      </div>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default SideBar;
