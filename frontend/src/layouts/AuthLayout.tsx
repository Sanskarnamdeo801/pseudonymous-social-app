import { motion } from "framer-motion";

import { AnimatedOutlet } from "../components/AnimatedOutlet";
import { fadeUpItem, staggerGrid } from "../lib/motion";

export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 dark:bg-ink-950">
      <div className="absolute inset-0 bg-aura" />
      <div className="absolute inset-0 bg-noise bg-[length:28px_28px] opacity-25" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div className="hidden lg:block" variants={staggerGrid} initial="initial" animate="animate">
          <motion.p className="eyebrow" variants={fadeUpItem}>Your Thought Companion</motion.p>
          <motion.h1 className="mt-6 hero-title max-w-4xl text-mist-50" variants={fadeUpItem}>
            Speak loudly.
            <br />
            Stay hidden.
            <br />
            Own the room.
          </motion.h1>
          <motion.p className="mt-8 max-w-2xl text-base leading-8 text-smoke-300" variants={fadeUpItem}>
            VeilSpeak is your thought companion for sharp conversation, private identity handling, and a premium experience that still feels fast.
          </motion.p>
          <motion.div className="mt-10 grid gap-4 sm:grid-cols-3" variants={staggerGrid}>
            <motion.div className="surface-card float-drift bg-ember-500 text-ink-950 glow-border" variants={fadeUpItem}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">Handles first</p>
              <p className="mt-4 font-display text-3xl font-bold">01</p>
            </motion.div>
            <motion.div className="surface-card hover-lift glow-border" variants={fadeUpItem}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember-400">Encrypted identity</p>
              <p className="mt-4 font-display text-3xl font-bold text-mist-50">02</p>
            </motion.div>
            <motion.div className="surface-card hover-lift glow-border" variants={fadeUpItem}>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember-400">High-signal threads</p>
              <p className="mt-4 font-display text-3xl font-bold text-mist-50">03</p>
            </motion.div>
          </motion.div>
        </motion.div>
        <AnimatedOutlet />
      </div>
    </div>
  );
}
