"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const API = "http://127.0.0.1:8000";
const districts = [
  { id: "uttara-kannada", name: "Uttara Kannada" },
  { id: "udupi", name: "Udupi" },
  { id: "dakshina-kannada", name: "Dakshina Kannada" },
] as const;

type Place = {
  id: string;
  name: string;
  district_id: string;
  district_name: string;
  category: string;
  summary: string;
};
type Contribution = {
  id: number;
  title: string;
  category: string;
  district: string;
  location: string;
  description: string;
  contributor: string;
  created_at: string;
};
type NetworkRecord = {
  id: string;
  title: string;
  category: string;
  districtId: string;
  districtName: string;
  description: string;
  kind: "place" | "community";
  href?: string;
  contributor?: string;
  date?: string;
};
type NetworkPosition = NetworkRecord & { x: number; y: number };

export default function KaravaliKnowledgeNetwork() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [district, setDistrict] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadNetwork() {
      try {
        const [placesResponse, contributionsResponse] = await Promise.all([
          fetch(`${API}/api/karavali/places`, { cache: "no-store" }),
          fetch(`${API}/api/karavali/contributions`, { cache: "no-store" }),
        ]);
        if (!placesResponse.ok || !contributionsResponse.ok) {
          throw new Error("Could not load the Karavali knowledge network.");
        }
        const [placeData, contributionData] = await Promise.all([
          placesResponse.json() as Promise<{ places: Place[] }>,
          contributionsResponse.json() as Promise<{
            contributions: Contribution[];
          }>,
        ]);
        if (active) {
          setPlaces(placeData.places);
          setContributions(contributionData.contributions);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the Karavali knowledge network.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadNetwork();
    return () => {
      active = false;
    };
  }, []);

  const records = useMemo<NetworkRecord[]>(
    () => [
      ...places.map((place) => ({
        id: `place-${place.id}`,
        title: place.name,
        category: place.category,
        districtId: place.district_id,
        districtName: place.district_name,
        description: place.summary,
        kind: "place" as const,
        href: `/regions/karavali/places/${place.id}`,
      })),
      ...contributions.map((contribution) => ({
        id: `community-${contribution.id}`,
        title: contribution.title,
        category: contribution.category,
        districtId: contribution.district,
        districtName:
          districts.find((item) => item.id === contribution.district)?.name ??
          contribution.district,
        description: contribution.description,
        kind: "community" as const,
        contributor: contribution.contributor,
        date: contribution.created_at,
      })),
    ],
    [contributions, places],
  );

  const visibleRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return records.filter((record) => {
      const matchesDistrict = !district || record.districtId === district;
      const searchText = `${record.title} ${record.category} ${record.districtName} ${record.description}`.toLocaleLowerCase();
      return matchesDistrict && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
  }, [district, query, records]);

  const positions = useMemo<NetworkPosition[]>(() => {
    const result: NetworkPosition[] = [];
    districts.forEach((item, districtIndex) => {
      const group = visibleRecords.filter((record) => record.districtId === item.id);
      group.forEach((record, index) => {
        const pair = index % 2;
        const row = Math.floor(index / 2);
        result.push({
          ...record,
          x: [16.5, 50, 83.5][districtIndex] + (pair === 0 ? -7.5 : 7.5),
          y: 170 + row * 96,
        });
      });
    });
    return result;
  }, [visibleRecords]);

  const graphHeight = Math.max(
    430,
    ...districts.map((item) => {
      const count = visibleRecords.filter((record) => record.districtId === item.id).length;
      return 250 + Math.ceil(count / 2) * 96;
    }),
  );
  const selectedRecord = visibleRecords.find((record) => record.id === selectedId);

  return (
    <section className="karavali-knowledge-network" aria-labelledby="karavali-network-title">
      <header className="karavali-network-heading">
        <div>
          <p className="district-explorer-kicker">A SHARED ATLAS</p>
          <h2 id="karavali-network-title">Knowledge travels by connection</h2>
          <p>
            Follow a place or community story back to its district and heritage
            category. Community stories appear here only after approval.
          </p>
        </div>
        <div className="karavali-network-filters">
          <label>
            Search connections
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Place, category, or story"
            />
          </label>
          <label>
            District
            <select value={district} onChange={(event) => setDistrict(event.target.value)}>
              <option value="">All districts</option>
              {districts.map((item) => (
                <option value={item.id} key={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {loading && <p role="status">Mapping published knowledge…</p>}
      {error && <p className="karavali-inline-error" role="alert">{error}</p>}
      {!loading && !error && (
        <>
          {visibleRecords.length === 0 ? (
            <p className="karavali-network-empty" role="status">
              No published records match this view.
            </p>
          ) : (
            <div className="karavali-network-scroll">
              <div
                className="karavali-network-canvas"
                style={{ height: `${graphHeight}px` }}
                aria-label="Interactive map of published places and community stories"
              >
                <svg
                  className="karavali-network-lines"
                  viewBox={`0 0 1000 ${graphHeight}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {positions.map((position) => {
                    const districtIndex = districts.findIndex(
                      (item) => item.id === position.districtId,
                    );
                    const startX = [165, 500, 835][districtIndex];
                    return (
                      <line
                        key={position.id}
                        x1={startX}
                        y1="105"
                        x2={position.x * 10}
                        y2={position.y + 38}
                        className={position.kind === "community" ? "community-edge" : ""}
                      />
                    );
                  })}
                </svg>
                {districts.map((item, index) => {
                  const districtCount = visibleRecords.filter(
                    (record) => record.districtId === item.id,
                  ).length;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`karavali-network-district district-${index}`}
                      style={{ left: `${[16.5, 50, 83.5][index]}%` }}
                      aria-label={`${item.name}: ${districtCount} published records`}
                      onClick={() => setDistrict(district === item.id ? "" : item.id)}
                    >
                      <span>{item.name}</span>
                      <small>{districtCount} records</small>
                    </button>
                  );
                })}
                {positions.map((position) => (
                  <button
                    type="button"
                    key={position.id}
                    className={`karavali-network-node ${position.kind} ${selectedId === position.id ? "is-selected" : ""}`}
                    style={{ left: `${position.x}%`, top: `${position.y}px` }}
                    onClick={() => setSelectedId(position.id)}
                    aria-pressed={selectedId === position.id}
                  >
                    <span>{position.kind === "place" ? "PLACE" : "COMMUNITY STORY"}</span>
                    <strong>{position.title}</strong>
                    <small>{position.category}</small>
                  </button>
                ))}
              </div>
            </div>
          )}
          {selectedRecord && (
            <article className="karavali-network-detail" aria-live="polite">
              <div>
                <p className="district-explorer-kicker">
                  {selectedRecord.districtName} / {selectedRecord.category}
                </p>
                <h3>{selectedRecord.title}</h3>
                <p>{selectedRecord.description}</p>
                {selectedRecord.contributor && (
                  <p className="karavali-network-contributor">
                    Shared by {selectedRecord.contributor}
                    {selectedRecord.date
                      ? ` · ${new Date(selectedRecord.date).toLocaleDateString()}`
                      : ""}
                  </p>
                )}
              </div>
              {selectedRecord.href && (
                <Link
                  className="region-category-read-more"
                  href={selectedRecord.href}
                >
                  Open place record <span aria-hidden="true">↗</span>
                </Link>
              )}
            </article>
          )}
        </>
      )}
    </section>
  );
}
