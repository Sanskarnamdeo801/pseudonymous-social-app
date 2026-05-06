import { useEffect, useState } from "react";

import { adminService } from "../services/admin";
import type { Report } from "../types";

export function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [note, setNote] = useState("Handled by moderator");

  const loadReports = async () => {
    const data = await adminService.getReports();
    setReports(data);
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const resolve = async (reportId: string, status: Report["status"]) => {
    await adminService.resolveReport(reportId, status, note);
    await loadReports();
  };

  return (
    <section className="surface-panel">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Queue</p>
          <h1 className="mt-4 section-title text-mist-50">Reports</h1>
        </div>
        <input value={note} onChange={(event) => setNote(event.target.value)} className="field-shell max-w-sm rounded-full px-4 py-3 text-sm" />
      </div>
      <div className="space-y-4">
        {reports.map((report) => (
          <article key={report.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl font-semibold text-mist-50">
                  {report.target_type} · {report.reason}
                </p>
                <p className="mt-2 text-sm leading-7 text-smoke-300">{report.details || "No additional detail provided."}</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ember-400">{report.status}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => void resolve(report.id, "resolved")} className="primary-button px-4 py-2">
                  Resolve
                </button>
                <button type="button" onClick={() => void resolve(report.id, "dismissed")} className="secondary-button px-4 py-2">
                  Dismiss
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
