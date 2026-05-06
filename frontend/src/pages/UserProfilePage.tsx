import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { userService } from "../services/users";
import type { UserProfile } from "../types";

export function UserProfilePage() {
  const { handle = "" } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await userService.getProfile(handle);
        setProfile(data);
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, [handle]);

  if (loading) {
    return <div className="text-smoke-300">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-smoke-300">Profile not found.</div>;
  }

  return (
    <section>
      <div className="h-44 bg-[linear-gradient(135deg,_rgba(255,140,0,0.9),_rgba(255,167,38,0.6),_rgba(255,209,128,0.35))]" />
      <div className="border-b border-white/10 px-6 pb-6">
        <div className="-mt-14 flex h-28 w-28 items-center justify-center rounded-full border-4 border-ink-950 bg-white/10 font-display text-4xl font-extrabold text-mist-50">
          {profile.handle.slice(0, 1).toUpperCase()}
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-mist-50">@{profile.handle}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-smoke-300">{profile.bio || "No public bio yet."}</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-smoke-300">
            {profile.is_searchable ? "Searchable" : "Private profile"}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-smoke-300">
          <p><span className="font-semibold text-mist-50">{profile.post_count}</span> posts</p>
          <p><span className="font-semibold text-mist-50">{new Date(profile.created_at).toLocaleDateString()}</span> joined</p>
        </div>
      </div>
      <div className="px-6 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="eyebrow">Profile signal</p>
          <p className="mt-3 text-sm leading-8 text-smoke-300">
            This profile follows the same X-style reading flow as the rest of VeilSpeak: banner, identity focus, compact stats, then content-first navigation.
          </p>
        </div>
      </div>
    </section>
  );
}
