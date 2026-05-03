import React from "react";
import { Link, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequest } from "../lib/api";
import { Home, Users, Search, MessageCircle, UserCircle } from "lucide-react";

const BottomBar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 1. Get Message Notifications from Redux
  const messageNotifications = useSelector(
    (state) => state.stream.messageNotifications || [],
  );
  const chatCount = messageNotifications.length;

  // 2. Get Friend Requests from TanStack Query
  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequest,
  });

  // 3. Calculate Pending Incoming Friend Requests
  const friendCount = (friendRequests?.incommingReqs || []).length;

  const navItems = [
    { id: "/", icon: Home, iconSize: 24 },
    { id: "/friends", icon: Users, iconSize: 24, badge: friendCount },
    { id: "/search", icon: Search, iconSize: 24 },
    { id: "/chat", icon: MessageCircle, iconSize: 24, badge: chatCount },
    { id: "/profile", icon: UserCircle, iconSize: 24 },
  ];

  // Helper to determine if a route is active
  const checkActive = (itemId) => {
    if (itemId === "/") return currentPath === "/";
    return currentPath === itemId || currentPath.startsWith(`${itemId}/`);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind sticky bar */}
      <div className="h-16 md:hidden" />

      {/* Bottom Navigation Bar - Only shown on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Background Line - Full width */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-base-100" />

        {/* Navigation Container */}
        <div className="relative">
          {/* Floating Bar */}
          <div className="relative bg-base-100/95 backdrop-blur-xl rounded-t-2xl shadow-2xl border-t border-x border-base-300/50">
            {/* Navigation Items */}
            <div className="flex items-center justify-between px-1 py-4">
              {navItems.map((item) => {
                const isActive = checkActive(item.id);
                const Icon = item.icon;

                // Logic to show badge if count exists and user isn't on that specific page
                const showBadge = item.badge > 0;

                return (
                  <Link
                    key={item.id}
                    to={item.id}
                    className="relative flex flex-col items-center group flex-1 px-1"
                  >
                    {/* Icon Container */}
                    <div
                      className={`
                      relative flex items-center justify-center 
                      w-12 h-12 rounded-xl
                      transition-all duration-300 ease-out
                      group-hover:scale-110 group-active:scale-95
                      ${
                        isActive
                          ? "bg-[#0a8dff]/10 scale-105"
                          : "group-hover:bg-base-200"
                      }
                    `}
                    >
                      <Icon
                        className={`
                          transition-all duration-300 ease-out
                          ${
                            isActive
                              ? "text-[#0a8dff] scale-125"
                              : "text-base-content/60 group-hover:text-base-content"
                          }
                        `}
                        size={item.iconSize}
                        strokeWidth={isActive ? 2.5 : 2}
                      />

                      {/* Generic Notification Badge */}
                      {showBadge && (
                        <div className="absolute -top-1 -right-1">
                          <div className="relative">
                            <div
                              className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                                isActive ? "bg-[#0a8dff]" : "bg-red-500"
                              }`}
                            />
                            <div
                              className={`
                                relative w-5 h-5 rounded-full flex items-center justify-center border border-base-100
                                ${
                                  isActive
                                    ? "bg-gradient-to-br from-[#0a8dff] to-[#0066cc]"
                                    : "bg-gradient-to-br from-red-500 to-red-400"
                                }
                              `}
                            >
                              <span className="text-[10px] font-bold text-white">
                                {item.badge}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Indicator Line */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#0a8dff] rounded-full shadow-[0_0_8px_#0a8dff]" />
                    )}

                    {/* Hover Effect Glow */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#0a8dff]/5 to-transparent rounded-xl blur-sm" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Safety Area for Mobile Devices (iOS Home Bar) */}
        <div className="h-4 bg-base-100/90 backdrop-blur-xl" />
      </div>
    </>
  );
};

export default BottomBar;
