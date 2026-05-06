import { useEffect, useState, type FormEvent } from "react";

import { notifySuccess } from "../lib/notifications";
import { userService } from "../services/users";

export function PrivacySettingsPage() {
  const [isSearchable, setIsSearchable] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const profile = await userService.getAccountSettings();
        setIsSearchable(profile.is_searchable);
        setShowActivityStatus(profile.show_activity_status);
        setEmailNotifications(profile.email_notifications);
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
      await userService.updatePrivacy({
        is_searchable: isSearchable,
        show_activity_status: showActivityStatus,
        email_notifications: emailNotifications,
      });
      notifySuccess("Privacy settings updated.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <section className="surface-panel max-w-4xl text-smoke-300">Loading privacy settings...</section>;
  }

  return (
    <section className="surface-panel max-w-4xl">
      <p className="eyebrow">Settings</p>
      <h1 className="mt-4 section-title text-mist-50">Privacy settings</h1>
      <form onSubmit={(event) => void save(event)} className="mt-8 space-y-4">
        {[
          {
            label: "Allow profile search results",
            checked: isSearchable,
            onChange: setIsSearchable,
          },
          {
            label: "Show activity status",
            checked: showActivityStatus,
            onChange: setShowActivityStatus,
          },
          {
            label: "Email notifications",
            checked: emailNotifications,
            onChange: setEmailNotifications,
          },
        ].map((item) => (
          <label key={item.label} className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
            <span className="text-sm font-medium text-mist-50">{item.label}</span>
            <input type="checkbox" checked={item.checked} onChange={(event) => item.onChange(event.target.checked)} />
          </label>
        ))}
        <button type="submit" disabled={saving} className="primary-button">
          {saving ? "Saving..." : "Save privacy preferences"}
        </button>
      </form>
    </section>
  );
}
