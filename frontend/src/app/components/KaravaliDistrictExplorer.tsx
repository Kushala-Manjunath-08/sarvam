"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import KaravaliPhotoCredit from "./KaravaliPhotoCredit";

const API = "http://127.0.0.1:8000";
const preferredOrder = ["uttara-kannada", "udupi", "dakshina-kannada"];
const highlights: Record<string, string[]> = {
  "uttara-kannada": ["Mirjan Fort", "Gokarna", "Yana"],
  udupi: ["Sri Krishna Matha", "Malpe", "St. Mary's Islands"],
  "dakshina-kannada": ["Mangaluru", "Kadri", "Panambur"],
};

type District = {
  id: string;
  name: string;
  headquarters: string;
  primary_language: string;
  geographic_features: string;
  climate: string;
  image: string;
  image_alt: string;
  image_credit: string;
};

const fallbackDistricts: District[] = [
  {
    id: "uttara-kannada",
    name: "Uttara Kannada",
    headquarters: "Karwar",
    primary_language: "Konkani, Kannada, Havyaka Kannada, Marathi",
    geographic_features: "Western Ghats forests, river estuaries, forts, and an open Arabian Sea coast.",
    climate: "Tropical monsoon climate.",
    image: "/images/karavali/mirjan-fort.jpg",
    image_alt: "The laterite walls of Mirjan Fort",
    image_credit: "Photograph by Vu2sga (CC BY-SA 3.0)",
  },
  {
    id: "udupi",
    name: "Udupi",
    headquarters: "Udupi",
    primary_language: "Tulu, Kannada, Konkani",
    geographic_features: "A coast of temple towns, harbours, basalt islands, and backwaters.",
    climate: "Tropical maritime climate.",
    image: "/images/karavali/malpe-harbour.jpg",
    image_alt: "Malpe Beach on the Udupi coastline",
    image_credit: "Photograph by Raghavan2010 (CC BY-SA 4.0)",
  },
  {
    id: "dakshina-kannada",
    name: "Dakshina Kannada",
    headquarters: "Mangaluru",
    primary_language: "Tulu, Kannada, Konkani, Beary",
    geographic_features: "The Arabian Sea and Western Ghats meet around the Netravati and Gurupura rivers.",
    climate: "Tropical monsoon climate.",
    image: "/images/karavali/panambur-beach.jpg",
    image_alt: "Panambur Beach on Mangaluru's northern shoreline",
    image_credit: "Photograph by Lpp3535 (CC BY-SA 4.0)",
  },
];

export default function KaravaliDistrictExplorer() {
  const [districts, setDistricts] = useState(fallbackDistricts);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDistricts() {
      try {
        const response = await fetch(`${API}/api/karavali/districts`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("The current Karavali district guide could not be loaded.");
        }
        const data = (await response.json()) as { districts: District[] };
        if (active) {
          const sorted = [...data.districts].sort((a, b) => {
            const aIndex = preferredOrder.indexOf(a.id);
            const bIndex = preferredOrder.indexOf(b.id);
            return (aIndex < 0 ? preferredOrder.length : aIndex) -
              (bIndex < 0 ? preferredOrder.length : bIndex);
          });
          setDistricts(sorted);
          setLoadError("");
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "The current Karavali district guide could not be loaded.",
          );
        }
      }
    }
    void loadDistricts();
    return () => {
      active = false;
    };
  }, []);

  const districtStops = useMemo(
    () =>
      districts.map((district, index) => ({
        ...district,
        direction:
          district.id === "uttara-kannada"
            ? "North / Forest, fort & open sea"
            : district.id === "udupi"
              ? "Central coast / Shrine, harbour & islands"
              : district.id === "dakshina-kannada"
                ? "South / City, ritual & working shore"
                : `Coastal district / ${district.headquarters}`,
        highlights: highlights[district.id] ?? [district.headquarters],
        index,
      })),
    [districts],
  );

  return (
    <section className="karavali-coastal-journey" aria-labelledby="karavali-journey-title">
      <header className="karavali-journey-heading">
        <p className="district-explorer-kicker">THREE DISTRICTS / ONE SHORELINE</p>
        <h2 id="karavali-journey-title">North to south, by the sea</h2>
        <p>
          Follow the coast through its districts. Each stop opens a working
          guide with places, community media, and local context.
        </p>
        {loadError && (
          <p className="karavali-inline-error" role="alert">
            {loadError} The last available district guide remains visible.
          </p>
        )}
      </header>

      <ol className="karavali-journey-stops">
        {districtStops.map((district) => (
          <li
            className={`karavali-journey-stop ${district.index % 2 ? "is-reversed" : ""}`}
            key={district.id}
          >
            <div className="karavali-journey-stop-marker">
              <span>{String(district.index + 1).padStart(2, "0")}</span>
            </div>
            <figure className="karavali-journey-image">
              <Image
                src={district.image}
                alt={district.image_alt}
                fill
                priority={district.index === 0}
                sizes="(max-width: 760px) 100vw, 48vw"
              />
              <figcaption>{district.image_alt}</figcaption>
              <KaravaliPhotoCredit image={district.image} />
            </figure>
            <div className="karavali-journey-copy">
              <p className="karavali-place-meta">{district.direction}</p>
              <h3>{district.name}</h3>
              <p>{district.geographic_features}</p>
              <p>
                Headquarters: {district.headquarters} · Languages: {district.primary_language}
              </p>
              <ul aria-label={`${district.name} landmarks`}>
                {district.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <Link
                className="karavali-journey-link"
                href={`/regions/karavali/districts/${district.id}`}
              >
                Enter the district guide <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
