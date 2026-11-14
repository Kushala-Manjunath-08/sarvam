"use client";

import { useState, type FormEvent } from "react";
import KaravaliAdminContentManager from "./KaravaliAdminContentManager";

const API = "http://127.0.0.1:8000";

type Contribution = {
  id: number;
  title: string;
  category: string;
  district: string;
  location: string;
  description: string;
  photograph: string | null;
  contributor: string;
  status: string;
  created_at: string;
};
type ReviewReport = {
  id: number;
  review_id: number;
  reason: string;
  created_at: string;
  place_id: string;
  contributor: string;
  review: string;
};
type Counts = {
  districts: number;
  categories: number;
  places: number;
  timeline_entries: number;
  pending_contributions: number;
  approved_contributions: number;
  published_reviews: number;
  hidden_reviews: number;
  open_review_reports: number;
  community_media: number;
};
type ApiError = { detail?: string; message?: string };
type DashboardTab = "overview" | "content" | "moderation";

const countCards: { key: keyof Counts; label: string }[] = [
  { key: "districts", label: "Districts" },
  { key: "categories", label: "Heritage sections" },
  { key: "places", label: "Place records" },
  { key: "timeline_entries", label: "Timeline entries" },
  { key: "pending_contributions", label: "Pending submissions" },
  { key: "approved_contributions", label: "Published submissions" },
  { key: "published_reviews", label: "Published reviews" },
  { key: "hidden_reviews", label: "Hidden reviews" },
  { key: "open_review_reports", label: "Open review reports" },
  { key: "community_media", label: "Community media" },
];

export default function KaravaliAdminDashboard() {
  const [token, setToken] = useState("");
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  async function loadDashboard(adminToken = token) {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const headers = { "X-Admin-Token": adminToken };
      const [overviewResponse, contributionResponse, reportResponse] =
        await Promise.all([
          fetch(`${API}/api/karavali/admin/overview`, { headers, cache: "no-store" }),
          fetch(`${API}/api/karavali/admin/contributions`, { headers, cache: "no-store" }),
          fetch(`${API}/api/karavali/admin/review-reports`, { headers, cache: "no-store" }),
        ]);
      const [overviewData, contributionData, reportData] = await Promise.all([
        overviewResponse.json() as Promise<{ counts: Counts } & ApiError>,
        contributionResponse.json() as Promise<
          { contributions: Contribution[] } & ApiError
        >,
        reportResponse.json() as Promise<{ reports: ReviewReport[] } & ApiError>,
      ]);
      if (!overviewResponse.ok) {
        throw new Error(overviewData.detail || "Could not load the Karavali overview.");
      }
      if (!contributionResponse.ok) {
        throw new Error(
          contributionData.detail || "Could not load community contributions.",
        );
      }
      if (!reportResponse.ok) {
        throw new Error(reportData.detail || "Could not load review reports.");
      }
      setCounts(overviewData.counts);
      setContributions(contributionData.contributions);
      setReports(reportData.reports);
      setAuthenticated(true);
    } catch (loadError) {
      setAuthenticated(false);
      setCounts(null);
      setContributions([]);
      setReports([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load the moderation dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleTokenSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadDashboard();
  }

  async function moderate(url: string, method: "POST" | "DELETE") {
    setError("");
    setMessage("");
    try {
      const response = await fetch(`${API}${url}`, {
        method,
        headers: { "X-Admin-Token": token },
      });
      const data = (await response.json()) as ApiError;
      if (!response.ok) {
        throw new Error(data.detail || data.message || "Moderation action failed.");
      }
      await loadDashboard();
      setMessage(data.message || "Moderation action completed.");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Moderation action failed.",
      );
    }
  }

  return (
    <div className="karavali-admin-dashboard">
      <header className="karavali-admin-header">
        <p className="district-explorer-kicker">SARVAM / KARAVALI CONTROL CENTRE</p>
        <h1>Coastal heritage, carefully stewarded</h1>
        <p>
          Manage source-backed district, place, section, and timeline records;
          review community submissions and reports.
        </p>
      </header>

      <form className="karavali-admin-token-form" onSubmit={handleTokenSubmit}>
        <label>
          Server-configured admin token
          <input
            type="password"
            autoComplete="current-password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Opening control centre…" : authenticated ? "Refresh records" : "Unlock control centre"}
        </button>
      </form>

      {error && <p className="karavali-inline-error" role="alert">{error}</p>}
      {message && <p className="karavali-inline-status" role="status">{message}</p>}

      {authenticated && (
        <>
          <nav className="karavali-admin-nav" aria-label="Control centre sections">
            {([
              ["overview", "Overview"],
              ["content", "Content editors"],
              ["moderation", "Community moderation"],
            ] as const).map(([id, label]) => (
              <button
                type="button"
                key={id}
                className={activeTab === id ? "is-active" : ""}
                aria-pressed={activeTab === id}
                onClick={() => setActiveTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          {activeTab === "overview" && counts && (
            <section className="karavali-admin-overview" aria-labelledby="admin-overview-title">
              <div className="karavali-admin-overview-heading">
                <div>
                  <p className="district-explorer-kicker">LIVE RECORD COUNTS</p>
                  <h2 id="admin-overview-title">The atlas at a glance</h2>
                </div>
                <p>Counts are read from the current Karavali data files and community database.</p>
              </div>
              <dl className="karavali-admin-stat-grid">
                {countCards.map((card) => (
                  <div key={card.key}>
                    <dt>{card.label}</dt>
                    <dd>{counts[card.key]}</dd>
                  </div>
                ))}
              </dl>
              <div className="karavali-admin-overview-note">
                <strong>Editorial principle</strong>
                <p>
                  Keep lived traditions, oral accounts, and dated historical
                  claims distinct. Add source links to every new historical
                  record before publishing it.
                </p>
              </div>
            </section>
          )}

          {activeTab === "content" && (
            <KaravaliAdminContentManager
              token={token}
              onChange={() => void loadDashboard()}
            />
          )}

          {activeTab === "moderation" && (
            <div className="karavali-admin-moderation">
              <section>
                <header className="karavali-admin-section-heading">
                  <div>
                    <p className="district-explorer-kicker">COMMUNITY KNOWLEDGE</p>
                    <h2>Contribution queue</h2>
                  </div>
                  <span>{contributions.length} records</span>
                </header>
                {contributions.length === 0 && !loading && (
                  <p>No community contributions are waiting for review.</p>
                )}
                <ul className="karavali-admin-list">
                  {contributions.map((item) => (
                    <li className="karavali-admin-item" key={item.id}>
                      <span className="karavali-place-meta">
                        {item.status} · {item.district} · {item.category} · {item.location}
                      </span>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <p>Submitted by {item.contributor}</p>
                      {item.photograph && (
                        <img src={`${API}${item.photograph}`} alt={`Submission: ${item.title}`} />
                      )}
                      <div className="karavali-review-actions">
                        {item.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              void moderate(
                                `/api/karavali/admin/contributions/${item.id}/approve`,
                                "POST",
                              )
                            }
                          >
                            Approve
                          </button>
                        )}
                        <button
                          type="button"
                          className="karavali-admin-delete"
                          onClick={() =>
                            void moderate(
                              `/api/karavali/admin/contributions/${item.id}`,
                              "DELETE",
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <header className="karavali-admin-section-heading">
                  <div>
                    <p className="district-explorer-kicker">REVIEW REPORTS</p>
                    <h2>Visitor reports</h2>
                  </div>
                  <span>{reports.length} open</span>
                </header>
                {reports.length === 0 && !loading && (
                  <p>No reported reviews are waiting for review.</p>
                )}
                <ul className="karavali-admin-list">
                  {reports.map((report) => (
                    <li className="karavali-admin-item" key={report.id}>
                      <span className="karavali-place-meta">
                        {report.place_id} · Review #{report.review_id} ·{" "}
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      <h3>Reported by a community member</h3>
                      <p>{report.reason}</p>
                      <blockquote>{report.review}</blockquote>
                      <p>Review author: {report.contributor}</p>
                      <div className="karavali-review-actions">
                        <button
                          type="button"
                          onClick={() =>
                            void moderate(
                              `/api/karavali/admin/reviews/${report.review_id}/hide`,
                              "POST",
                            )
                          }
                        >
                          Hide reported review
                        </button>
                        <button
                          type="button"
                          className="karavali-admin-delete"
                          onClick={() =>
                            void moderate(
                              `/api/karavali/admin/review-reports/${report.id}`,
                              "DELETE",
                            )
                          }
                        >
                          Dismiss report
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
