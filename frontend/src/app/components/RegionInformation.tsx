"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  regionCategories,
  type RegionPageContent,
  type RegionCategoryItem,
  type RegionCategoryContent,
} from "../region-content";
import type { RegionDetail } from "../regions";
import KaravaliDistrictExplorer from "./KaravaliDistrictExplorer";
import KaravaliCommunityGallery from "./KaravaliCommunityGallery";
import KaravaliContributions from "./KaravaliContributions";
import KaravaliKnowledgeNetwork from "./KaravaliKnowledgeNetwork";
import KaravaliPlaceExplorer from "./KaravaliPlaceExplorer";
import KaravaliPhotoCredit from "./KaravaliPhotoCredit";
import KaravaliTimeline from "./KaravaliTimeline";

const API = "http://127.0.0.1:8000";

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

export default function RegionInformation({
  region,
  content,
}: RegionInformationProps) {
  const [query, setQuery] = useState("");
  const [karavaliContent, setKaravaliContent] = useState(content);
  const [karavaliCategories, setKaravaliCategories] = useState<
    (RegionCategoryItem & RegionCategoryContent)[]
  >(() =>
    regionCategories.flatMap((item) => {
      const details = content.categories[item.id];
      return details
        ? [{ ...item, image: details.image ?? item.image, ...details }]
        : [];
    }),
  );
  const [categoryLoadError, setCategoryLoadError] = useState("");

  useEffect(() => {
    if (region.id !== "karavali") return;
    let active = true;

    async function loadKaravaliCategories() {
      try {
        const response = await fetch(`${API}/api/karavali/categories`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("The live Karavali heritage sections could not be loaded.");
        }
        const data = (await response.json()) as {
          introduction: string;
          categories: (RegionCategoryItem & RegionCategoryContent)[];
        };
        if (active) {
          setKaravaliCategories(data.categories);
          setKaravaliContent((current) => ({
            ...current,
            introduction: data.introduction,
            categories: Object.fromEntries(
              data.categories.map(({ id, ...details }) => [id, details]),
            ),
          }));
          setCategoryLoadError("");
        }
      } catch (loadError) {
        if (active) {
          setCategoryLoadError(
            loadError instanceof Error
              ? loadError.message
              : "The live Karavali heritage sections could not be loaded.",
          );
        }
      }
    }

    void loadKaravaliCategories();
    return () => {
      active = false;
    };
  }, [region.id]);

  const activeContent = region.id === "karavali" ? karavaliContent : content;
  const categoryItems =
    region.id === "karavali" ? karavaliCategories : regionCategories;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleCategories = useMemo(
    () =>
      categoryItems.filter((item) => {
        const details = activeContent.categories[item.id];
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
    [activeContent.categories, categoryItems, normalizedQuery],
  );

  return (
    <main className="landing-page district-page-active">
      <section className="region-knowledge" aria-labelledby="region-heading">
        <div className="region-knowledge-inner">
          <Link className="region-back-link" href="/search">
            <span aria-hidden="true">←</span> Back to all divisions
          </Link>

          <header className={`region-hero ${region.id === "karavali" ? "karavali-editorial-hero" : ""}`}>
            <div className="region-hero-copy">
              <p className="district-explorer-kicker">LEGACYOS / REGIONAL ATLAS</p>
              <h1 id="region-heading">{region.name}</h1>
              <p className="region-hero-subtitle">{region.subtitle}</p>
              <p className="region-hero-introduction">{activeContent.introduction}</p>
              {region.id === "karavali" ? (
                <KaravaliDistrictExplorer />
              ) : (
                <div className="region-districts">
                  <h2>Districts in this division</h2>
                  <ul>
                    {region.districts.map((district) => (
                      <li key={district}>{district}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="region-hero-art">
              <Image
                src={content.heroImage}
                alt={content.heroImageAlt}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 48vw"
              />
              <span className="region-image-caption">A living landscape</span>
              {region.id === "karavali" && (
                <KaravaliPhotoCredit image={content.heroImage} />
              )}
            </div>
          </header>

          {region.id === "karavali" && <KaravaliPlaceExplorer />}

          <div className="region-content-heading">
            <div>
              <p className="district-explorer-kicker">A FIELD GUIDE</p>
              <h2>Stories held by this place</h2>
              <p>Explore the landscapes, histories and practices that shape the region.</p>
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

          <nav className="region-category-nav" aria-label="Regional information categories">
            {visibleCategories.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.title}
              </a>
            ))}
          </nav>
          {region.id === "karavali" && categoryLoadError && (
            <p className="karavali-inline-error" role="alert">
              {categoryLoadError} The last available editorial copy remains visible.
            </p>
          )}

          {visibleCategories.length > 0 ? (
            <div className={`region-category-grid ${region.id === "karavali" ? "karavali-category-exhibition" : ""}`}>
              {visibleCategories.map((item, index) => {
                const details = activeContent.categories[item.id];
                if (!details) return null;
                const d = details;
                return (
                  <article
                    className={region.id === "karavali" ? "karavali-exhibition-section" : "region-category-card"}
                    id={item.id}
                    key={item.id}
                  >
                    <div className="region-category-image">
                      <Image
                        src={region.id === "karavali" ? d.image ?? item.image : item.image}
                        alt=""
                        fill
                        sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 33vw"
                      />
                      <span className="region-category-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    {region.id === "karavali" && (
                      <KaravaliPhotoCredit image={d.image ?? item.image} />
                    )}
                    <div className="region-category-copy">
                      <div className="region-category-title">
                        <span className="region-category-icon">
                          <CategoryIcon name={item.icon} />
                        </span>
                        <h3>{item.title}</h3>
                      </div>
                      <p className="region-category-overview">{d.overview}</p>
                      {region.id === "karavali" ? (
                        <Link
                          className="region-category-read-more"
                          href={`/regions/karavali/categories/${item.id}`}
                        >
                          Read more <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <details className="region-read-more">
                          <summary>Read more</summary>
                          <div className="region-category-details">
                            {d.details.map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                            <h4>In focus</h4>
                            <ul>
                              {d.highlights.map((highlight) => (
                                <li key={highlight}>{highlight}</li>
                              ))}
                            </ul>
                            {d.verificationNote && (
                              <p className="region-verification-note">
                                <strong>Context note:</strong> {d.verificationNote}
                              </p>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="region-no-results" role="status">
              No categories match “{query}”. Try another word or phrase.
            </p>
          )}

          {region.id === "karavali" && <KaravaliTimeline />}
          {region.id === "karavali" && <KaravaliKnowledgeNetwork />}
          {region.id === "karavali" && <KaravaliContributions />}
          {region.id === "karavali" && <KaravaliCommunityGallery />}
        </div>
      </section>
    </main>
  );
}
