# API Documentation

Base URL: `/api/v1`

FastAPI also exposes live OpenAPI docs at `/docs` and `/openapi.json`.

## Authentication

### `POST /auth/signup`

Request:

```json
{
  "email": "alias@example.com",
  "handle": "night_signal",
  "password": "strong-password-123"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "handle": "night_signal",
    "bio": "",
    "is_admin": false
  },
  "tokens": {
    "access_token": "jwt",
    "refresh_token": "jwt",
    "token_type": "bearer"
  }
}
```

### `POST /auth/login`

Request:

```json
{
  "handle": "night_signal",
  "password": "strong-password-123"
}
```

Response: same shape as signup.

### `POST /auth/refresh`

Request:

```json
{
  "refresh_token": "jwt"
}
```

Response: same shape as signup with a rotated refresh token.

### `POST /auth/logout`

Request:

```json
{
  "refresh_token": "jwt"
}
```

Response:

```json
{
  "message": "Logged out"
}
```

### `GET /auth/me`

Response:

```json
{
  "id": "uuid",
  "handle": "night_signal",
  "bio": "privacy-maximalist",
  "is_admin": false
}
```

## Feed

### `GET /feed/chronological`

Returns the latest 50 visible posts ordered by `created_at DESC`.

### `GET /feed/trending`

Returns the latest 50 visible posts ordered by `engagement_score DESC`.

Feed response:

```json
{
  "mode": "chronological",
  "items": [
    {
      "id": "uuid",
      "title": "Signal boost",
      "content": "Post body",
      "auto_flagged": false,
      "like_count": 12,
      "comment_count": 3,
      "engagement_score": 19.5,
      "created_at": "2026-05-04T10:00:00Z",
      "liked_by_viewer": true,
      "author": {
        "id": "uuid",
        "handle": "night_signal",
        "bio": "",
        "created_at": "2026-05-01T10:00:00Z"
      }
    }
  ]
}
```

## Posts

### `POST /posts`

Request:

```json
{
  "title": "What privacy features matter most?",
  "content": "I care about transport encryption, revocation, and better moderation tooling."
}
```

### `GET /posts/{post_id}`

Returns the post plus nested comment threads.

### `DELETE /posts/{post_id}`

Soft-deletes a post. Allowed for the author or an admin.

### `POST /posts/{post_id}/like`

Toggles the viewer upvote.

Response:

```json
{
  "liked": true,
  "like_count": 15
}
```

### `POST /posts/{post_id}/comments`

Request:

```json
{
  "content": "Nested comment text",
  "parent_id": null
}
```

## Users

### `GET /users/{handle}`

Returns public profile data and the current `post_count`.

## Search

### `GET /search?query=privacy`

Response:

```json
{
  "query": "privacy",
  "posts": [],
  "users": []
}
```

## Notifications

### `GET /notifications`

Returns the user notification inbox ordered by most recent first.

### `POST /notifications/mark-read`

Response:

```json
{
  "message": "Notifications marked as read"
}
```

## Reports

### `POST /reports`

Request:

```json
{
  "target_type": "post",
  "target_id": "uuid",
  "reason": "Harassment or abuse",
  "details": "Contains targeted abuse."
}
```

### `GET /reports/mine`

Returns the current user’s submitted reports.

## Settings

### `GET /settings/account`

Returns the current user profile plus settings fields.

### `PUT /settings/account`

Request:

```json
{
  "handle": "new_handle",
  "bio": "updated bio"
}
```

### `PUT /settings/privacy`

Request:

```json
{
  "is_searchable": true,
  "show_activity_status": false,
  "email_notifications": true
}
```

### `PUT /settings/safety`

Request:

```json
{
  "blur_sensitive_content": true,
  "filtered_keywords": ["doxx", "harassment"]
}
```

## Admin

All admin endpoints require an access token from a user with `is_admin = true`.

### `GET /admin/dashboard`

Response:

```json
{
  "users": 1200,
  "posts": 12400,
  "open_reports": 24,
  "banned_users": 6
}
```

### `GET /admin/reports`

Returns the full moderation queue.

### `PATCH /admin/reports/{report_id}`

Request:

```json
{
  "status": "resolved",
  "resolution_note": "Confirmed violation and action taken."
}
```

### `POST /admin/users/{user_id}/ban`

Response:

```json
{
  "message": "User @example banned"
}
```

### `POST /admin/users/{user_id}/unban`

Response:

```json
{
  "message": "User @example unbanned"
}
```

## Auth Middleware

- Supply `Authorization: Bearer <access_token>` on protected endpoints.
- Access tokens expire according to `ACCESS_TOKEN_EXPIRE_MINUTES`.
- Refresh tokens expire according to `REFRESH_TOKEN_EXPIRE_DAYS`.
- Refresh token rotation revokes the prior refresh token record.

## Validation and Errors

- `401`: invalid credentials or expired token
- `403`: banned account or missing admin permission
- `404`: resource not found
- `409`: handle collision
- `422`: request validation failure
- `429`: rate limit exceeded
- `500`: unhandled server error

