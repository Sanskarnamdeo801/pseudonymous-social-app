import { Bell, LogOut, Menu, MoonStar, Search, Shield, SunMedium } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { fadeUpItem, staggerGrid } from "../lib/motion";

interface NavbarProps {
  onMenuToggle: () => void;
  hidden?: boolean;
}

export function Navbar({ onMenuToggle, hidden = false }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const profilePath = user ? `/user/${user.handle}` : "/login";

  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/10 bg-ink-950/92 backdrop-blur-xl transition duration-300 lg:hidden dark:border-white/10 dark:bg-ink-950/92 ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <motion.div
        className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8"
        variants={staggerGrid}
        initial="initial"
        animate="animate"
      >
        <button
          type="button"
          onClick={onMenuToggle}
          className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-mist-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <motion.div variants={fadeUpItem} className="mr-auto">
        <Link to="/feed" className="flex items-center gap-3">
          <div className="glow-pulse flex h-11 w-11 items-center justify-center rounded-2xl bg-ember-500 font-display text-lg font-extrabold text-ink-950 shadow-glow">
            V
          </div>
          <div>
            <p className="font-display text-xl font-extrabold text-mist-50">VeilSpeak</p>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-smoke-400">Your Thought Companion</p>
          </div>
        </Link>
        </motion.div>
        <nav className="hidden items-center gap-3 md:flex">
          {user?.is_admin && (
            <motion.div variants={fadeUpItem}>
            <Link to="/admin/dashboard" className="secondary-button animated-button px-4 py-2">
              <Shield className="mr-2 inline h-4 w-4" />
              Admin
            </Link>
            </motion.div>
          )}
          <motion.div variants={fadeUpItem}>
          <Link to="/search" className="secondary-button animated-button px-4 py-2">
            <Search className="mr-2 inline h-4 w-4" />
            Search
          </Link>
          </motion.div>
          <motion.div variants={fadeUpItem}>
          <Link to="/notifications" className="animated-button rounded-full border border-white/12 bg-white/5 p-3 text-mist-50 transition hover:border-ember-400/40 hover:text-ember-400">
            <Bell className="h-4 w-4" />
          </Link>
          </motion.div>
          <button
            type="button"
            onClick={toggleTheme}
            className="animated-button rounded-full border border-white/12 bg-white/5 p-3 text-mist-50 transition hover:border-ember-400/40 hover:text-ember-400"
          >
            {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <motion.div variants={fadeUpItem}>
          <Link
            to={profilePath}
            className="animated-button rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-medium text-mist-50 transition hover:border-ember-400/40"
          >
            @{user?.handle}
          </Link>
          </motion.div>
          <motion.div variants={fadeUpItem}>
          <button
            type="button"
            onClick={() => void logout()}
            className="primary-button animated-button px-4 py-2"
          >
            <LogOut className="mr-2 inline h-4 w-4" />
            Exit
          </button>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}
