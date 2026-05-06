import api from "./api";
import type { AdminDashboard, Report } from "../types";

export const adminService = {
  getDashboard: async () => {
    const { data } = await api.get<AdminDashboard>("/admin/dashboard");
    return data;
  },
  getReports: async () => {
    const { data } = await api.get<Report[]>("/admin/reports");
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
};

