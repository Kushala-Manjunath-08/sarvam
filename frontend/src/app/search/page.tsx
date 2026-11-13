
"use client";

import { useEffect, useRef, useState } from "react";
import DistrictIllustration from "../components/DistrictIllustration";
import { districts, type District } from "../districts";

interface HeritageRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  period: string;
  language: string[];
  source: {
    name: string;
    url: string;
    type: string;
    additional_source?: string;
  };
  verification_status: string;
}

interface MediaReference {
  id: string;
  title: string;
  media_type: string;
  subject: string;
  location: string;
  catalogue_url: string;
  inventory_url: string;
  rights_status: string;
  availability: string;
}

interface DistrictData {
  district: {
    id: string;
    name: string;
    state: string;
    primary_language: string;
    collection_status: string;
  };
  records: HeritageRecord[];
  media_references: MediaReference[];
  future_research: string[];
}

export default function DistrictSearchPage() {
  const [query, setQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] =
    useState<District | null>(null);

  const [districtData, setDistrictData] =
    useState<DistrictData | null>(null);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const detailDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const dialog = detailDialogRef.current;

    if (selectedDistrict) {
      if (!dialog?.open) {
        dialog?.showModal();
      }
    } else if (dialog?.open) {
      dialog.close();
    }
  }, [selectedDistrict]);

  // Fetch Bagalkot data when needed
  useEffect(() => {
    if (selectedDistrict?.name !== "Bagalkot") {
      setDistrictData(null);
      setApiError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchBagalkot() {
      setLoading(true);
      setApiError("");
      setDistrictData(null);

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/districts/bagalkot",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load Bagalkot information.");
        }

        const result: DistrictData = await response.json();
        setDistrictData(result);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setApiError(
          "Could not connect to the LEGACYOS backend. Please check whether the backend is running."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchBagalkot();

    return () => controller.abort();
  }, [selectedDistrict]);

  function closeDistrict() {
    detailDialogRef.current?.close();
    setSelectedDistrict(null);
  }

  const filteredDistricts = districts.filter((district) =>
    `${district.name} ${district.region} ${district.tradition}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  const selectedDistrictIndex = selectedDistrict
    ? districts.indexOf(selectedDistrict)
    : 0;

  return (
    <main className="landing-page district-page-active">
      <section
        className="district-explorer"
        aria-labelledby="district-heading"
      >
        <header className="district-explorer-header">
          <p className="district-explorer-kicker">
            LEGACYOS / FIELD NOTES
          </p>

          <h1 id="district-heading">
            Find a story in every district.
          </h1>

          <p className="district-explorer-intro">
            Explore Karnataka through the customs, craft and heritage
            that make each place its own.
          </p>

          <label className="district-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>

            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a district or tradition"
              aria-label="Search districts and traditions"
            />
          </label>
        </header>

        <div className="district-grid">
          {filteredDistricts.map((district) => {
            const index = districts.indexOf(district);

            return (
              <button
                className="district-card"
                type="button"
                key={district.name}
                onClick={() => {
                  if (district.name.toLowerCase() === "bagalkot") {
                    window.location.href = "/districts/bagalkot";
                    return;
                  }

                  setSelectedDistrict(district);
                }}
                aria-label={`Explore ${district.name}: ${district.tradition}`}
              >
                <DistrictIllustration
                  district={district}
                  index={index}
                />

                <span className="district-card-shade" />

                <span className="district-card-content">
                  <span className="district-card-region">
                    {district.region}
                  </span>

                  <span className="district-card-name">
                    {district.name}
                  </span>

                  <span className="district-card-tradition">
                    {district.tradition}
                  </span>

                  <span className="district-card-link">
                    Discover the story →
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {filteredDistricts.length === 0 && (
          <p className="no-district-results" role="status">
            No districts match that search. Try another place or tradition.
          </p>
        )}

        <dialog
          ref={detailDialogRef}
          className="district-dialog"
          aria-labelledby="district-dialog-title"
          onClose={() => setSelectedDistrict(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeDistrict();
            }
          }}
        >
          {selectedDistrict && (
            <div className="district-dialog-content">
              <div className="district-dialog-image">
                <DistrictIllustration
                  district={selectedDistrict}
                  index={selectedDistrictIndex}
                />
              </div>

              <div className="district-dialog-copy">
                <button
                  className="district-dialog-close"
                  type="button"
                  onClick={closeDistrict}
                  aria-label="Close district details"
                >
                  ×
                </button>

                <p className="district-explorer-kicker">
                  {selectedDistrict.region}
                </p>

                <h2 id="district-dialog-title">
                  {selectedDistrict.name}
                </h2>

                <p>{selectedDistrict.tradition}</p>

                <p>
                  Detailed heritage records for this district will be
                  added to the LEGACYOS collection.
                </p>

                {loading && (
                  <p>Loading district information...</p>
                )}

                {apiError && (
                  <p role="alert">{apiError}</p>
                )}

                {districtData && (
                  <section>
                    <h3>Heritage Collection</h3>

                    <p>
                      {districtData.records.length} heritage records
                      {" · "}
                      {districtData.media_references.length} media references
                    </p>

                    {districtData.records.map((record) => (
                      <article key={record.id}>
                        <h4>{record.title}</h4>
                        <p>{record.description}</p>
                        <p>Location: {record.location}</p>
                        <a
                          href={record.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {record.source.name}
                        </a>
                      </article>
                    ))}
                  </section>
                )}

                <button
                  className="district-dialog-chat"
                  type="button"
                  onClick={closeDistrict}
                >
                  Back to districts
                </button>
              </div>
            </div>
          )}
        </dialog>
      </section>
    </main>
  );
}
