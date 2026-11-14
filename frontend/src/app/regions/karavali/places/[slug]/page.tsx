import { readFile } from "node:fs/promises";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import KaravaliPlaceCommunity from "../../../../components/KaravaliPlaceCommunity";
import KaravaliPhotoCredit from "../../../../components/KaravaliPhotoCredit";

type PlacePageProps = {
  params: Promise<{ slug: string }>;
};

type PlaceRecord = {
  id: string;
  name: string;
  district_id: string;
  district_name: string;
  category: string;
  description: string;
  coordinates: string;
  image: string;
  image_alt: string;
  image_credit: string;
  historical_background: string;
  cultural_significance: string;
  geographical_importance: string;
  architectural_details: string | null;
  important_attractions: string[];
  nearby_destinations: string[];
  source_ids: string[];
};

type SourceRecord = {
  id: string;
  title: string;
  url: string;
};

const dataDirectory = path.resolve(process.cwd(), "..", "data", "karavali");

async function readKaravaliFile<T>(filename: string): Promise<T> {
  const contents = await readFile(path.join(dataDirectory, filename), "utf-8");
  return JSON.parse(contents) as T;
}

export async function generateStaticParams() {
  const data = await readKaravaliFile<{ places: PlaceRecord[] }>("places.json");
  return data.places.map((place) => ({ slug: place.id }));
}

export default async function KaravaliPlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  const [placeData, sourceData] = await Promise.all([
    readKaravaliFile<{ places: PlaceRecord[] }>("places.json"),
    readKaravaliFile<{ sources: SourceRecord[] }>("sources.json"),
  ]);
  const place = placeData.places.find((item) => item.id === slug);
  if (!place) notFound();

  const sources = new Map(sourceData.sources.map((source) => [source.id, source]));
  const placeSources = place.source_ids
    .map((sourceId) => sources.get(sourceId))
    .filter((source) => source !== undefined);

  return (
    <main className="landing-page district-page-active">
      <section className="region-knowledge">
        <div className="region-knowledge-inner">
          <Link
            className="region-back-link"
            href={`/regions/karavali/districts/${place.district_id}`}
          >
            ← Back to {place.district_name}
          </Link>

          <header className="karavali-place-detail">
            <div className="karavali-place-detail-image">
              <Image
                src={place.image}
                alt={place.image_alt}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 48vw"
              />
              <KaravaliPhotoCredit image={place.image} />
            </div>
            <div className="karavali-place-detail-copy">
              <p className="district-explorer-kicker">
                {place.district_name.toUpperCase()} · {place.category.toUpperCase()}
              </p>
              <h1>{place.name}</h1>
              <p className="region-hero-introduction">{place.description}</p>
              <dl>
                <dt>District</dt>
                <dd>{place.district_name}</dd>
                {place.coordinates && (
                  <>
                    <dt>Coordinates</dt>
                    <dd>{place.coordinates}</dd>
                  </>
                )}
                <dt>Image credit</dt>
                <dd>{place.image_credit}</dd>
              </dl>
            </div>
          </header>

          <div className="karavali-place-sections">
            <h2>Historical background</h2>
            <p>{place.historical_background}</p>

            <h2>Cultural significance</h2>
            <p>{place.cultural_significance}</p>

            <h2>Landscape &amp; location</h2>
            <p>{place.geographical_importance}</p>

            {place.architectural_details && (
              <>
                <h2>Architecture</h2>
                <p>{place.architectural_details}</p>
              </>
            )}

            <h2>What to explore</h2>
            <ul>
              {place.important_attractions.map((attraction) => (
                <li key={attraction}>{attraction}</li>
              ))}
            </ul>

            {place.nearby_destinations.length > 0 && (
              <>
                <h2>Nearby destinations</h2>
                <ul>
                  {place.nearby_destinations.map((destination) => (
                    <li key={destination}>{destination}</li>
                  ))}
                </ul>
              </>
            )}

            {placeSources.length > 0 && (
              <section className="karavali-category-sources">
                <h2>Sources &amp; further reading</h2>
                <ul>
                  {placeSources.map((source) => (
                    <li key={source.id}>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <KaravaliPlaceCommunity placeId={place.id} />
        </div>
      </section>
    </main>
  );
}
