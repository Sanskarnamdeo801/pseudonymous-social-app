import { Bell, House, Search, SquarePen, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/feed", label: "Home", icon: House },
  { to: "/search", label: "Search", icon: Search },
  { to: "/create", label: "Add", icon: SquarePen, accent: true },
  { to: "/notifications", label: "Alerts", icon: Bell },
];

export function MobileBottomNav({ hidden = false }: { hidden?: boolean }) {
  const { user } = useAuth();
  const profilePath = user ? `/user/${user.handle}` : "/login";

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink-950/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-2xl transition duration-300 lg:hidden ${
        hidden ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="mx-auto flex max-w-xl items-end justify-around gap-2 rounded-[2rem] border border-white/10 bg-white/[0.04] px-2 py-2 shadow-soft">
        {navItems.map(({ to, label, icon: Icon, accent }) => (
          <NavLink key={to} to={to} className="group relative flex flex-1 justify-center">
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.05 }}
                className="relative flex w-full flex-col items-center justify-center gap-1"
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute inset-x-1 top-0 bottom-0 rounded-2xl bg-ember-500/14 shadow-[0_0_0_1px_rgba(255,140,0,0.14)]"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                <span
                  className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                    accent
                      ? "bg-[linear-gradient(135deg,#ff8c00_0%,#ffa726_55%,#ffd180_100%)] text-ink-950 shadow-[0_14px_32px_rgba(255,140,0,0.32)]"
                      : isActive
                        ? "text-ember-400"
                        : "text-smoke-300 group-hover:text-mist-50"
                  }`}
                >
                  <Icon className={`${accent ? "h-5 w-5" : "h-5 w-5"} ${accent ? "" : isActive ? "drop-shadow-[0_0_10px_rgba(255,140,0,0.35)]" : ""}`} />
                </span>
                <span
                  className={`relative text-[11px] font-medium uppercase tracking-[0.2em] transition ${
                    isActive ? "text-ember-400" : "text-smoke-400 group-hover:text-mist-50"
                  }`}
                >
                  {label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}

        <NavLink to={profilePath} className="group relative flex flex-1 justify-center">
          {({ isActive }) => (
            <motion.div whileTap={{ scale: 0.94 }} whileHover={{ scale: 1.05 }} className="relative flex w-full flex-col items-center justify-center gap-1">
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute inset-x-1 top-0 bottom-0 rounded-2xl bg-ember-500/14 shadow-[0_0_0_1px_rgba(255,140,0,0.14)]"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                />
              )}
              <span className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition ${isActive ? "text-ember-400" : "text-smoke-300 group-hover:text-mist-50"}`}>
                <UserRound className={`h-5 w-5 ${isActive ? "drop-shadow-[0_0_10px_rgba(255,140,0,0.35)]" : ""}`} />
              </span>
              <span className={`relative text-[11px] font-medium uppercase tracking-[0.2em] transition ${isActive ? "text-ember-400" : "text-smoke-400 group-hover:text-mist-50"}`}>
                Profile
              </span>
            </motion.div>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
