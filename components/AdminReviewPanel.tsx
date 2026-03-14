"use client";

import { useState } from "react";
import { authFetch } from "@/lib/api-client";

type AdminQuestion = {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: number;
  stem: string;
  status: "draft" | "reviewed" | "published";
  reviewer_1: string | null;
  reviewer_2: string | null;
  created_at: string;
  published_at: string | null;
};

export function AdminReviewPanel() {
  const [status, setStatus] = useState<"draft" | "reviewed" | "published">("draft");
  const [items, setItems] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await authFetch(`/api/admin/questions?status=${status}`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to fetch admin list");
      }

      const body = await response.json();
      setItems(body.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, nextStatus: AdminQuestion["status"]) => {
    setError(null);

    try {
      const response = await authFetch("/api/admin/questions", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ id, status: nextStatus })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update item");
      }

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected update error");
    }
  };

  return (
    <section className="stack">
      <article className="card stack">
        <h2>Admin Review</h2>
        <p>Sign in with an account present in the `admin_users` table.</p>
        <label>
          <span>Status filter</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="draft">draft</option>
            <option value="reviewed">reviewed</option>
            <option value="published">published</option>
          </select>
        </label>
        <button type="button" className="button button-primary" onClick={loadItems} disabled={loading}>
          {loading ? "Loading..." : "Load items"}
        </button>
        {error ? <p className="error">{error}</p> : null}
      </article>

      {items.map((item) => (
        <article key={item.id} className="card stack">
          <strong>
            {item.topic} / {item.subtopic} / D{item.difficulty}
          </strong>
          <p>{item.stem}</p>
          <p>Status: {item.status}</p>
          <div className="inline-wrap">
            <button type="button" className="button" onClick={() => updateStatus(item.id, "draft")}>
              Mark draft
            </button>
            <button type="button" className="button" onClick={() => updateStatus(item.id, "reviewed")}>
              Mark reviewed
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => updateStatus(item.id, "published")}
            >
              Publish
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
