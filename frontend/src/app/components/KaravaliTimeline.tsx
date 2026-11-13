"use client";

import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

type TimelineEntry = {
  id: string;
  district_id: string;
  district_name: string;
  place_id: string | null;
  place_name: string | null;
  period: string;
  title: string;
  description: string;
  details: string;
  sources: { title: string; url: string }[];
};

const districts = [
  { id: "dakshina-kannada", name: "Dakshina Kannada" },
  { id: "udupi", name: "Udupi" },
  { id: "uttara-kannada", name: "Uttara Kannada" },
];

export default function KaravaliTimeline() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [district, setDistrict] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTimeline() {
      try {
        const response = await fetch(`${API}/api/karavali/timelines`);
        if (!response.ok) throw new Error("Could not load the timeline.");
        const data = (await response.json()) as {
          timelines: TimelineEntry[];
        };
        if (active) {
          setEntries(data.timelines);
          setSelectedId((current) => current || data.timelines[0]?.id || "");
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the timeline.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTimeline();
    return () => {
      active = false;
    };
  }, []);

  const visibleEntries = entries.filter(
    (entry) => !district || entry.district_id === district,
  );
  const selectedEntry =
    visibleEntries.find((entry) => entry.id === selectedId) ??
    visibleEntries[0];
  const selectedIndex = selectedEntry
    ? visibleEntries.findIndex((entry) => entry.id === selectedEntry.id)
    : -1;

  return (
    <section className="karavali-timeline" aria-labelledby="karavali-timeline-title">
      <div className="karavali-timeline-heading">
        <div>
          <p className="district-explorer-kicker">A LIVING CHRONOLOGY</p>
          <h2 id="karavali-timeline-title">Time along the coast</h2>
          <p>
            Dates are used only where the cited source supports them. Traditions
            and uncertain chronologies are identified as such.
          </p>
        </div>
        <label>
          Filter by district
          <select
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
          >
            <option value="">All districts</option>
            {districts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p role="status">Loading timeline…</p>}
      {!loading && error && <p role="alert">{error}</p>}
      {!loading && !error && visibleEntries.length === 0 && (
        <p className="region-no-results" role="status">
          No timeline entries are available for this district yet.
        </p>
      )}
      {!loading && !error && selectedEntry && (
        <div className="karavali-timeline-stage">
          <ol className="karavali-timeline-track" aria-label="Select a timeline event">
            {visibleEntries.map((entry, index) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className={entry.id === selectedEntry.id ? "is-selected" : ""}
                  aria-pressed={entry.id === selectedEntry.id}
                  onClick={() => setSelectedId(entry.id)}
                >
                  <span className="karavali-timeline-marker" aria-hidden="true" />
                  <span className="karavali-timeline-period">{entry.period}</span>
                  <span className="karavali-timeline-track-title">{entry.title}</span>
                  <span className="karavali-timeline-step">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <article className="karavali-timeline-feature" aria-live="polite">
            <div className="karavali-timeline-feature-meta">
              <span>{selectedEntry.district_name}</span>
              <span>{selectedEntry.place_name ?? "Regional history"}</span>
            </div>
            <p className="karavali-timeline-period">{selectedEntry.period}</p>
            <h3>{selectedEntry.title}</h3>
            <p>{selectedEntry.description}</p>
            <details>
              <summary>Context, interpretation &amp; sources</summary>
              <div className="karavali-timeline-details">
                <p>{selectedEntry.details}</p>
                {selectedEntry.sources.length > 0 && (
                  <ul>
                    {selectedEntry.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
            <div className="karavali-timeline-controls" aria-label="Timeline navigation">
              <button
                type="button"
                onClick={() => setSelectedId(visibleEntries[selectedIndex - 1].id)}
                disabled={selectedIndex <= 0}
                aria-label="Previous timeline event"
              >
                ← Earlier
              </button>
              <span>{selectedIndex + 1} / {visibleEntries.length}</span>
              <button
                type="button"
                onClick={() => setSelectedId(visibleEntries[selectedIndex + 1].id)}
                disabled={selectedIndex < 0 || selectedIndex === visibleEntries.length - 1}
                aria-label="Next timeline event"
              >
                Later →
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
