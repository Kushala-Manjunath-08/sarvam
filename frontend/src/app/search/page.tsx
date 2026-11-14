<<<<<<< HEAD
"use client";

<<<<<<< HEAD
=======
>>>>>>> 2862455 (Save latest karavaliRegion changes before merging main)
=======
import { useEffect, useRef, useState } from "react";
>>>>>>> origin/main
import Link from "next/link";
import DistrictIllustration from "../components/DistrictIllustration";
import {
  districts,
  type District,
} from "../districts";
import { karnatakaRegions } from "../regions";

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
  const [selectedRegion, setSelectedRegion] = useState<
    (typeof karnatakaRegions)[number] | null
  >(null);
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

    if (selectedRegion || selectedDistrict) {
      if (!dialog?.open) {
        dialog?.showModal();
      }
    } else if (dialog?.open) {
      dialog.close();
    }
  }, [selectedRegion, selectedDistrict]);

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
    setSelectedRegion(null);
    setSelectedDistrict(null);
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRegions = karnatakaRegions.filter((region) => {
    const searchableText = [region.name, region.subtitle, ...region.districts]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  const selectedRegionDistricts = selectedRegion
    ? districts.filter((district) =>
        selectedRegion.districts.includes(district.name)
      )
    : [];
  const selectedDistrictIndex = selectedDistrict
    ? districts.indexOf(selectedDistrict)
    : selectedRegion
      ? districts.indexOf(selectedRegionDistricts[0])
      : 0;

  return (
    <main className="landing-page district-page-active">
      <section className="district-explorer" aria-labelledby="district-heading">
        <header className="district-explorer-header">
<<<<<<< HEAD
          <p className="district-explorer-kicker">
            LEGACYOS / REGIONAL ATLAS
          </p>
<<<<<<< HEAD
=======
          <p className="district-explorer-kicker">LEGACYOS / REGIONAL ATLAS</p>
>>>>>>> 2862455 (Save latest karavaliRegion changes before merging main)
          <h1 id="district-heading">Karnataka Regional Search</h1>
=======

          <h1 id="district-heading">
            Find a story across Karnataka.
          </h1>

          <p className="district-explorer-intro">
            Explore Karnataka through four cultural regions.
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
              placeholder="Search a region or district"
              aria-label="Search regions and districts"
            />
          </label>
>>>>>>> origin/main
          <p className="district-explorer-description">
            Choose a region to explore its stories and heritage.
          </p>
        </header>

<<<<<<< HEAD
<<<<<<< HEAD
        {/* Four Regional Cards ONLY */}
=======
>>>>>>> origin/main
        <div className="region-cards-grid">
          {filteredRegions.map((region) => {
            return (
              <Link
                key={region.id}
                href={`/regions/${region.slug}`}
                className="region-card"
                aria-label={`Explore ${region.name}: ${region.subtitle}`}
              >
                <div className="region-card-top">
                  <div className="region-card-title-group">
                    <span className="region-card-subtitle">
                      {region.subtitle}
                    </span>
<<<<<<< HEAD
=======
        <div className="region-cards-grid">
          {karnatakaRegions.map((region) => (
            <Link
              key={region.id}
              href={`/regions/${region.slug}`}
              className="region-card"
              aria-label={`Explore ${region.name}: ${region.subtitle}`}
            >
              <div>
                <div className="region-card-top">
                  <div className="region-card-title-group">
                    <span className="region-card-subtitle">{region.subtitle}</span>
                    <h2 className="region-card-name">{region.name}</h2>
>>>>>>> 2862455 (Save latest karavaliRegion changes before merging main)
=======
                    <h2 className="region-card-name">{region.name}</h2>
>>>>>>> origin/main
                  </div>
                  <span className="region-card-count">
                    {region.districts.length} districts
                  </span>
                </div>
              </div>

<<<<<<< HEAD
                <div className="region-card-footer">
                  <span>Explore region</span>
                  <span className="region-card-arrow" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
=======
              <div className="region-card-footer">
                <span>Explore region districts</span>
                <span className="region-card-arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </Link>
          ))}
>>>>>>> 2862455 (Save latest karavaliRegion changes before merging main)
        </div>

        {filteredRegions.length === 0 && (
          <p className="no-district-results" role="status">
            No regions match that search. Try another place or tradition.
          </p>
        )}

        <dialog
          ref={detailDialogRef}
          className="district-dialog"
          aria-labelledby="district-dialog-title"
          onClose={() => {
            setSelectedDistrict(null);
            setSelectedRegion(null);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeDistrict();
            }
          }}
        >
          {(selectedRegion || selectedDistrict) && (
            <div className="district-dialog-content">
              <div className="district-dialog-image">
                <DistrictIllustration
                  district={
                    selectedDistrict ??
                    selectedRegionDistricts[0]
                  }
                  index={selectedDistrictIndex}
                />
              </div>

              <div
                className={`district-dialog-copy${selectedDistrict ? "" : " district-region-picker"}`}
              >
                <button
                  className="district-dialog-close"
                  type="button"
                  onClick={closeDistrict}
                  aria-label="Close district details"
                >
                  ×
                </button>

                <p className="district-explorer-kicker">
                  {selectedDistrict?.region ?? selectedRegion?.name}
                </p>

                <h2 id="district-dialog-title">
                  {selectedDistrict?.name ?? selectedRegion?.name}
                </h2>

                {selectedDistrict ? (
                  <>
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
                      onClick={() => setSelectedDistrict(null)}
                    >
                      Back to districts
                    </button>
                  </>
                ) : (
                  <>
                    <p>{selectedRegion?.subtitle}</p>
                    <ul className="district-picker-list">
                      {selectedRegionDistricts.map((district) => (
                        <li key={district.name}>
                          <button
                            type="button"
                            onClick={() => {
                              if (district.name === "Bagalkot") {
                                window.location.href = "/districts/bagalkot";
                                return;
                              }

                              setSelectedDistrict(district);
                            }}
                          >
                            <span>{district.name}</span>
                            <span>{district.tradition}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="district-dialog-chat"
                      type="button"
                      onClick={closeDistrict}
                    >
                      Back to regions
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </dialog>
      </section>
    </main>
  );
}
