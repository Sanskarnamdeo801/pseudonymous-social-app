import { useEffect, useState, type FormEvent } from "react";

import { DEMO_PROFILE, JWT_AUTH_DISABLED } from "../lib/guestMode";
import { userService } from "../services/users";

export function PrivacySettingsPage() {
  const [isSearchable, setIsSearchable] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (JWT_AUTH_DISABLED) {
        setIsSearchable(DEMO_PROFILE.is_searchable);
        setShowActivityStatus(DEMO_PROFILE.show_activity_status);
        setEmailNotifications(DEMO_PROFILE.email_notifications);
        return;
      }
      const profile = await userService.getAccountSettings();
      setIsSearchable(profile.is_searchable);
      setShowActivityStatus(profile.show_activity_status);
      setEmailNotifications(profile.email_notifications);
    };
    void load();
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (JWT_AUTH_DISABLED) {
      return;
    }
    await userService.updatePrivacy({
      is_searchable: isSearchable,
      show_activity_status: showActivityStatus,
      email_notifications: emailNotifications,
    });
  };

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
        <button type="submit" className="primary-button">
          Save privacy preferences
        </button>
      </form>
    </section>
  );
}
