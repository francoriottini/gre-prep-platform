"use client";

import { useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const { tr } = useI18n();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo
        }
      });
      if (authError) {
        throw authError;
      }
      setMessage(tr("sentMagicLink"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected auth error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card stack">
      <h2>{tr("login")}</h2>
      <form onSubmit={handleSubmit} className="stack">
        <label>
          <span>{tr("email")}</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>
        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? "..." : tr("sendMagicLink")}
        </button>
      </form>
      {message ? <p className="ok">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
