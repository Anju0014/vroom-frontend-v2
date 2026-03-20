
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchOwnerChats } from "@/services/common/chatService";
import { useAuthStoreOwner } from "@/store/carOwner/authStore";
import { ChatMessage } from "@/types/chatTypes";

export default function OwnerChatsPage() {
  const { user } = useAuthStoreOwner();
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchOwnerChats()
      .then(setChats)
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!user) return null;

  const chatsByRoom: Record<string, ChatMessage[]> = {};
  chats.forEach((msg) => {
    if (!chatsByRoom[msg.roomId]) chatsByRoom[msg.roomId] = [];
    chatsByRoom[msg.roomId].push(msg);
  });

  const getLastMessage = (messages: ChatMessage[]) =>
    [...messages].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    
  const formatTimestamp = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Active Chats</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
         <div className="flex items-center justify-center h-20">
      <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
             <p> Loading chats...</p>
            </div>
        
        ) : Object.keys(chatsByRoom).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="w-24 h-24 mb-4 text-blue-400/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-xl font-semibold text-blue-600 mb-2">
              No chats yet
            </p>
            <p className="text-sm text-blue-500">
              Your conversations will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.keys(chatsByRoom)
              .sort((a, b) => {
                const lastA = getLastMessage(chatsByRoom[a]);
                const lastB = getLastMessage(chatsByRoom[b]);
                return (
                  new Date(lastB.timestamp).getTime() -
                  new Date(lastA.timestamp).getTime()
                );
              })
              .map((roomId) => {
                const messages = chatsByRoom[roomId];
                const lastMessage = getLastMessage(messages);

                const customerId =
                  lastMessage.senderId === user.id
                    ? lastMessage.receiverId
                    : lastMessage.senderId;

                // const customerName =
                //   lastMessage.senderId === user.id
                //     ? lastMessage.receiverName
                //     : lastMessage.senderName;

                const customerName =
  lastMessage.senderId === user.id
    ? messages.find((m) => m.senderId !== user.id)?.senderName || "Unknown"
    : lastMessage.senderName;
                const isCustomer = lastMessage.senderRole === "customer";

                return (
                  <Link
                    key={roomId}
                    href={`/carOwner/dashboard/chats/${customerId}/${encodeURIComponent(
                      customerName
                    )}`}
                    className="block"
                    
                  >
                    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg hover:bg-blue-50/50 transition-all duration-200 border border-blue-100/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-blue-700">
                            {customerName}
                          </h3>
                          {/* <span className="text-xs text-blue-500 font-medium">
                            {isCustomer ? "customer" : "car owner"}
                          </span> */}
                        </div>
                        <span className="text-xs text-blue-400 font-medium">
                          {formatTimestamp(lastMessage.timestamp)}
                        </span>
                      </div>

                      <p className="text-sm text-blue-600/80 line-clamp-1">
                        <span className={`font-semibold ${
                          lastMessage.senderId === user.id 
                            ? "text-blue-600" 
                            : "text-blue-800"
                        }`}>
                          {lastMessage.senderName}:
                        </span>{" "}
                        {lastMessage.message}
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
