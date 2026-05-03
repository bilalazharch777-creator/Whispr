import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../store/themeSlice";
import { Link, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequest } from "../lib/api";

import { Bell, Moon, Sun, Menu, LogOut } from "lucide-react";

import LogoutModal from "./LogoutModal";

const Navbar = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);

  const darkMode = theme === "dark";

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuRef = useRef(null);

  const location = useLocation();
  const currentPath = location.pathname;
  const messageNotifications = useSelector(
    (state) => state.stream.messageNotifications || [],
  );

  const { data: friendRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequest,
  });

  const friendCount = (friendRequests?.incommingReqs || []).length;
  const chatCount = messageNotifications.length;
  const totalNotifications = friendCount + chatCount;

  const isNotificationActive = currentPath === "/notification";

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 h-20 bg-base-100/95 backdrop-blur-xl border-b border-base-300 shadow-sm md:hidden">
        <div className="px-3">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img
                  src="/logo.png"
                  alt="logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#0a8dff] to-[#0066cc]">
                WHISPRR
              </h1>
            </div>

            <div className="flex items-center gap-1 relative" ref={menuRef}>
              {/* Notifications */}
              <Link to="/notification" className="relative group">
                <div
                  className={`
                    w-10 h-10 rounded-xl
                    flex items-center justify-center
                    transition-all duration-300
                    group-hover:scale-110
                    ${
                      isNotificationActive
                        ? "bg-[#0a8dff]/10"
                        : "hover:bg-base-200"
                    }
                  `}
                >
                  <Bell
                    size={22}
                    className={
                      isNotificationActive
                        ? "text-[#0a8dff]"
                        : "text-base-content/60"
                    }
                  />

                  {totalNotifications > 0 && (
                    <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-[9px] text-white font-bold">
                        {totalNotifications}
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Menu */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="
                  w-10 h-10 rounded-xl
                  flex items-center justify-center
                  hover:bg-base-200
                  transition-all duration-300
                  hover:scale-110
                "
              >
                <Menu
                  size={22}
                  className={`
                    transition-transform duration-300
                    ${menuOpen ? "rotate-90" : "rotate-0"}
                  `}
                />
              </button>

              {/* Animated Dropdown */}
              <div
                className={`
                  absolute right-0 top-14 w-44
                  bg-base-100 border border-base-300
                  rounded-2xl shadow-xl p-2

                  transition-all duration-300 ease-out

                  ${
                    menuOpen
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }
                `}
              >
                {/* Theme */}
                <button
                  onClick={() => {
                    dispatch(toggleTheme());
                    setMenuOpen(false);
                  }}
                  className="
                    w-full flex items-center
                    justify-between
                    px-4 py-3 rounded-xl
                    hover:bg-base-200
                    transition-all duration-200
                  "
                >
                  <span>Dark Mode</span>

                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Logout */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="
                    w-full flex items-center
                    justify-between
                    px-4 py-3 rounded-xl
                    hover:bg-base-200
                    transition-all duration-200
                  "
                >
                  <span>Logout</span>

                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Navbar;
