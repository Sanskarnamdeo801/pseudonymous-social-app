import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { AdminReportCard } from "../components/AdminReportCard";
import { Modal } from "../components/Modal";
import { adminService } from "../services/admin";
import type { AdminDashboard, AdminReport } from "../types";

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboard | null>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [note, setNote] = useState("Handled by moderator");
  const [popupReport, setPopupReport] = useState<AdminReport | null>(null);
  const initializedRef = useRef(false);
  const seenOpenReportsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const [dashboard, reportQueue] = await Promise.all([
        adminService.getDashboard(),
        adminService.getReports(),
      ]);
      setStats(dashboard);
      setReports(reportQueue);

      const openReports = reportQueue.filter((report) => report.status === "open");
      const nextOpenIds = new Set(openReports.map((report) => report.id));
      if (initializedRef.current) {
        const freshReport = openReports.find((report) => !seenOpenReportsRef.current.has(report.id));
        if (freshReport) {
          setPopupReport(freshReport);
        }
      } else {
        initializedRef.current = true;
      }
      seenOpenReportsRef.current = nextOpenIds;
    };

    void load();
    const intervalId = window.setInterval(() => {
      void load();
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  if (!stats) {
    return <div className="text-smoke-300">Loading dashboard...</div>;
  }

  const openReports = reports.filter((report) => report.status === "open");

  const refreshDashboard = async () => {
    const [dashboard, reportQueue] = await Promise.all([
      adminService.getDashboard(),
      adminService.getReports(),
    ]);
    setStats(dashboard);
    setReports(reportQueue);
    seenOpenReportsRef.current = new Set(reportQueue.filter((report) => report.status === "open").map((report) => report.id));
    if (popupReport) {
      const updatedPopup = reportQueue.find((report) => report.id === popupReport.id) ?? null;
      setPopupReport(updatedPopup?.status === "open" ? updatedPopup : null);
    }
  };

  return (
    <>
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
      <section className="surface-panel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Live queue</p>
            <h2 className="mt-4 font-display text-3xl font-bold text-mist-50">Open reports</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="field-shell max-w-sm rounded-full px-4 py-3 text-sm"
            />
            <Link to="/admin/reports" className="primary-button inline-flex">
              Full moderation queue
            </Link>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {openReports.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-smoke-300">
              No open reports right now.
            </div>
          ) : (
            openReports.slice(0, 3).map((report) => (
              <AdminReportCard key={report.id} report={report} resolutionNote={note} onActionComplete={refreshDashboard} />
            ))
          )}
        </div>
      </section>
    </div>
    <Modal
      open={popupReport !== null}
      onClose={() => setPopupReport(null)}
      title="New report received"
    >
      {popupReport && (
        <div className="space-y-4">
          <p className="text-sm leading-7 text-smoke-300">
            @{popupReport.reporter_handle} reported a {popupReport.target_type}
            {popupReport.target_handle ? ` from @${popupReport.target_handle}` : ""}.
          </p>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            {popupReport.target_title && <p className="font-display text-lg text-mist-50">{popupReport.target_title}</p>}
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-smoke-300">
              {popupReport.target_preview || popupReport.details || "No preview available."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setPopupReport(null)} className="secondary-button px-4 py-2">
              Keep browsing
            </button>
            <Link to="/admin/reports" onClick={() => setPopupReport(null)} className="primary-button inline-flex px-4 py-2">
              Open moderation queue
            </Link>
          </div>
        </div>
      )}
    </Modal>
    </>
  );
}
