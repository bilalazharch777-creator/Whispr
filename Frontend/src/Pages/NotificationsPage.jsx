import { useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux"; // 👈 add this
import { markAllRead } from "../store/streamSlice"; // 👈 add this
import { useEffect } from "react"; // 👈 add this
import { getFriendRequest } from "../lib/api";
import { getProfileImageSrc } from "../lib/imageHelper.js";
import {
  ClockIcon,
  UserCheck,
  BellDot,
  MessageSquare, // 👈 add this
} from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound.jsx";

const NotificationsPage = () => {
  const dispatch = useDispatch(); // 👈 add this

  // 👈 add this — read message notifications from Redux
  const messageNotifications = useSelector(
    (s) => s.stream.messageNotifications,
  );
  console.log("🔔 messageNotifications from Redux:", messageNotifications);

  // 👈 mark all as read when page opens
  useEffect(() => {
    dispatch(markAllRead());
  }, [dispatch]);

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequest,
  });

  const incomingRequests = (friendRequests?.incommingReqs || []).filter(
    (req) => req && req.sender,
  );
  const acceptedRequests = (friendRequests?.acceptedReqs || []).filter(
    (req) => req && req.recipient,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // 👈 updated isEmpty to also check message notifications
  const isEmpty =
    incomingRequests.length === 0 &&
    acceptedRequests.length === 0 &&
    messageNotifications.length === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto container max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            <span className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <BellDot className="w-6 h-6 text-white" />
              </div>
              Notifications
            </span>
          </h1>
        </div>

        {isEmpty ? (
          <NoNotificationsFound />
        ) : (
          <>
            {/* 👇 NEW — Message Notifications Section */}
            {messageNotifications.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#0a8dff]" />
                    <span>New Messages</span>
                  </div>
                  <span className="badge badge-md border-none text-white font-bold h-7 px-3 rounded-full bg-[#0a8dff]">
                    {messageNotifications.length}
                  </span>
                </h2>

                <div className="space-y-3">
                  {messageNotifications.map((notif) => (
                    <div key={notif.id} className="card bg-base-200 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex items-center gap-3">
                          <div className="avatar w-14 h-14 rounded-full bg-base-300 overflow-hidden">
                            <img
                              src={getProfileImageSrc(notif.senderImage)}
                              alt={notif.senderName}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.src = "/avatar.png";
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3>
                              <span className="font-bold">
                                {notif.senderName}{" "}
                              </span>
                              <span className="font-sans">
                                sent you a message.
                              </span>
                            </h3>
                            {/* Message preview */}
                            <p className="text-sm opacity-70 mt-1 truncate max-w-xs">
                              {notif.text || "Sent an attachment"}
                            </p>
                            <p className="text-xs opacity-50 mt-1 flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {new Date(notif.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Incoming Friend Requests — unchanged */}
            {incomingRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-[#0a8dff]" />
                    <span>Friend Requests</span>
                  </div>
                  <span className="badge badge-md border-none text-white font-bold h-7 px-3 rounded-full bg-[#0a8dff]">
                    {incomingRequests.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {incomingRequests.map((request) => (
                    <div
                      className="card bg-base-200 shadow-sm"
                      key={request._id}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-14 h-14 rounded-full bg-base-300 overflow-hidden">
                              <img
                                src={getProfileImageSrc(
                                  request.sender?.profilePic,
                                )}
                                alt={request.sender?.fullName || "User"}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.src = "/avatar.png";
                                }}
                              />
                            </div>
                            <div>
                              <h3>
                                <span className="font-bold">
                                  {request.sender?.fullName ||
                                    "Unknown User"}{" "}
                                </span>
                                <span className="font-sans">
                                  Sent you a Friend Request.
                                </span>
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Accepted Notifications — unchanged */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Recent Updates</h2>
                <div className="space-y-3">
                  {acceptedRequests.map((notification) => (
                    <div
                      key={notification._id}
                      className="card bg-base-200 shadow-sm"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar mt-1 w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={getProfileImageSrc(
                                notification.recipient?.profilePic,
                              )}
                              alt={notification.recipient?.fullName || "User"}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.src = "/avatar.png";
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {notification.recipient?.fullName || "User"}
                            </h3>
                            <p className="text-sm my-1 opacity-80">
                              Accepted your Friend Request
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1" /> Recently
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
