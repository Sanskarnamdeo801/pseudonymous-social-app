import { useEffect, useState, type FormEvent } from "react";

import { DEMO_PROFILE, JWT_AUTH_DISABLED } from "../lib/guestMode";
import { userService } from "../services/users";
import type { UserProfile } from "../types";

export function AccountSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const load = async () => {
      if (JWT_AUTH_DISABLED) {
        setProfile(DEMO_PROFILE);
        setHandle(DEMO_PROFILE.handle);
        setBio(DEMO_PROFILE.bio);
        return;
      }
      const data = await userService.getAccountSettings();
      setProfile(data);
      setHandle(data.handle);
      setBio(data.bio);
    };
    void load();
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (JWT_AUTH_DISABLED) {
      setProfile((current) => (current ? { ...current, handle, bio } : current));
      return;
    }
    const updated = await userService.updateAccount({ handle, bio });
    setProfile(updated);
  };

  return (
    <section className="surface-panel max-w-4xl">
      <p className="eyebrow">Settings</p>
      <h1 className="mt-4 section-title text-mist-50">Account settings</h1>
      <form onSubmit={(event) => void save(event)} className="mt-8 space-y-5">
        <input value={handle} onChange={(event) => setHandle(event.target.value)} className="field-shell" />
        <textarea
          rows={5}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="field-shell"
        />
        <button type="submit" className="primary-button">
          Save changes
        </button>
      </form>
      {profile && <p className="mt-5 text-sm text-smoke-400">Last loaded alias: @{profile.handle}</p>}
    </section>
  );
}
