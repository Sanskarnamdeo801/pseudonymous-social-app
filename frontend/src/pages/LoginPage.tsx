import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { fadeUpItem, staggerGrid } from "../lib/motion";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(handle, password);
      navigate(user.is_admin ? "/admin/dashboard" : "/feed");
    } catch {
      setError("Unable to sign in with that handle and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="surface-panel glow-border" variants={staggerGrid} initial="initial" animate="animate">
      <motion.p className="eyebrow" variants={fadeUpItem}>Your Thought Companion</motion.p>
      <motion.h2 className="mt-4 font-display text-4xl font-extrabold text-mist-50" variants={fadeUpItem}>Log in</motion.h2>
      <motion.p className="mt-3 text-sm leading-7 text-smoke-300" variants={fadeUpItem}>Access your account and pick up the conversation where you left it.</motion.p>
      <form onSubmit={(event) => void submit(event)} className="mt-8 space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-smoke-300">Handle</span>
          <input
            required
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            placeholder="@midnight_echo"
            className="field-shell"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-smoke-300">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your secret phrase"
            className="field-shell"
          />
        </label>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="primary-button animated-button w-full">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-smoke-400">
        Need an alias? <Link to="/signup" className="font-semibold text-ember-400">Create one</Link>
      </p>
    </motion.div>
  );
}
