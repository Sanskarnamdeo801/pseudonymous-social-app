import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";

import { CommentThread } from "../components/CommentThread";
import { PostCard } from "../components/PostCard";
import { postService } from "../services/posts";
import type { PostDetail } from "../types";

export function PostDetailPage() {
  const { id = "" } = useParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPost = async () => {
    setLoading(true);
    try {
      const response = await postService.getPost(id);
      setPost(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPost();
  }, [id]);

  const submitComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    await postService.createComment(id, comment);
    setComment("");
    await loadPost();
  };

  if (loading) {
    return <div className="text-smoke-300">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-smoke-300">Post not found.</div>;
  }

  return (
    <div>
      <PostCard post={post} onPostUpdated={(nextPost) => setPost((current) => (current ? { ...current, ...nextPost } : current))} />
      <section className="border-t border-white/10 px-6 py-6">
        <h2 className="font-display text-2xl font-bold text-mist-50">Reply</h2>
        <form onSubmit={(event) => void submitComment(event)} className="mt-5 space-y-3">
          <textarea
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a pseudonymous reply"
            className="field-shell text-sm"
          />
          <button type="submit" className="primary-button animated-button">
            Publish comment
          </button>
        </form>
        <div className="mt-8">
          <CommentThread comments={post.comments} />
        </div>
      </section>
    </div>
  );
}
