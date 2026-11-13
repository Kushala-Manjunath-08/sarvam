"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import KaravaliPhotoCredit from "../../../../components/KaravaliPhotoCredit";

const API = "http://127.0.0.1:8000";
const MAX_FILE_SIZE = 100 * 1024 * 1024;

type District = {
  id: string;
  name: string;
  headquarters: string;
  primary_language: string;
  geographic_features: string;
  climate: string;
  image: string;
  image_alt: string;
};
type Place = {
  id: string;
  name: string;
  category: string;
  summary: string;
  image: string;
  image_alt: string;
};
type Upload = {
  id: string;
  contributor: string;
  caption: string;
  media_type: "image" | "video";
  url: string;
  created_at: string;
};
type ApiError = { detail?: string; message?: string };

export default function KaravaliDistrictPage() {
  const { slug } = useParams<{ slug: string }>();
  const [district, setDistrict] = useState<District | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [contributor, setContributor] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    async function loadDistrict() {
      setLoading(true);
      setLoadError("");
      try {
        const [districtResponse, placesResponse, communityResponse] =
          await Promise.all([
            fetch(`${API}/api/karavali/districts/${slug}`, { cache: "no-store" }),
            fetch(`${API}/api/karavali/places?district=${slug}`, { cache: "no-store" }),
            fetch(`${API}/api/districts/${slug}/community`, { cache: "no-store" }),
          ]);
        const [districtData, placesData, communityData] = await Promise.all([
          districtResponse.json() as Promise<{ district?: District } & ApiError>,
          placesResponse.json() as Promise<{ places: Place[] } & ApiError>,
          communityResponse.json() as Promise<{ uploads?: Upload[] } & ApiError>,
        ]);
        if (!districtResponse.ok) {
          throw new Error(districtData.detail || "Karavali district not found.");
        }
        if (!placesResponse.ok) {
          throw new Error(placesData.detail || "Could not load district places.");
        }
        if (!communityResponse.ok) {
          throw new Error(communityData.detail || "Could not load district media.");
        }
        if (!districtData.district) {
          throw new Error("The server did not return district details.");
        }
        if (active) {
          setDistrict(districtData.district);
          setPlaces(placesData.places);
          setUploads(communityData.uploads ?? []);
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : "Could not load this district.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDistrict();
    return () => {
      active = false;
    };
  }, [slug]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError("");
    setUploadMessage("");
    if (!file || !contributor.trim()) {
      setUploadError("Enter your name and select a photo or video.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("The maximum file size is 100 MB.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("contributor", contributor.trim());
    formData.append("caption", caption.trim());
    setUploading(true);
    try {
      const response = await fetch(`${API}/api/districts/${slug}/uploads`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        upload?: Upload;
      } & ApiError;
      if (!response.ok) {
        throw new Error(data.detail || "The media could not be uploaded.");
      }
      const uploaded = data.upload;
      if (!uploaded) {
        throw new Error("The server did not return the uploaded media.");
      }
      setUploads((current) => [
        uploaded,
        ...current.filter((upload) => upload.id !== uploaded.id),
      ]);
      setUploadMessage("Your media is now visible in this district guide.");
      setContributor("");
      setCaption("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "The media could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <main className="landing-page district-page-active">
        <section className="region-knowledge">
          <p role="status">Loading district guide…</p>
        </section>
      </main>
    );
  }

  if (!district) {
    return (
      <main className="landing-page district-page-active">
        <section className="region-knowledge">
          <p className="karavali-inline-error" role="alert">{loadError}</p>
          <Link className="region-back-link" href="/regions/karavali">
            ← Back to Karavali
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="landing-page district-page-active">
      <section className="region-knowledge">
        <div className="region-knowledge-inner">
          <Link className="region-back-link" href="/regions/karavali">
            ← Back to Karavali
          </Link>
          <header className="karavali-district-story">
            <figure className="karavali-district-story-image">
              <Image
                src={district.image}
                alt={district.image_alt}
                fill
                priority
                sizes="(max-width: 760px) 100vw, 56vw"
              />
              <figcaption>{district.image_alt}</figcaption>
              <KaravaliPhotoCredit image={district.image} />
            </figure>
            <div className="karavali-district-story-copy">
              <p className="district-explorer-kicker">KARAVALI / DISTRICT FIELD GUIDE</p>
              <h1>{district.name}</h1>
              <p>{district.geographic_features}</p>
              <dl>
                <dt>Headquarters</dt><dd>{district.headquarters}</dd>
                <dt>Languages</dt><dd>{district.primary_language}</dd>
                <dt>Climate</dt><dd>{district.climate}</dd>
              </dl>
            </div>
          </header>

          {loadError && <p className="karavali-inline-error" role="alert">{loadError}</p>}

          <section className="karavali-district-places" aria-labelledby="district-places-title">
            <p className="district-explorer-kicker">FOLLOW THE LANDSCAPE</p>
            <h2 id="district-places-title">Places in this district</h2>
            {places.length === 0 ? (
              <p>No place records are published for this district yet.</p>
            ) : (
              <ol>
                {places.map((place) => (
                  <li key={place.id}>
                    <figure>
                      <Image src={place.image} alt={place.image_alt} fill sizes="160px" />
                    </figure>
                    <div>
                      <span className="karavali-place-meta">{place.category}</span>
                      <h3>{place.name}</h3>
                      <p>{place.summary}</p>
                      <Link href={`/regions/karavali/places/${place.id}`}>
                        Open place record <span aria-hidden="true">↗</span>
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="karavali-district-community" aria-labelledby="district-media-title">
            <div>
              <p className="district-explorer-kicker">SHARED FROM {district.name.toUpperCase()}</p>
              <h2 id="district-media-title">Community photographs &amp; films</h2>
              <p>Contributions publish immediately and appear in the regional gallery.</p>
            </div>
            <form className="community-media-form" onSubmit={handleUpload}>
              <label>
                Your name
                <input
                  value={contributor}
                  onChange={(event) => setContributor(event.target.value)}
                  maxLength={80}
                  required
                />
              </label>
              <label>
                Caption <span>(optional)</span>
                <input
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  maxLength={500}
                />
              </label>
              <label className="community-media-file">
                Photo or video
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  required
                />
                <span>JPG, PNG, WEBP, MP4, or WEBM · up to 100 MB</span>
              </label>
              <button type="submit" disabled={uploading}>
                {uploading ? "Uploading…" : "Publish media"}
              </button>
              {uploadError && <p className="community-media-error" role="alert">{uploadError}</p>}
              {uploadMessage && <p className="community-media-message" role="status">{uploadMessage}</p>}
            </form>

            {uploads.length === 0 ? (
              <p>No community media has been shared from this district yet.</p>
            ) : (
              <div className="karavali-district-media-list">
                {uploads.map((upload) => (
                  <article key={upload.id}>
                    {upload.media_type === "video" ? (
                      <video src={`${API}${upload.url}`} controls playsInline preload="metadata">
                        Your browser does not support video playback.
                      </video>
                    ) : (
                      <img src={`${API}${upload.url}`} alt={upload.caption || `Photo from ${district.name}`} loading="lazy" />
                    )}
                    <p>{upload.caption || "Shared media"} · {upload.contributor}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
