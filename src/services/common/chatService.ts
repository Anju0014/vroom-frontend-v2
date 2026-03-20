// chatService.ts
// import axiosInstance from "@/config/axiosInstance";
// import axiosInstanceOwner from "@/config/axiosInstanceOwner";
// const carOwnerApi = axiosInstanceOwner();
// const customerApi=axiosInstance()

import api from "@/code/axiosInstance";
// const api=instance();

export const fetchOwnerChats = async () => {
  const res = await api.get("/chats/ownerchats"); 
  return res.data;
};

export const fetchCustomerChats = async () => {
  const res = await api.get("/chats/customerchats"); 
  return res.data;
};
export const fetchChatHistory = async (roomId: string, role:string) => {
// const api = role === "carOwner" ? carOwnerApi : customerApi;
  const res = await api.get(`/chats/room/${roomId}`);
  return res.data;
};
