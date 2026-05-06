import { useEffect, useState } from "react";

import { DEMO_NOTIFICATIONS, JWT_AUTH_DISABLED } from "../lib/guestMode";
import { notificationService } from "../services/notifications";
import type { NotificationItem } from "../types";

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const load = async () => {
      if (JWT_AUTH_DISABLED) {
        setItems(DEMO_NOTIFICATIONS);
        return;
      }
      const data = await notificationService.list();
      setItems(data);
    };
    void load();
  }, []);

  const markRead = async () => {
    if (JWT_AUTH_DISABLED) {
      setItems((current) => current.map((item) => ({ ...item, is_read: true })));
      return;
    }
    await notificationService.markRead();
    setItems((current) => current.map((item) => ({ ...item, is_read: true })));
  };

  return (
    <section>
      <div className="sticky top-[73px] z-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-ink-950/88 px-6 py-4 backdrop-blur-xl lg:top-0">
        <div>
          <p className="eyebrow">Alerts</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-mist-50">Notifications</h1>
        </div>
        <button type="button" onClick={() => void markRead()} className="primary-button animated-button px-4 py-2">
          Mark all read
        </button>
      </div>
      <div>
        {items.map((item) => (
          <div
            key={item.id}
            className={`border-b border-white/10 px-6 py-5 ${item.is_read ? "bg-transparent" : "bg-ember-400/10"}`}
          >
            <p className="font-display text-lg font-semibold text-mist-50">{item.message}</p>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-smoke-400">{new Date(item.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
