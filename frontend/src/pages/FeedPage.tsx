import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PostCard } from "../components/PostCard";
import { useAuth } from "../hooks/useAuth";
import { feedService } from "../services/feed";
import type { Post } from "../types";

const tickerItems = [
  "PRIVATE VOICE",
  "HANDLE FIRST",
  "ENCRYPTED IDENTITY",
  "TRENDING SIGNAL",
  "QUIET NAMES, LOUD TAKES",
];

export function FeedPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<"chronological" | "trending">("chronological");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        const response = await feedService.getFeed(mode);
        setPosts(response.items);
      } finally {
        setLoading(false);
      }
    };
    void loadFeed();
  }, [mode]);

  return (
    <div>
      <div className="sticky top-[73px] z-20 border-b border-white/10 bg-ink-950/88 backdrop-blur-xl lg:top-0">
        <div className="px-6 py-4">
          <h1 className="font-display text-2xl font-extrabold text-mist-50">Home</h1>
        </div>
        <div className="flex border-t border-white/10">
          {(["chronological", "trending"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`relative flex-1 px-4 py-4 text-sm font-semibold capitalize transition ${
                mode === option ? "text-mist-50" : "text-smoke-300 hover:bg-white/5 hover:text-mist-50"
              }`}
            >
              {option}
              {mode === option && <span className="absolute inset-x-10 bottom-0 h-1 rounded-full bg-ember-500" />}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ember-500 font-display text-lg font-extrabold text-ink-950">
            {(user?.handle?.[0] ?? "V").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base text-smoke-300">What do you want to say today?</p>
            <div className="signal-ticker mt-4 px-0 py-3">
              <div className="signal-track px-5">
                {[...tickerItems, ...tickerItems].map((item, index) => (
                  <span key={`${item}-${index}`} className="font-mono text-[11px] uppercase tracking-[0.28em] text-smoke-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-smoke-400">Your Thought Companion helps shape every post with clarity.</p>
              <Link to="/create" className="primary-button animated-button inline-flex rounded-full px-5 py-2.5">
                New Post
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="px-6 py-8 text-center text-smoke-300">Loading feed...</div>
        ) : (
          posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              revealIndex={index}
              onPostUpdated={(nextPost) =>
                setPosts((current) => current.map((candidate) => (candidate.id === nextPost.id ? nextPost : candidate)))
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
