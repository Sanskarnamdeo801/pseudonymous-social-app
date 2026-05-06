import api from "./api";
import type { NotificationItem } from "../types";

export const notificationService = {
  list: async () => {
    const { data } = await api.get<NotificationItem[]>("/notifications");
    return data;
  },
  markRead: async () => {
    await api.post("/notifications/mark-read");
  },
};

