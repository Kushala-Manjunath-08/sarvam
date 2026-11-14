"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import KaravaliPhotoCredit from "../../../../components/KaravaliPhotoCredit";
import {
  regionCategories,
  regionalContent,
  type RegionCategoryContent,
  type RegionCategoryItem,
} from "../../../../region-content";

const API = "http://127.0.0.1:8000";
type Category = RegionCategoryItem & RegionCategoryContent;

const fallbackCategories: Category[] = regionCategories.flatMap((item) => {
  const details = regionalContent.karavali.categories[item.id];
  return details
    ? [{ ...item, image: details.image ?? item.image, ...details }]
    : [];
});

export default function KaravaliCategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [categories, setCategories] = useState(fallbackCategories);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const response = await fetch(`${API}/api/karavali/categories`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("The current Karavali heritage sections could not be loaded.");
        }
        const data = (await response.json()) as { categories: Category[] };
        if (active) {
          setCategories(data.categories);
          setLoadError("");
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "The current Karavali heritage sections could not be loaded.",
          );
        }
      } finally {
        if (active) setLoaded(true);
      }
    }

    void loadCategories();
    return () => {
      active = false;
    };
  }, []);

  const category = categories.find((item) => item.id === slug);

  return (
    <main className="landing-page district-page-active">
      <section className="region-knowledge">
        <div className="region-knowledge-inner">
          <Link className="region-back-link" href="/regions/karavali">
            ← Back to Karavali
          </Link>
          {category ? (
            <>
              <header className="karavali-category-hero">
                <div className="karavali-category-hero-image">
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 760px) 100vw, 48vw"
                  />
                  <KaravaliPhotoCredit image={category.image} />
                </div>
                <div>
                  <p className="district-explorer-kicker">KARAVALI FIELD GUIDE</p>
                  <h1>{category.title}</h1>
                  <p className="region-hero-introduction">{category.overview}</p>
                </div>
              </header>

              {loadError && (
                <p className="karavali-inline-error" role="alert">{loadError}</p>
              )}
              <div className="karavali-category-detail">
                {category.details.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                <h2>In focus</h2>
                <ul>
                  {category.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>

                {category.verificationNote && (
                  <p className="region-verification-note">
                    <strong>Context note:</strong> {category.verificationNote}
                  </p>
                )}

                {category.sources && category.sources.length > 0 && (
                  <section className="karavali-category-sources">
                    <h2>Sources &amp; further reading</h2>
                    <ul>
                      {category.sources.map((source) => (
                        <li key={source.url}>
                          <a href={source.url} target="_blank" rel="noreferrer">
                            {source.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {category.id === "iconic-places" && (
                  <Link
                    className="region-category-read-more"
                    href="/regions/karavali#karavali-places-title"
                  >
                    Explore all Karavali places <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <p role={loaded ? "alert" : "status"}>
              {loaded ? "This Karavali heritage section was not found." : "Loading heritage section…"}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
