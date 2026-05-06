import { useEffect, useState, type FormEvent } from "react";

import { notifySuccess } from "../lib/notifications";
import { userService } from "../services/users";
import type { UserProfile } from "../types";

export function AccountSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await userService.getAccountSettings();
        setProfile(data);
        setHandle(data.handle);
        setBio(data.bio);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateAccount({ handle, bio });
      setProfile(updated);
      notifySuccess("Account settings updated.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <section className="surface-panel max-w-4xl text-smoke-300">Loading account settings...</section>;
  }

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
        <button type="submit" disabled={saving} className="primary-button">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
      {profile && <p className="mt-5 text-sm text-smoke-400">Last loaded alias: @{profile.handle}</p>}
    </section>
  );
}
