import { motion } from "framer-motion";

import { fadeUpItem } from "../lib/motion";

export function PrivacyPolicyPage() {
  return (
    <motion.section
      className="surface-panel mx-auto max-w-5xl"
      variants={fadeUpItem}
      initial="initial"
      animate="animate"
    >
      <p className="eyebrow">Legal</p>
      <h1 className="mt-4 section-title text-mist-50">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-sm leading-8 text-smoke-300">
        <p>VeilSpeak stores public handles, encrypted emails, password hashes, moderation records, and hashed IP telemetry used for abuse prevention.</p>
        <p>We do not require real names. Public content is visible within the platform according to account privacy controls and moderation rules.</p>
        <p>Encrypted email data is used for account recovery and operational notices. Session activity may be cached in Redis for security and performance.</p>
      </div>
    </motion.section>
  );
}
