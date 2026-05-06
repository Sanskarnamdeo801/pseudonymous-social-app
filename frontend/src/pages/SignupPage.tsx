import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { JWT_AUTH_DISABLED } from "../lib/guestMode";
import { fadeUpItem, staggerGrid } from "../lib/motion";

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (JWT_AUTH_DISABLED) {
        navigate("/feed");
        return;
      }
      await signup(email, handle, password);
      navigate("/feed");
    } catch {
      setError("Signup failed. Check handle uniqueness and password length.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="surface-panel glow-border" variants={staggerGrid} initial="initial" animate="animate">
      <motion.p className="eyebrow" variants={fadeUpItem}>Your Thought Companion</motion.p>
      <motion.h2 className="mt-4 font-display text-4xl font-extrabold text-mist-50" variants={fadeUpItem}>Sign up</motion.h2>
      <motion.p className="mt-3 text-sm leading-7 text-smoke-300" variants={fadeUpItem}>
        {JWT_AUTH_DISABLED
          ? "Account creation is disabled in this demo build. Use the route to jump straight into the interface."
          : "Create your handle, secure your credentials, and enter VeilSpeak with a clean profile."}
      </motion.p>
      <form onSubmit={(event) => void submit(event)} className="mt-8 space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-smoke-300">Encrypted email</span>
          <input
            required={!JWT_AUTH_DISABLED}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="alias@veilspeak.club"
            className="field-shell"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-smoke-300">Handle</span>
          <input
            required={!JWT_AUTH_DISABLED}
            value={handle}
            onChange={(event) => setHandle(event.target.value.toLowerCase())}
            placeholder="midnight_echo"
            className="field-shell"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-smoke-300">Password</span>
          <input
            required={!JWT_AUTH_DISABLED}
            type="password"
            minLength={10}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 10 characters"
            className="field-shell"
          />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="primary-button animated-button w-full">
          {loading ? "Opening demo..." : JWT_AUTH_DISABLED ? "Continue to demo" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-smoke-400">
        Already joined? <Link to="/login" className="font-semibold text-ember-400">Log in</Link>
      </p>
    </motion.div>
  );
}
