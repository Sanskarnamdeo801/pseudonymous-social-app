import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminRoute, ProtectedRoute } from "../components/ProtectedRoute";
import { AppShell } from "../layouts/AppShell";
import { AuthLayout } from "../layouts/AuthLayout";
import { AccountSettingsPage } from "../pages/AccountSettingsPage";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";
import { AdminReportsPage } from "../pages/AdminReportsPage";
import { CreatePostPage } from "../pages/CreatePostPage";
import { FeedPage } from "../pages/FeedPage";
import { LoginPage } from "../pages/LoginPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { PostDetailPage } from "../pages/PostDetailPage";
import { PrivacyPolicyPage } from "../pages/PrivacyPolicyPage";
import { PrivacySettingsPage } from "../pages/PrivacySettingsPage";
import { SafetySettingsPage } from "../pages/SafetySettingsPage";
import { SearchPage } from "../pages/SearchPage";
import { SignupPage } from "../pages/SignupPage";
import { TermsOfServicePage } from "../pages/TermsOfServicePage";
import { UserProfilePage } from "../pages/UserProfilePage";

export const router = createBrowserRouter([
  { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
  { path: "/terms-of-service", element: <TermsOfServicePage /> },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <Navigate to="/feed" replace /> },
          { path: "/feed", element: <FeedPage /> },
          { path: "/post/:id", element: <PostDetailPage /> },
          { path: "/create", element: <CreatePostPage /> },
          { path: "/user/:handle", element: <UserProfilePage /> },
          { path: "/search", element: <SearchPage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/settings/account", element: <AccountSettingsPage /> },
          { path: "/settings/privacy", element: <PrivacySettingsPage /> },
          { path: "/settings/safety", element: <SafetySettingsPage /> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/admin/dashboard", element: <AdminDashboardPage /> },
          { path: "/admin/reports", element: <AdminReportsPage /> },
        ],
      },
    ],
  },
]);
