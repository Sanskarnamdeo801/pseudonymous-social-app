import { AdminReportCard } from "../components/AdminReportCard";
import { useEffect, useState } from "react";

import { adminService } from "../services/admin";
import type { AdminReport } from "../types";

export function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [note, setNote] = useState("Handled by moderator");

  const loadReports = async () => {
    const data = await adminService.getReports();
    setReports(data);
  };

  useEffect(() => {
    void loadReports();
  }, []);

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
          <AdminReportCard key={report.id} report={report} resolutionNote={note} onActionComplete={loadReports} />
        ))}
      </div>
    </section>
  );
}
