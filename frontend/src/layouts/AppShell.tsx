import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { AnimatedOutlet } from "../components/AnimatedOutlet";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { Navbar } from "../components/Navbar";
import { RightRail } from "../components/RightRail";
import { Sidebar } from "../components/Sidebar";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-ink-950 text-mist-50 dark:bg-ink-950 dark:text-mist-50">
      <div className="fixed inset-0 -z-10 bg-aura" />
      <div className="fixed inset-0 -z-10 bg-noise bg-[length:28px_28px] opacity-20" />
      <Navbar onMenuToggle={() => setSidebarOpen((current) => !current)} hidden={sidebarOpen} />
      <div className="mx-auto grid max-w-[1380px] grid-cols-1 gap-0 px-0 lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,620px)_340px]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <AnimatePresence>
          {sidebarOpen && (
            <motion.button
              type="button"
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
        <main className="min-h-[calc(100vh-80px)] min-w-0 border-x border-white/10 px-0 py-0 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] lg:pb-0">
          <AnimatedOutlet />
        </main>
        <div className="px-4 py-6 xl:px-6">
          <RightRail />
        </div>
      </div>
      <MobileBottomNav hidden={sidebarOpen} />
    </div>
  );
}
