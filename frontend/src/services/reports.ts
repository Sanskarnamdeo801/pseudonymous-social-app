import api from "./api";
import type { Report } from "../types";

export const reportService = {
  create: async (payload: {
    target_type: "post" | "comment" | "user";
    target_id: string;
    reason: string;
    details: string;
  }) => {
    const { data } = await api.post<Report>("/reports", payload);
    return data;
  },
};

