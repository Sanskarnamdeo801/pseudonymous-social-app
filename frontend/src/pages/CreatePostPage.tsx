import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { postService } from "../services/posts";

export function CreatePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const post = await postService.createPost(title, content);
      navigate(`/post/${post.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-6">
      <p className="eyebrow">Publish a post</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold text-mist-50">Compose</h1>
      <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-5 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Headline your thought"
          className="field-shell text-lg"
        />
        <textarea
          required
          rows={12}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Context, details, receipts, perspective."
          className="field-shell text-sm leading-8"
        />
        <button type="submit" disabled={loading} className="primary-button animated-button px-6">
          {loading ? "Publishing..." : "Publish post"}
        </button>
      </form>
    </section>
  );
}
