import { Flag, Heart, MessageCircle, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

import { fadeUpItem } from "../lib/motion";
import { postService } from "../services/posts";
import { reportService } from "../services/reports";
import type { Post } from "../types";
import { Modal } from "./Modal";

interface PostCardProps {
  post: Post;
  onPostUpdated?: (post: Post) => void;
  revealIndex?: number;
}

export function PostCard({ post, onPostUpdated, revealIndex = 0 }: PostCardProps) {
  const [draftReason, setDraftReason] = useState("Harassment or abuse");
  const [draftDetails, setDraftDetails] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLike = async () => {
    const response = await postService.toggleLike(post.id);
    onPostUpdated?.({
      ...post,
      liked_by_viewer: response.liked,
      like_count: response.like_count,
    });
  };

  const submitReport = async () => {
    setSubmitting(true);
    try {
      await reportService.create({
        target_type: "post",
        target_id: post.id,
        reason: draftReason,
        details: draftDetails,
      });
      setReportOpen(false);
      setDraftDetails("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <motion.article
        className="border-b border-white/10 px-6 py-5 transition hover:bg-white/[0.03]"
        style={{ animationDelay: `${Math.min(revealIndex, 6) * 90}ms` }}
        variants={fadeUpItem}
        initial="initial"
        animate="animate"
      >
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-base font-bold text-mist-50">
            {post.author.handle.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link to={`/user/${post.author.handle}`} className="font-display text-lg font-semibold text-mist-50">
                @{post.author.handle}
              </Link>
              <span className="text-sm text-smoke-400">·</span>
              <p className="text-sm text-smoke-400">{new Date(post.created_at).toLocaleString()}</p>
              {post.auto_flagged && (
                <span className="inline-flex items-center gap-1 rounded-full border border-ember-400/30 bg-ember-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ember-400">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  review
                </span>
              )}
            </div>
            <Link to={`/post/${post.id}`} className="mt-2 block space-y-2">
              <h3 className="font-display text-2xl font-bold leading-tight text-mist-50">{post.title}</h3>
              <p className="whitespace-pre-wrap text-[15px] leading-7 text-smoke-300">{post.content}</p>
            </Link>
            <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleLike}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
              post.liked_by_viewer
                ? "bg-ember-500 text-ink-950"
                : "bg-white/5 text-smoke-300 hover:text-ember-400"
            }`}
          >
            <Heart className="h-4 w-4" />
            {post.like_count}
          </button>
          <Link
            to={`/post/${post.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-smoke-300 transition hover:text-mist-50"
          >
            <MessageCircle className="h-4 w-4" />
            {post.comment_count}
          </Link>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-smoke-300 transition hover:border-ember-400/40 hover:text-ember-400"
          >
            <Flag className="h-4 w-4" />
            Report
          </button>
            </div>
          </div>
        </div>
      </motion.article>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report post">
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
            Submit report
          </button>
        </div>
      </Modal>
    </>
  );
}
