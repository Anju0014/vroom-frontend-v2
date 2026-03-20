
import { API_ROUTES } from "@/code/constants/apiRoutes";
// import { plainAxios } from "@/code/plainAxios";
// import { axiosCustomer } from "@/code/axiosCustomer";
import api from "@/code/axiosInstance";

// const commonApi = axiosCustomer;
import { Complaint, CreateComplaintDTO } from "@/types/complaintTypes";

export const complaintService = {
  createComplaint: async (data: CreateComplaintDTO): Promise<void> => {
    await api.post("/complaints", data);
  },

  getMyComplaints: async (page = 1, limit = 5) => {
    const res = await api.get("/complaints",{ params: { page, limit },});
    return res.data;
  },
};
