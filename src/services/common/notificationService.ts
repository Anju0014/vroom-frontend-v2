import { API_ROUTES } from "@/code/constants/apiRoutes";
// import { plainAxios } from "@/code/plainAxios";
import api from "@/code/axiosInstance";

// const commonApi = plainAxios;

export const NotificationService = {
  async getNotifications(userId: string,page:number, limit=10) {
    const { data } = await api.get(API_ROUTES.notification.getNotification, {
      params: { userId,page,limit }
    });
    return data.data; 
  },

  async getUnreadCount(userId: string) {
    const { data } = await api.get(API_ROUTES.notification.getUnreadCount, 
      { params: { userId }
    });
    return data.count; 
  },

  async markAllAsRead(userId: string) {
    console.log("markas",userId)
    await api.patch(API_ROUTES.notification.markAllAsRead,
      null,
      { params: { userId }
    });
    console.log("response")
  },

   async markAsRead(notifId: string) {
    console.log("markas",notifId)
    await api.patch(API_ROUTES.notification.markAsRead,
      null,
      { params: { notifId }
    });
    console.log("response")
  }

};
