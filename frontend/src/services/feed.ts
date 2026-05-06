import api from "./api";
import type { FeedResponse } from "../types";

export const feedService = {
  getFeed: async (mode: "chronological" | "trending") => {
    const { data } = await api.get<FeedResponse>(`/feed/${mode}`);
    return data;
  },
};

