import api from "./api";
import type { AccountSettingsProfile, SearchResponse, UserProfile } from "../types";

export const userService = {
  getProfile: async (handle: string) => {
    const { data } = await api.get<UserProfile>(`/users/${handle}`);
    return data;
  },
  search: async (query: string) => {
    const { data } = await api.get<SearchResponse>("/search", { params: { query } });
    return data;
  },
  getAccountSettings: async () => {
    const { data } = await api.get<AccountSettingsProfile>("/settings/account");
    return data;
  },
  updateAccount: async (payload: { handle?: string; bio?: string }) => {
    const { data } = await api.put<AccountSettingsProfile>("/settings/account", payload);
    return data;
  },
  updatePrivacy: async (payload: {
    is_searchable: boolean;
    show_activity_status: boolean;
    email_notifications: boolean;
  }) => {
    const { data } = await api.put<AccountSettingsProfile>("/settings/privacy", payload);
    return data;
  },
  updateSafety: async (payload: { blur_sensitive_content: boolean; filtered_keywords: string[] }) => {
    const { data } = await api.put<AccountSettingsProfile>("/settings/safety", payload);
    return data;
  },
};
