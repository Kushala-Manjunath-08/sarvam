"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  sharedRegionCategories,
  type ImageAttribution,
  type RegionPageContent,
  type RegionCategoryItem,
} from "../region-content";
import type { RegionDetail } from "../regions";
import RegionalCommunityGallery from "./RegionalCommunityGallery";
import RegionalDistrictExplorer from "./RegionalDistrictExplorer";

type RegionInformationProps = {
  region: RegionDetail;
  content: RegionPageContent;
};

const iconPaths: Record<"land" | "history" | "community" | "language" | "festival" | "performance" | "food" | "home" | "harvest" | "oral" | "craft" | "people", string> = {
  land: "M3 19 9 5l6 14 3-8 3 8M2 19h20",
  history: "M3 12a9 9 0 1 0 2.64-6.36L3 8m0-5v5h5m4-1v5l3 2",
  community: "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8m10 10v-2a4 4 0 0 0-3-3.87m-1-11.13a4 4 0 0 1 0 7.75",
  language: "M4 5h16M8 3v2m4 0c-.5 5-3 8-7 10m1-6c1 2 3 4 6 5m-1 5 5-11 5 11m-8-3h6",
  festival: "M12 3v18m-9-9h18M5.64 5.64l12.72 12.72m0-12.72L5.64 18.36",
  performance: "M4 5h16v12H4zM8 21h8m-4-4v4m-3-12 6 3-6 3z",
  food: "M6 3v7m4-7v7M8 10v11m8-18v18m0-18c3 2 4 6 0 9",
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm5 11v-7h8v7",
  harvest: "M12 21V10m0 5c-5 0-8-3-8-8 5 0 8 3 8 8zm0-3c0-5 3-8 8-8 0 5-3 8-8 8z",
  oral: "M4 5h16v12H8l-4 4zm4 4h8m-8 4h5",
  craft: "m14 6 4-4 4 4-4 4m-5-3 4 4-8 8H5v-4zM3 21h18",
  people: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m-7 9a7 7 0 0 1 14 0m-3-15a4 4 0 0 1 0 7m3 2a6 6 0 0 1 3 6",
};

const categoryTracks: {
  number: string;
  title: string;
  description: string;
  categoryIds: string[];
}[] = [
  {
    number: "01",
    title: "Place, past & people",
    description: "Start with the landscapes, histories and communities that shape the region.",
    categoryIds: ["geography", "history", "communities"],
  },
  {
    number: "02",
    title: "Voice, celebration & art",
    description: "Explore how language, festivals and performance carry identity forward.",
    categoryIds: ["languages", "festivals", "performing-arts"],
  },
  {
    number: "03",
    title: "Everyday heritage",
    description: "Discover the foodways, homes and farming practices of daily life.",
    categoryIds: ["food", "architecture", "agriculture"],
  },
  {
    number: "04",
    title: "Memory, skills & legacy",
    description: "Follow stories, traditional knowledge and contributions across generations.",
    categoryIds: ["oral-history", "knowledge", "personalities"],
  },
];
const groupedCategoryIds = new Set(
  categoryTracks.flatMap((track) => track.categoryIds),
);

function CategoryIcon({ name }: { name: string }) {
  const iconPath =
    Object.entries(iconPaths).find(([key]) => key === name)?.[1] ??
    iconPaths.land;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPath} />
    </svg>
  );
}

function PhotoCredit({
  attribution,
  caption = false,
}: {
  attribution: ImageAttribution;
  caption?: boolean;
}) {
  return (
    <span
      className={`region-photo-credit${caption ? " region-photo-credit-caption" : ""}`}
    >
      Image by{" "}
      <a href={attribution.sourceUrl} rel="noreferrer" target="_blank">
        {attribution.author}
      </a>
      {" · "}
      <a href={attribution.licenseUrl} rel="noreferrer" target="_blank">
        {attribution.license}
      </a>
    </span>
  );
}

export default function RegionInformation({
  region,
  content,
}: RegionInformationProps) {
  const [query, setQuery] = useState("");
  const [contentLanguage, setContentLanguage] = useState("en");
  const [selectedCategory, setSelectedCategory] =
    useState<RegionCategoryItem | null>(null);
  const [exploredCategoryIds, setExploredCategoryIds] = useState<Set<string>>(
    new Set(),
  );
  const categoryDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setExploredCategoryIds(new Set());
    setSelectedCategory(null);
  }, [region.id]);

  const selectedCategoryDetails = selectedCategory
    ? content.categories[selectedCategory.id]
    : undefined;

  useEffect(() => {
    const dialog = categoryDialogRef.current;
    if (!dialog) return;
    if (selectedCategory && !dialog.open) dialog.showModal();
    else if (!selectedCategory && dialog.open) dialog.close();
  }, [selectedCategory]);

  const categoryItems = sharedRegionCategories;
  const availableCategories = useMemo(
    () => categoryItems.filter((item) => Boolean(content.categories[item.id])),
    [categoryItems, content.categories],
  );
  const learningPathCount =
    categoryTracks.length +
    (availableCategories.some((item) => !groupedCategoryIds.has(item.id)) ? 1 : 0);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleCategories = useMemo(
    () =>
      availableCategories.filter((item) => {
        const details = content.categories[item.id];
        if (!details) return false;
        const searchableText = [
          item.title,
          details.overview,
          ...details.details,
          ...details.highlights,
          details.verificationNote ?? "",
        ]
          .join(" ")
          .toLocaleLowerCase();
        return searchableText.includes(normalizedQuery);
      }),
    [availableCategories, content.categories, normalizedQuery],
  );
  const visibleTracks = useMemo(
    () => {
      const tracks = categoryTracks
        .map((track) => ({
          ...track,
          categories: visibleCategories.filter((item) =>
            track.categoryIds.includes(item.id),
          ),
        }))
        .filter((track) => track.categories.length > 0);
      const additionalCategories = visibleCategories.filter(
        (item) => !groupedCategoryIds.has(item.id),
      );
      if (additionalCategories.length > 0) {
        tracks.push({
          number: String(categoryTracks.length + 1).padStart(2, "0"),
          title: "More regional knowledge",
          description: "Additional topics added to the growing regional guide.",
          categoryIds: [],
          categories: additionalCategories,
        });
      }
      return tracks;
    },
    [visibleCategories],
  );
  const exploredCount = Math.min(
    exploredCategoryIds.size,
    availableCategories.length,
  );
  const exploredPercent = availableCategories.length
    ? Math.round((exploredCount / availableCategories.length) * 100)
    : 0;
  const selectedCategoryIndex = selectedCategory
    ? availableCategories.findIndex((item) => item.id === selectedCategory.id)
    : -1;

  function openCategory(item: RegionCategoryItem) {
    setExploredCategoryIds((current) => new Set(current).add(item.id));
    setSelectedCategory(item);
  }

  function moveToAdjacentCategory(direction: -1 | 1) {
    const nextCategory = availableCategories[selectedCategoryIndex + direction];
    if (nextCategory) openCategory(nextCategory);
  }

  return (
    <main className="landing-page district-page-active">
      <section className="region-knowledge" aria-labelledby="region-heading">
        <div className="region-knowledge-inner">
          <Link className="region-back-link" href="/search">
            <span aria-hidden="true">←</span> Back to all divisions
          </Link>

          <header className="region-hero">
            <div className="region-hero-copy">
              <p className="district-explorer-kicker">LEGACYOS / REGIONAL ATLAS</p>
              <h1 id="region-heading">{region.name}</h1>
              <p className="region-hero-subtitle">{region.subtitle}</p>
              <p className="region-hero-introduction">{content.introduction}</p>
              <div className="region-hero-actions">
                <a className="region-hero-primary" href="#regional-field-guide">
                  Explore the field guide
                  <span>{availableCategories.length} topics ↓</span>
                </a>
                <a className="region-hero-secondary" href="#regional-contributions">
                  Share a regional story <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className="region-districts">
                <h2>Districts in this division</h2>
                <ul>
                  {region.districts.map((district) => (
                    <li key={district}>{district}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="region-hero-art">
              <Image
                src={content.heroImage}
                alt={content.heroImageAlt}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 48vw"
              />
              {content.heroImageAttribution ? (
                <span className="region-image-caption">
                  A living landscape
                  <PhotoCredit
                    attribution={content.heroImageAttribution}
                    caption
                  />
                </span>
              ) : (
                <span className="region-image-caption">A living landscape</span>
              )}
            </div>
          </header>

          <div className="region-guide-stats" aria-label="Guide at a glance">
            <div>
              <span>Districts</span>
              <strong>{region.districts.length}</strong>
            </div>
            <div>
              <span>Learning topics</span>
              <strong>{availableCategories.length}</strong>
            </div>
            <div>
              <span>Learning paths</span>
              <strong>{learningPathCount}</strong>
            </div>
          </div>

          <RegionalDistrictExplorer
            districtNames={region.districts}
            regionName={region.name}
          />

          <section
            aria-labelledby="region-guide-title"
            className="region-field-guide"
            id="regional-field-guide"
          >
            <div className="region-field-guide-heading">
              <div>
                <p className="district-explorer-kicker">THE REGIONAL FIELD GUIDE</p>
                <h2 id="region-guide-title">A place is more than a map.</h2>
                <p>
                  Follow four learning paths through {region.name.toLocaleLowerCase()}.
                  Open a topic for its stories, key ideas and references.
                </p>
              </div>
              <div className="region-learning-progress">
                <div className="region-learning-progress-label">
                  <span>Topics explored</span>
                  <strong>
                    {exploredCount} <span>of {availableCategories.length}</span>
                  </strong>
                </div>
                <div
                  aria-label="Regional topic exploration progress"
                  aria-valuemax={availableCategories.length}
                  aria-valuemin={0}
                  aria-valuenow={exploredCount}
                  className="region-learning-progress-track"
                  role="progressbar"
                >
                  <span style={{ width: `${exploredPercent}%` }} />
                </div>
                <button
                  className="region-learning-start"
                  disabled={availableCategories.length === 0}
                  onClick={() => {
                    const nextCategory =
                      availableCategories.find(
                        (item) => !exploredCategoryIds.has(item.id),
                      ) ?? availableCategories[0];
                    if (nextCategory) openCategory(nextCategory);
                  }}
                  type="button"
                >
                  {exploredCount < availableCategories.length
                    ? exploredCount
                      ? "Continue learning"
                      : "Start the learning path"
                    : "Review the first topic"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>

            <div className="region-content-heading">
              <div>
                <p className="district-explorer-kicker">EXPLORE BY TOPIC</p>
                <h2>Stories held by this place</h2>
                <p>Search all topics or choose a chapter to explore in depth.</p>
                <label className="region-language-select">
                  Content language
                  <select
                    onChange={(event) => setContentLanguage(event.target.value)}
                    value={contentLanguage}
                  >
                    <option value="en">English</option>
                    <option value="kn">Kannada (translation under review)</option>
                  </select>
                </label>
                {contentLanguage === "kn" && (
                  <p className="region-language-note" role="status">
                    Kannada content is not yet available. Showing the English
                    source text until a community-reviewed translation is ready.
                  </p>
                )}
              </div>
              <label className="region-search">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 5 5" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search this region"
                  aria-label={`Search ${region.name} information`}
                />
              </label>
            </div>

            <nav
              className="region-category-nav"
              aria-label="Regional information categories"
            >
              {visibleCategories.map((item) => (
                <a key={item.id} href={`#${item.id}`}>
                  {item.title}
                </a>
              ))}
            </nav>
            {visibleCategories.length > 0 ? (
              <div className="region-learning-tracks">
                {visibleTracks.map((track) => (
                  <section
                    aria-labelledby={`region-track-${track.number}`}
                    className="region-learning-track"
                    key={track.number}
                  >
                    <header className="region-learning-track-heading">
                      <span className="region-learning-track-number">
                        {track.number}
                      </span>
                      <div>
                        <h3 id={`region-track-${track.number}`}>{track.title}</h3>
                        <p>{track.description}</p>
                      </div>
                      <span className="region-learning-track-count">
                        {track.categories.length} {track.categories.length === 1 ? "topic" : "topics"}
                      </span>
                    </header>
                    <div className="region-category-grid">
                      {track.categories.map((item) => {
                      const details = content.categories[item.id];
                      if (!details) return null;
                      const index = categoryItems.findIndex(
                        (categoryItem) => categoryItem.id === item.id,
                      );
                      return (
                        <article
                          className={`region-category-card${exploredCategoryIds.has(item.id) ? " is-explored" : ""}`}
                          id={item.id}
                          key={item.id}
                        >
                          <div className="region-category-image">
                            <Image
                              src={details.image ?? item.image}
                              alt={details.imageAlt ?? ""}
                              fill
                              sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 33vw"
                            />
                            <span className="region-category-number">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            {exploredCategoryIds.has(item.id) && (
                              <span className="region-explored-badge">
                                Explored
                              </span>
                            )}
                            {details.imageAttribution && (
                              <PhotoCredit
                                attribution={details.imageAttribution}
                              />
                            )}
                          </div>
                          <div className="region-category-copy">
                            <div className="region-category-title">
                              <span className="region-category-icon">
                                <CategoryIcon name={item.icon} />
                              </span>
                              <h3>{item.title}</h3>
                            </div>
                            <p className="region-category-overview">
                              {details.overview}
                            </p>
                            <button
                              className="region-read-more"
                              onClick={() => openCategory(item)}
                              type="button"
                            >
                              Open topic <span aria-hidden="true">↗</span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <p className="region-no-results" role="status">
              No categories match “{query}”. Try another word or phrase.
            </p>
          )}
          </section>

          <dialog
            aria-labelledby="region-story-dialog-title"
            className="region-story-dialog"
            onCancel={(event) => {
              event.preventDefault();
              setSelectedCategory(null);
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedCategory(null);
              }
            }}
            onClose={() => setSelectedCategory(null)}
            ref={categoryDialogRef}
          >
            {selectedCategory && selectedCategoryDetails && (
              <article className="region-story-dialog-content">
                <button
                  aria-label="Close regional story"
                  className="region-story-dialog-close"
                  onClick={() => setSelectedCategory(null)}
                  type="button"
                >
                  ×
                </button>
                <div className="region-story-dialog-image">
                  <Image
                    alt={selectedCategoryDetails.imageAlt ?? ""}
                    fill
                    sizes="(max-width: 700px) 100vw, 680px"
                    src={selectedCategoryDetails.image ?? selectedCategory.image}
                  />
                  {selectedCategoryDetails.imageAttribution && (
                    <PhotoCredit
                      attribution={selectedCategoryDetails.imageAttribution}
                    />
                  )}
                </div>
                <div className="region-story-dialog-copy">
                  <p className="district-explorer-kicker">{region.name}</p>
                  <h2 id="region-story-dialog-title">{selectedCategory.title}</h2>
                  <p className="region-story-dialog-overview">
                    {selectedCategoryDetails.overview}
                  </p>
                  {selectedCategoryDetails.details.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  <h3>In focus</h3>
                  <ul>
                    {selectedCategoryDetails.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                  {selectedCategoryDetails.verificationNote && (
                    <p className="region-verification-note">
                      <strong>Context note:</strong>{" "}
                      {selectedCategoryDetails.verificationNote}
                    </p>
                  )}
                  {selectedCategoryDetails.sources &&
                    selectedCategoryDetails.sources.length > 0 && (
                      <div className="region-story-sources">
                        <h3>Further reading</h3>
                        {selectedCategoryDetails.sources.map((source) => (
                          <a
                            href={source.url}
                            key={source.url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {source.label} <span aria-hidden="true">↗</span>
                          </a>
                        ))}
                      </div>
                    )}
                </div>
                <footer className="region-story-navigation">
                  <button
                    disabled={selectedCategoryIndex <= 0}
                    onClick={() => moveToAdjacentCategory(-1)}
                    type="button"
                  >
                    <span aria-hidden="true">←</span> Previous topic
                  </button>
                  <span>
                    Topic {selectedCategoryIndex + 1} of {availableCategories.length}
                  </span>
                  <button
                    disabled={
                      selectedCategoryIndex < 0 ||
                      selectedCategoryIndex >= availableCategories.length - 1
                    }
                    onClick={() => moveToAdjacentCategory(1)}
                    type="button"
                  >
                    Next topic <span aria-hidden="true">→</span>
                  </button>
                </footer>
              </article>
            )}
          </dialog>

          <RegionalCommunityGallery
            districts={region.districts}
            regionId={region.id}
            regionName={region.name}
          />
        </div>
      </section>
    </main>
  );
}
