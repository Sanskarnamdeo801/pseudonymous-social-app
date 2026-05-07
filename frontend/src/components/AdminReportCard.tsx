import { useState } from "react";
import { Link } from "react-router-dom";

import { notifySuccess } from "../lib/notifications";
import { adminService } from "../services/admin";
import type { AdminReport, Report } from "../types";

interface AdminReportCardProps {
  report: AdminReport;
  resolutionNote: string;
  onActionComplete: () => Promise<void>;
}

function getResolutionNote(resolutionNote: string, fallback: string) {
  return resolutionNote.trim() || fallback;
}

function getTargetLabel(report: AdminReport) {
  if (report.target_type === "user") {
    return report.target_handle ? `@${report.target_handle}` : "Deleted user";
  }
  if (report.target_type === "post") {
    return report.target_title || "Untitled post";
  }
  return report.target_preview || "Comment";
}

export function AdminReportCard({ report, resolutionNote, onActionComplete }: AdminReportCardProps) {
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const updateReport = async (status: Report["status"], fallbackNote: string, successMessage: string) => {
    setBusyAction(status);
    try {
      await adminService.resolveReport(report.id, status, getResolutionNote(resolutionNote, fallbackNote));
      notifySuccess(successMessage);
      await onActionComplete();
    } finally {
      setBusyAction(null);
    }
  };

  const deleteTarget = async () => {
    setBusyAction("delete");
    try {
      if (report.target_type === "post") {
        await adminService.deletePost(report.target_id);
      } else if (report.target_type === "comment") {
        await adminService.deleteComment(report.target_id);
      }
      await adminService.resolveReport(report.id, "resolved", getResolutionNote(resolutionNote, "Content removed by moderator."));
      notifySuccess(`${report.target_type === "post" ? "Post" : "Comment"} deleted from moderation queue.`);
      await onActionComplete();
    } finally {
      setBusyAction(null);
    }
  };

  const banTargetUser = async () => {
    if (!report.target_user_id) return;
    setBusyAction("ban");
    try {
      await adminService.banUser(report.target_user_id);
      await adminService.resolveReport(report.id, "resolved", getResolutionNote(resolutionNote, "User banned by moderator."));
      notifySuccess(`@${report.target_handle ?? "user"} banned.`);
      await onActionComplete();
    } finally {
      setBusyAction(null);
    }
  };

  const targetRoute = report.target_type === "post"
    ? `/post/${report.target_id}`
    : report.target_post_id
      ? `/post/${report.target_post_id}`
      : null;

  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <div>
            <p className="font-display text-xl font-semibold text-mist-50">
              {report.target_type} · {report.reason}
            </p>
            <p className="mt-2 text-sm text-smoke-400">
              Reported by @{report.reporter_handle}
              {report.target_handle ? ` on @${report.target_handle}` : ""}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            {report.target_title && <p className="font-display text-lg text-mist-50">{report.target_title}</p>}
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-smoke-300">
              {report.target_preview || report.details || "No preview available."}
            </p>
          </div>
          {report.details && (
            <p className="text-sm leading-7 text-smoke-300">
              Reporter note: {report.details}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <span className="rounded-full border border-ember-400/30 bg-ember-400/10 px-3 py-1 text-ember-400">
              {report.status}
            </span>
            {!report.target_exists && (
              <span className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-red-300">
                target missing
              </span>
            )}
            {report.target_deleted && (
              <span className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-red-300">
                already deleted
              </span>
            )}
            {report.target_user_banned && (
              <span className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-red-300">
                user banned
              </span>
            )}
          </div>
          {targetRoute && report.target_exists && !report.target_deleted && (
            <Link to={targetRoute} className="inline-flex text-sm font-medium text-ember-400 transition hover:text-ember-300">
              Open reported content
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {report.status === "open" && report.target_exists && !report.target_deleted && (report.target_type === "post" || report.target_type === "comment") && (
            <button type="button" onClick={() => void deleteTarget()} disabled={busyAction !== null} className="primary-button px-4 py-2 disabled:opacity-60">
              {busyAction === "delete" ? `Deleting ${report.target_type}...` : `Delete ${report.target_type}`}
            </button>
          )}
          {report.status === "open" && report.target_user_id && !report.target_user_banned && (
            <button type="button" onClick={() => void banTargetUser()} disabled={busyAction !== null} className="secondary-button px-4 py-2 disabled:opacity-60">
              {busyAction === "ban" ? "Banning..." : `Ban ${report.target_handle ? `@${report.target_handle}` : "user"}`}
            </button>
          )}
          <button
            type="button"
            onClick={() => void updateReport("resolved", "Handled by moderator.", "Report resolved.")}
            disabled={busyAction !== null}
            className="primary-button px-4 py-2 disabled:opacity-60"
          >
            {busyAction === "resolved" ? "Resolving..." : "Resolve"}
          </button>
          <button
            type="button"
            onClick={() => void updateReport("dismissed", "Dismissed by moderator.", "Report dismissed.")}
            disabled={busyAction !== null}
            className="secondary-button px-4 py-2 disabled:opacity-60"
          >
            {busyAction === "dismissed" ? "Dismissing..." : "Dismiss"}
          </button>
        </div>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-smoke-400">
        Target: {getTargetLabel(report)}
      </p>
    </article>
  );
}
