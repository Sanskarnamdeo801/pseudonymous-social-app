import api from "./api";
import type { AdminDashboard, AdminReport, Report } from "../types";

export const adminService = {
  getDashboard: async () => {
    const { data } = await api.get<AdminDashboard>("/admin/dashboard");
    return data;
  },
  getReports: async () => {
    const { data } = await api.get<AdminReport[]>("/admin/reports");
    return data;
  },
  resolveReport: async (reportId: string, status: Report["status"], resolutionNote: string) => {
    const { data } = await api.patch<Report>(`/admin/reports/${reportId}`, {
      status,
      resolution_note: resolutionNote,
    });
    return data;
  },
  banUser: async (userId: string) => {
    await api.post(`/admin/users/${userId}/ban`);
  },
  unbanUser: async (userId: string) => {
    await api.post(`/admin/users/${userId}/unban`);
  },
  deletePost: async (postId: string) => {
    await api.delete(`/admin/posts/${postId}`);
  },
  deleteComment: async (commentId: string) => {
    await api.delete(`/admin/comments/${commentId}`);
  },
};
