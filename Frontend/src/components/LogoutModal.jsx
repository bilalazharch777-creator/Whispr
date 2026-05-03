import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, X, Loader2, LogOut } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "../lib/api";

const LogoutModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: logoutMutation, isPending } = useMutation({
    mutationFn: logout,

    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null);

      onClose();

      navigate("/login", {
        replace: true,
      });
    },

    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });

  const handleLogout = () => {
    logoutMutation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            onClick={isPending ? undefined : onClose}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="
              fixed inset-0 z-[100]
              bg-black/50
              backdrop-blur-md
            "
          />

          {/* Center Container */}
          <div
            className="
              fixed inset-0 z-[101]
              flex items-center justify-center
              px-4
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: 30,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 24,
              }}
              className="
                relative
                w-full
                max-w-xl
                bg-base-100
                rounded-3xl
                shadow-2xl
                border border-base-300
                overflow-hidden
              "
            >
              {/* Close */}
              <button
                disabled={isPending}
                onClick={onClose}
                className="
                  absolute top-4 right-4
                  p-2 rounded-xl
                  hover:bg-base-200
                  transition
                  disabled:opacity-40
                "
              >
                <X size={18} />
              </button>

              <div className="p-6">
                {/* Icon */}
                <div
                  className="
                    mx-auto mb-5
                    w-20 h-20
                    rounded-3xl
                    bg-red-800/10
                    flex items-center justify-center
                  "
                >
                  <ShieldAlert size={34} className="text-red-600" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center mb-2">Logout?</h2>

                {/* Text */}
                <p className="text-center text-base-content/70 mb-8">
                  Are you sure you want to logout from your account?
                </p>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onClose}
                    disabled={isPending}
                    className="
                      btn btn-ghost
                      rounded-2xl
                    "
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleLogout}
                    disabled={isPending}
                    className="
                      btn
                      rounded-2xl
                      border-none
                      bg-[#0a8dff]
                      hover:bg-[#087ee5]
                      text-white
                    "
                  >
                    {isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        Logout
                        <LogOut size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Accent */}
              <div className="h-1 bg-[#0a8dff]" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;
