import { motion } from "framer-motion";
import { FileText, Info, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
const mobileLinks = [
  { to: "/settings/account", label: "Settings", icon: Settings },
  { to: "/privacy-policy", label: "Privacy", icon: FileText },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const [isDesktop, setIsDesktop] = useState(() => (typeof window !== "undefined" ? window.innerWidth >= 1024 : false));

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ x: isDesktop || open ? 0 : "-100%" }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-y-0 left-0 z-[60] w-[75vw] max-w-[320px] border-r border-white/10 bg-ink-950/98 p-6 backdrop-blur-2xl lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:w-72 lg:max-w-none lg:bg-ink-950/96 lg:backdrop-blur-xl"
    >
      <div className="flex h-full flex-col">
        <Link to="/feed" onClick={onClose} className="mb-8 flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-white/5">
          <div className="glow-pulse flex h-11 w-11 items-center justify-center rounded-2xl bg-ember-500 font-display text-lg font-extrabold text-ink-950 shadow-glow">
            V
          </div>
          <div>
            <p className="font-display text-xl font-extrabold text-mist-50">VeilSpeak</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-smoke-400">Your Thought Companion</p>
          </div>
        </Link>
        <nav className="space-y-3">
        {mobileLinks.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-2xl px-4 py-3 text-[15px] font-medium transition ${
                isActive
                  ? "bg-ember-500 text-ink-950 shadow-glow"
                  : "text-mist-50 hover:bg-white/5 hover:text-ember-400"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="surface-card gradient-surface mt-auto rounded-[1.75rem] bg-aura shadow-[0_16px_44px_rgba(255,140,0,0.16)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">APP INFORMATION</p>
            <h2 className="mt-4 font-display text-2xl font-extrabold text-mist-50">VeilSpeak v1.0.4 🚀</h2>
          </div>
          <div className="rounded-2xl bg-ember-500/14 p-2 text-ember-400">
            <Info className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-sm leading-7 text-smoke-300">Secure, encrypted, and private communication for your digital identity.</p>
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        className="secondary-button animated-button mt-auto hidden w-full items-center justify-center rounded-2xl lg:inline-flex"
      >
        Sign out
      </button>
      </div>
    </motion.aside>
  );
}
