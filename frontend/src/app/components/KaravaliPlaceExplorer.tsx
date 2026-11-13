"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import KaravaliPhotoCredit from "./KaravaliPhotoCredit";

const API = "http://127.0.0.1:8000";

type Place = {
  id: string;
  name: string;
  district_id: string;
  district_name: string;
  category: string;
  summary: string;
  image: string;
  image_alt: string;
};

const districts = [
  { id: "dakshina-kannada", name: "Dakshina Kannada" },
  { id: "udupi", name: "Udupi" },
  { id: "uttara-kannada", name: "Uttara Kannada" },
];

export default function KaravaliPlaceExplorer() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [district, setDistrict] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPlaces() {
      try {
        const response = await fetch(`${API}/api/karavali/places`);
        if (!response.ok) throw new Error("Could not load Karavali places.");
        const data = (await response.json()) as { places: Place[] };
        if (active) setPlaces(data.places);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load Karavali places.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPlaces();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(places.map((place) => place.category))].sort(),
    [places],
  );
  const visiblePlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return places.filter((place) => {
      const matchesDistrict = !district || place.district_id === district;
      const matchesCategory = !category || place.category === category;
      const searchable = `${place.name} ${place.summary} ${place.district_name} ${place.category}`.toLocaleLowerCase();
      return (
        matchesDistrict &&
        matchesCategory &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      );
    });
  }, [category, district, places, query]);

  return (
    <section className="karavali-place-explorer karavali-place-magazine" aria-labelledby="karavali-places-title">
      <header className="karavali-place-heading">
        <p className="district-explorer-kicker">FIELD NOTES / THE WESTERN SHORE</p>
        <h2 id="karavali-places-title">A coast best read slowly</h2>
        <p>
          Ten places, three districts, and a shoreline shaped by sea, stone,
          worship, work, and monsoon. Search the guide or follow a photograph.
        </p>
      </header>

      <div className="karavali-place-filters">
        <label>
          Find a place
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search names, stories, districts"
            aria-label="Search Karavali places"
          />
        </label>
        <label>
          Along the coast
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
        <label>
          Field note
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p role="status">Loading places…</p>}
      {!loading && error && (
        <p className="region-no-results" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && visiblePlaces.length > 0 && (
        <div className="karavali-place-magazine-grid">
          {visiblePlaces.map((place, index) => (
            <article
              className={`karavali-place-story karavali-place-story-${index % 6}`}
              key={place.id}
            >
              <figure className="karavali-place-image">
                <Link
                  className="karavali-place-image-link"
                  href={`/regions/karavali/places/${place.id}`}
                  aria-label={`Read the field note for ${place.name}`}
                >
                  <Image
                    src={place.image}
                    alt={place.image_alt}
                    priority={index < 2}
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 66vw"
                  />
                </Link>
                <figcaption>{place.image_alt}</figcaption>
              </figure>
              <KaravaliPhotoCredit image={place.image} />
              <div className="karavali-place-copy">
                <span className="karavali-place-meta">
                  {place.district_name} / {place.category}
                </span>
                <h3>
                  <Link href={`/regions/karavali/places/${place.id}`}>
                    {place.name}
                  </Link>
                </h3>
                <p>{place.summary}</p>
                <Link
                  className="karavali-place-cta"
                  href={`/regions/karavali/places/${place.id}`}
                >
                  Read the field note <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !error && visiblePlaces.length === 0 && (
        <p className="region-no-results" role="status">
          No places match these filters. Try another district, category, or search.
        </p>
      )}
    </section>
  );
}
