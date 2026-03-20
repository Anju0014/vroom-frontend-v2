
"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Notification } from "@/types/notificationTypes";
import { io } from "socket.io-client";
import { NotificationService } from "@/services/common/notificationService";
import {
  notificationIconMap,
  severityStyles,
} from "@/code/constants/notificationIcons";
import LoadingButton from "./LoadingButton";
import Pagination from "../pagination";

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 5;

  useEffect(() => {
    if (!userId) return;

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      query: { userId },
      withCredentials: true,
    });

    socket.on("newNotification", (notification: Notification) => {
      setUnread((prev) => prev + 1);

      // Only prepend if user is on first page
      if (page === 1) {
        setNotifications((prev) => [notification, ...prev]);
      }
    });

    const fetchNotifications = async () => {
      try {
        const response = await NotificationService.getNotifications(
          userId,
          page,
          itemsPerPage
        );

        const unreadCount =
          await NotificationService.getUnreadCount(userId);
          setNotifications(response?.data|| []);
          setPage(response?.page || 1);
          setTotalPages(response?.totalPages || 1);
          setUnread(unreadCount);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    fetchNotifications();

    return () => {
      socket.disconnect();
    };
  }, [userId, page]);

  const toggleBell = () => {
    setOpen((prev) => !prev);
  };

  const markAllRead = async () => {
    if (unread === 0) return;

    await NotificationService.markAllAsRead(userId);

    setUnread(0);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  };

  const handleMarkAsRead = async (notifId: string) => {
  try {
    await NotificationService.markAsRead(notifId);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId ? { ...n, isRead: true } : n
      )
    );
    setUnread((prev) => Math.max(prev - 1, 0));
  } catch (err) {
    console.error("Failed to mark as read", err);
  }
};

  return (
    <div className="relative">
      <LoadingButton onClick={toggleBell} className="relative p-2">
        <Bell className="w-6 h-6" />

        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </LoadingButton>

      {open && (
        <div className="absolute right-0 mt-2 w-120 bg-white rounded-lg shadow-xl border z-50">
          

          <div className="p-4 border-b flex items-center justify-between">
            <span className="font-bold">Notifications</span>

            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>


          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notif) => {
              const Icon =
                notificationIconMap[notif.iconKey] ?? Bell;

              const severityClass =
                severityStyles[notif.severity] ??
                "text-gray-600 bg-gray-100";

              const isUnread = !notif.isRead;

              return (
                <div
                  key={notif.id}
                  className={`flex gap-3 p-3 border-b transition ${
                    isUnread ? "bg-blue-50" : "opacity-60"
                  }`}
                >
                  <div
                    className={`relative h-8 w-8 rounded-full flex items-center justify-center ${severityClass}`}
                  >
                    <Icon className="w-4 h-4" />

                    {isUnread && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium">{notif.title}</h4>
                    <p className="text-sm text-gray-600">
                      {notif.message}
                    </p>
                   {!notif.isRead&&
                     <button onClick={() => handleMarkAsRead(notif.id)} 
                     className="text-xs text-blue-600 hover:underline">Mark as read </button>}
                  </div>
                  
                </div>
              );
            })}

            {notifications.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="p-2 border-t">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}