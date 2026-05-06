import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { JWT_AUTH_DISABLED } from "../lib/guestMode";
import { fadeUpItem, staggerGrid } from "../lib/motion";

const companionNotes = [
  "Trend shifts when conviction and clarity meet.",
  "Short posts land harder when the first line carries weight.",
  "Privacy is strongest when identity stays optional.",
];

const suggestedTracks = ["privacy tech", "anonymous culture", "signal design", "digital safety"];

export function RightRail() {
  const { user } = useAuth();
  const profilePath = JWT_AUTH_DISABLED ? "/user/guest" : user ? `/user/${user.handle}` : "/login";

  return (
    <aside className="sticky top-6 hidden h-fit space-y-4 xl:block">
      <motion.div className="surface-card glow-border" variants={staggerGrid} initial="initial" animate="animate">
        <motion.p className="eyebrow" variants={fadeUpItem}>Your Thought Companion</motion.p>
        <motion.h3 className="mt-3 font-display text-2xl font-extrabold text-mist-50" variants={fadeUpItem}>
          Keep your thinking sharp.
        </motion.h3>
        <motion.p className="mt-3 text-sm leading-7 text-smoke-300" variants={fadeUpItem}>
          VeilSpeak works best when your handle stays clean and your posts stay intentional.
        </motion.p>
        <motion.div variants={fadeUpItem} className="mt-4">
          <Link to={profilePath} className="secondary-button animated-button inline-flex">
            {JWT_AUTH_DISABLED ? "Visit demo profile" : "Visit your profile"}
          </Link>
        </motion.div>
      </motion.div>

      <motion.div className="surface-card glow-border" variants={staggerGrid} initial="initial" animate="animate">
        <motion.h4 className="font-display text-xl font-bold text-mist-50" variants={fadeUpItem}>
          Signals worth tracking
        </motion.h4>
        <motion.div className="mt-4 flex flex-wrap gap-2" variants={fadeUpItem}>
          {suggestedTracks.map((item) => (
            <span key={item} className="rounded-full border border-ember-400/20 bg-ember-500/10 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-ember-400">
              {item}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div className="surface-card glow-border" variants={staggerGrid} initial="initial" animate="animate">
        <motion.h4 className="font-display text-xl font-bold text-mist-50" variants={fadeUpItem}>
          Companion notes
        </motion.h4>
        <div className="mt-4 space-y-3">
          {companionNotes.map((note) => (
            <motion.div key={note} variants={fadeUpItem} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-sm leading-7 text-smoke-300">{note}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </aside>
  );
}
