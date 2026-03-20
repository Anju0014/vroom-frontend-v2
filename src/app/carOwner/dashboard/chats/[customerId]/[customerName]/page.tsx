"use client";

import ChatBox from "@/components/ChatBox";
import { useAuthStoreOwner } from "@/store/carOwner/authStore";
import { useParams } from "next/navigation";

export default function OwnerChatPage() {
  const { user } = useAuthStoreOwner();
  const params = useParams();

  if (!user) return null;

  const customerId = params.customerId as string;
  const customerName = params.customerName as string;

  // const roomId = [user.id, customerId].sort().join("_");

  return (
    <ChatBox
      // roomId={roomId}
      currentUserName={user.fullName}
      currentUserId={user.id}
      role="carOwner"
      otherUserName={decodeURIComponent(customerName)}
      otherUserId={customerId}
    />
  );
}



