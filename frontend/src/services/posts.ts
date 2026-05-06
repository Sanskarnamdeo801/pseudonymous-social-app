import api from "./api";
import type { Comment, LikeResponse, Post, PostDetail } from "../types";

export const postService = {
  getPost: async (postId: string) => {
    const { data } = await api.get<PostDetail>(`/posts/${postId}`);
    return data;
  },
  createPost: async (title: string, content: string) => {
    const { data } = await api.post<Post>("/posts", { title, content });
    return data;
  },
  toggleLike: async (postId: string) => {
    const { data } = await api.post<LikeResponse>(`/posts/${postId}/like`);
    return data;
  },
  createComment: async (postId: string, content: string, parentId?: string) => {
    const { data } = await api.post<Comment>(`/posts/${postId}/comments`, {
      content,
      parent_id: parentId ?? null,
    });
    return data;
  },
  deletePost: async (postId: string) => {
    await api.delete(`/posts/${postId}`);
  },
};

