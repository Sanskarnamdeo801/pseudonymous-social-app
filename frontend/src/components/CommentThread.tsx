import type { Comment } from "../types";

interface CommentThreadProps {
  comments: Comment[];
}

export function CommentThread({ comments }: CommentThreadProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-3xl border border-white/10 bg-black/15 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-display text-base font-semibold text-mist-50">@{comment.author.handle}</span>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-smoke-400">
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
          <p className="text-sm leading-8 text-smoke-300">{comment.content}</p>
          {comment.replies.length > 0 && (
            <div className="mt-4 border-l border-ember-400/30 pl-4">
              <CommentThread comments={comment.replies} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
