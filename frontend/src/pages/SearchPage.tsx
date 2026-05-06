import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PostCard } from "../components/PostCard";
import { useDebounce } from "../hooks/useDebounce";
import { fadeUpItem, staggerGrid } from "../lib/motion";
import { userService } from "../services/users";
import type { SearchResponse } from "../types";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults(null);
        return;
      }
      const response = await userService.search(debouncedQuery);
      setResults(response);
    };
    void runSearch();
  }, [debouncedQuery]);

  return (
    <motion.div className="min-h-full" variants={staggerGrid} initial="initial" animate="animate">
      <motion.section className="sticky top-[73px] z-20 border-b border-white/10 bg-ink-950/88 px-6 py-4 backdrop-blur-xl lg:top-0" variants={fadeUpItem}>
        <p className="eyebrow">Search</p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by handle, title, or content"
          className="field-shell mt-3"
        />
      </motion.section>
      {results && (
        <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.section className="border-r border-white/10 px-6 py-5" variants={fadeUpItem}>
            <h2 className="font-display text-2xl font-extrabold text-mist-50">People</h2>
            <div className="mt-5 space-y-3">
              {results.users.map((user) => (
                <Link
                  key={user.id}
                  to={`/user/${user.handle}`}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-ember-400/40 hover:bg-white/[0.07]"
                >
                  <p className="font-display text-lg font-semibold text-mist-50">@{user.handle}</p>
                  <p className="mt-1 text-sm text-smoke-300">{user.bio || "No bio provided."}</p>
                </Link>
              ))}
            </div>
          </motion.section>
          <section>
            {results.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        </div>
      )}
    </motion.div>
  );
}
