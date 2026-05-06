export interface UserPublic {
  id: string;
  handle: string;
  bio: string;
  created_at: string;
}

export interface UserProfile extends UserPublic {
  is_searchable: boolean;
  post_count: number;
}

export interface AccountSettingsProfile extends UserProfile {
  show_activity_status: boolean;
  blur_sensitive_content: boolean;
  email_notifications: boolean;
  filtered_keywords: string[];
}

export interface AuthUser {
  id: string;
  handle: string;
  bio: string;
  is_admin: boolean;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: TokenPair;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  auto_flagged: boolean;
  like_count: number;
  comment_count: number;
  engagement_score: number;
  created_at: string;
  author: UserPublic;
  liked_by_viewer: boolean;
}

export interface Comment {
  id: string;
  content: string;
  depth: number;
  auto_flagged: boolean;
  created_at: string;
  author: UserPublic;
  replies: Comment[];
}

export interface PostDetail extends Post {
  comments: Comment[];
}

export interface LikeResponse {
  liked: boolean;
  like_count: number;
}

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface FeedResponse {
  items: Post[];
  mode: "chronological" | "trending";
}

export interface SearchResponse {
  query: string;
  posts: Post[];
  users: UserPublic[];
}

export interface Report {
  id: string;
  target_type: "post" | "comment" | "user";
  target_id: string;
  reason: string;
  details: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  resolution_note: string;
  created_at: string;
  resolved_at: string | null;
}

export interface AdminDashboard {
  users: number;
  posts: number;
  open_reports: number;
  banned_users: number;
}
