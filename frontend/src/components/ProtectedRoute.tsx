import { Navigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center text-smoke-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Loading...
      </motion.div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center text-smoke-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Loading...
      </motion.div>
    );
  }
  return user?.is_admin ? <Outlet /> : <Navigate to="/feed" replace />;
}
