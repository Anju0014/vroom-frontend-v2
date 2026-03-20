
"use client";
import { useEffect, useState } from "react";
import socket from "@/services/common/socketService";
import { fetchChatHistory } from "@/services/common/chatService";
// import VideoCall from "./common/VideoCall";
import { UserRole } from "@/types/authTypes";
import PeerVideoCall from "./common/VideoCall";
import LoadingButton from "./common/LoadingButton";

interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

interface ChatBoxProps {
  currentUserName: string;
  currentUserId: string;
  role: UserRole;
  otherUserName: string;
  otherUserId: string;
}

export default function ChatBox({
  currentUserName,
  currentUserId,
  role,
  otherUserName,
  otherUserId,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const roomId = [currentUserId, otherUserId].sort().join("_");

  useEffect(() => {
    setIsLoading(true);

    fetchChatHistory(roomId, role)
      .then(setMessages)
      .finally(() => setIsLoading(false));

    socket.emit("joinChatRoom", {
      senderId: currentUserId,
      receiverId: otherUserId,
    });

    const handleReceive = (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("receiveChatMessage", handleReceive);

    return () => {
      socket.emit("leaveChatRoom", {
        senderId: currentUserId,
        receiverId: otherUserId,
      });
      socket.off("receiveChatMessage", handleReceive);
    };
  }, [currentUserId, otherUserId, role, roomId]);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendChatMessage", {
      senderId: currentUserId,
      receiverId: otherUserId,
      message: text,
    });

    setText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-gradient-to-b from-blue-200 to-yellow-200 p-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
     
        <div className="bg-white/80 backdrop-blur-sm rounded-t-xl shadow-md border-b border-blue-300/30">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-blue-600/80 text-center mt-1">
              {decodeURIComponent(otherUserName)}
            </h1>

            <LoadingButton
              onClick={() => setShowVideoCall(true)}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="Start Video Call"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </LoadingButton>
          </div>
        </div>

    

  {showVideoCall && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative">
            <LoadingButton
              onClick={() => setShowVideoCall(true)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition z-10"
              aria-label="Close Video Call"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </LoadingButton>
            
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Video Call with {decodeURIComponent(otherUserName)}
            </h3>
            
            <PeerVideoCall
    roomId={roomId}
    onClose={() => setShowVideoCall(false)}
    myName={currentUserName}
    otherName={decodeURIComponent(otherUserName)}
  />
            {/* <VideoCall
              roomId={roomId}
              currentUserId={currentUserId}
              currentUserRole={role}
            /> */}
          </div>
        </div>
      )}
     
        <div className="bg-white/70 backdrop-blur-sm rounded-b-xl shadow-lg border border-blue-200/50 flex flex-col h-[70vh] max-h-[800px]">
    
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-blue-600 animate-pulse">
                  Loading messages...
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <svg
                  className="w-20 h-20 mb-4 text-blue-400/60"
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
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm mt-2">Start the conversation!</p>
              </div>
            ) : (
              messages.map((m) => {
                const isCurrentUser = m.senderId === currentUserId;
                return (
                  <div
                    key={m._id}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    } animate-fade-in`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-150 ${
                        isCurrentUser
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none"
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-semibold ${
                            isCurrentUser ? "text-blue-100" : "text-blue-600"
                          }`}
                        >
                          {isCurrentUser ? "You" : m.senderName}
                        </span>
                        <span
                          className={`text-xs ${
                            isCurrentUser
                              ? "text-blue-200/80"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(m.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed break-words">
                        {m.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-blue-200/50 bg-white/80 backdrop-blur-sm p-4 rounded-b-xl">
            <div className="flex gap-3 items-center">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-blue-300/50 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white/70 text-gray-800 placeholder:text-gray-400"
              />
              <LoadingButton
                onClick={sendMessage}
                disabled={!text.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105 active:scale-95 disabled:transform-none disabled:cursor-not-allowed shadow-md flex items-center justify-center min-w-[4rem]"
              >
                <svg
                  className="w-5 h-5 rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
