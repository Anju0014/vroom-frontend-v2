"use client";

import ChatBox from "@/components/ChatBox";
import { useAuthStore } from "@/store/customer/authStore";
import { useParams } from "next/navigation";

export default function CustomerChatPage() {
  const { user } = useAuthStore();
  const params = useParams();

  if (!user) return null;

  const ownerId = params.ownerId as string;
  const ownerName = params.ownerName as string;

  return (
    
    <ChatBox
    
      currentUserName={user.fullName}
      currentUserId={user.id}
      role="customer"
      otherUserName={decodeURIComponent(ownerName)}
      otherUserId={ownerId}
    />
  );
}
