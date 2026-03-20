import { UserRole } from "@/types/authTypes";
export interface ChatMessage {
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: string;
}


export interface ChatMessageBox {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface ChatBoxProps {
  currentUserName: string;
  currentUserId: string;
  role: UserRole;
  otherUserName: string;
  otherUserId: string;
}