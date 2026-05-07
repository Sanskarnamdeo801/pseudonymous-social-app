import { Flag } from "lucide-react";
import { useState } from "react";

import { notifySuccess } from "../lib/notifications";
import { reportService } from "../services/reports";
import type { Comment } from "../types";
import { Modal } from "./Modal";

interface CommentThreadProps {
  comments: Comment[];
}

function CommentNode({ comment }: { comment: Comment }) {
  const [draftReason, setDraftReason] = useState("Harassment or abuse");
  const [draftDetails, setDraftDetails] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submitReport = async () => {
    setSubmitting(true);
    try {
      await reportService.create({
        target_type: "comment",
        target_id: comment.id,
        reason: draftReason,
        details: draftDetails,
      });
      notifySuccess("Comment reported to the moderation queue.");
      setDraftDetails("");
      setReportOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="rounded-3xl border border-white/10 bg-black/15 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="font-display text-base font-semibold text-mist-50">@{comment.author.handle}</span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-smoke-400">
              {new Date(comment.created_at).toLocaleString()}
            </span>
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-smoke-300 transition hover:border-ember-400/40 hover:text-ember-400"
            >
              <Flag className="h-3.5 w-3.5" />
              Report
            </button>
          </div>
        </div>
        <p className="text-sm leading-8 text-smoke-300">{comment.content}</p>
        {comment.replies.length > 0 && (
          <div className="mt-4 border-l border-ember-400/30 pl-4">
            <CommentThread comments={comment.replies} />
          </div>
        )}
      </div>
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report comment">
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-smoke-300">Reason</span>
            <input value={draftReason} onChange={(event) => setDraftReason(event.target.value)} className="field-shell py-3 text-sm" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-smoke-300">Details</span>
            <textarea
              rows={4}
              value={draftDetails}
              onChange={(event) => setDraftDetails(event.target.value)}
              className="field-shell text-sm"
            />
          </label>
          <button type="button" disabled={submitting} onClick={() => void submitReport()} className="primary-button disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </div>
      </Modal>
    </>
  );
}

export function CommentThread({ comments }: CommentThreadProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentNode key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
