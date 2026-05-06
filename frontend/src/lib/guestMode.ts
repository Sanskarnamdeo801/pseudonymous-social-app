import type { AccountSettingsProfile, AuthUser, NotificationItem } from "../types";

// Development/demo-only mode for static GitHub Pages previews.
// Restore real auth before shipping a backend-connected production build.
export const JWT_AUTH_DISABLED = true;

export const DEMO_USER: AuthUser = {
  id: "guest-user",
  handle: "guest",
  bio: "Exploring VeilSpeak in guest mode.",
  is_admin: false,
};

export const DEMO_PROFILE: AccountSettingsProfile = {
  id: DEMO_USER.id,
  handle: DEMO_USER.handle,
  bio: "Guest mode is active so you can test the VeilSpeak UI without JWT authentication.",
  created_at: "2026-05-06T00:00:00.000Z",
  is_searchable: true,
  post_count: 12,
  show_activity_status: true,
  blur_sensitive_content: true,
  email_notifications: false,
  filtered_keywords: ["spam", "doxx", "harassment"],
};

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "demo-notification-1",
    type: "signal",
    message: "Guest mode is active. Navigation is unlocked for GitHub Pages preview testing.",
    payload: {},
    is_read: false,
    created_at: "2026-05-06T09:15:00.000Z",
  },
  {
    id: "demo-notification-2",
    type: "update",
    message: "JWT auth is disabled in this frontend build, so protected UI can be reviewed freely.",
    payload: {},
    is_read: true,
    created_at: "2026-05-05T18:45:00.000Z",
  },
];
