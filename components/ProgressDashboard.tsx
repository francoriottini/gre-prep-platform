"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { authFetch } from "@/lib/api-client";
import { summarizeGuestProgress } from "@/lib/local-progress";
import type { ProgressSummaryResponse } from "@/lib/types";

export function ProgressDashboard() {
  const { tr } = useI18n();
  const [data, setData] = useState<ProgressSummaryResponse | null>(null);
  const [guestFallback, setGuestFallback] = useState<ReturnType<typeof summarizeGuestProgress> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      try {
        const response = await authFetch("/api/progress/summary", { method: "GET" });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? "Failed to load progress");
        }
        const payload = (await response.json()) as ProgressSummaryResponse;
        if (!mounted) {
          return;
        }
        setData(payload);
        if (payload.mode === "guest") {
          setGuestFallback(summarizeGuestProgress());
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unexpected error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="card">
        <p>Loading progress...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card">
        <p className="error">{error}</p>
      </section>
    );
  }

  const source = data?.mode === "authenticated" ? data : null;
  const guest = guestFallback;
  const overall = source?.overall ?? guest?.overall ?? { attempts: 0, accuracy: 0, avg_time_seconds: 0 };
  const byTopic = source?.by_topic ?? guest?.by_topic ?? [];

  return (
    <section className="stack">
      <article className="card">
        <h2>{tr("dashboard")}</h2>
        <p>
          Mode:{" "}
          <strong>{source ? tr("authenticatedMode") : tr("guestMode")}</strong>
        </p>
        <p>
          Attempts: {overall.attempts} | {tr("accuracy")}: {overall.accuracy}% | {tr("avgTime")}:{" "}
          {overall.avg_time_seconds}s
        </p>
      </article>

      <article className="card">
        <h3>{tr("topic")}</h3>
        {!byTopic.length ? (
          <p>{tr("noData")}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Answered</th>
                  <th>{tr("accuracy")}</th>
                  <th>{tr("avgTime")}</th>
                </tr>
              </thead>
              <tbody>
                {byTopic.map((item) => (
                  <tr key={item.topic}>
                    <td>{item.topic}</td>
                    <td>{item.answered}</td>
                    <td>{item.accuracy}%</td>
                    <td>{item.avg_time_seconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {source?.weekly_trend?.length ? (
        <article className="card">
          <h3>Weekly trend</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Week</th>
                  <th>Answered</th>
                  <th>{tr("accuracy")}</th>
                </tr>
              </thead>
              <tbody>
                {source.weekly_trend.map((item) => (
                  <tr key={item.week_start}>
                    <td>{item.week_start}</td>
                    <td>{item.answered}</td>
                    <td>{item.accuracy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}
    </section>
  );
}
