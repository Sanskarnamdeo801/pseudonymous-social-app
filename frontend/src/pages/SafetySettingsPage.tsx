import { useEffect, useState, type FormEvent } from "react";

import { userService } from "../services/users";

export function SafetySettingsPage() {
  const [blurSensitiveContent, setBlurSensitiveContent] = useState(true);
  const [filteredKeywords, setFilteredKeywords] = useState("doxx,harassment");

  useEffect(() => {
    const load = async () => {
      const profile = await userService.getAccountSettings();
      setBlurSensitiveContent(profile.blur_sensitive_content);
      setFilteredKeywords(profile.filtered_keywords.join(","));
    };
    void load();
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    await userService.updateSafety({
      blur_sensitive_content: blurSensitiveContent,
      filtered_keywords: filteredKeywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
  };

  return (
    <section className="surface-panel max-w-4xl">
      <p className="eyebrow">Settings</p>
      <h1 className="mt-4 section-title text-mist-50">Safety settings</h1>
      <form onSubmit={(event) => void save(event)} className="mt-8 space-y-5">
        <label className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
          <span className="text-sm font-medium text-mist-50">Blur sensitive content</span>
          <input
            type="checkbox"
            checked={blurSensitiveContent}
            onChange={(event) => setBlurSensitiveContent(event.target.checked)}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-smoke-300">Filtered keywords</span>
          <textarea
            rows={4}
            value={filteredKeywords}
            onChange={(event) => setFilteredKeywords(event.target.value)}
            className="field-shell"
          />
        </label>
        <button type="submit" className="primary-button">
          Save safety controls
        </button>
      </form>
    </section>
  );
}
