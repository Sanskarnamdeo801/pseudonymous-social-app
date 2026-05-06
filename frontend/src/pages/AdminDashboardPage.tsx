import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { adminService } from "../services/admin";
import type { AdminDashboard } from "../types";

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboard | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await adminService.getDashboard();
      setStats(data);
    };
    void load();
  }, []);

  if (!stats) {
    return <div className="text-smoke-300">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel">
        <p className="eyebrow">Admin overview</p>
        <h1 className="mt-4 section-title text-mist-50">Moderation dashboard</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Users", stats.users],
            ["Posts", stats.posts],
            ["Open reports", stats.open_reports],
            ["Banned users", stats.banned_users],
          ].map(([label, value]) => (
            <div key={label} className="surface-card p-6">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-ember-400">{label}</p>
              <p className="mt-2 font-display text-3xl font-bold text-mist-50">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <Link to="/admin/reports" className="primary-button inline-flex">
        Review reports
      </Link>
    </div>
  );
}
