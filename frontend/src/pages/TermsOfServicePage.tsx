import { motion } from "framer-motion";

import { fadeUpItem } from "../lib/motion";

export function TermsOfServicePage() {
  return (
    <motion.section
      className="surface-panel mx-auto max-w-5xl"
      variants={fadeUpItem}
      initial="initial"
      animate="animate"
    >
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 section-title text-mist-50">Terms of Service</h1>
      <div className="mt-6 space-y-4 text-sm leading-8 text-smoke-300">
        <p>Users are responsible for content posted under their handles. Abuse, illegal content, doxxing, and harassment are prohibited.</p>
        <p>VeilSpeak moderators may remove content, review reports, suspend accounts, or ban repeat offenders to protect platform safety.</p>
        <p>By using the service, you agree to platform logging, rate limiting, and abuse-prevention measures required to operate the network securely.</p>
      </div>
    </motion.section>
  );
}
