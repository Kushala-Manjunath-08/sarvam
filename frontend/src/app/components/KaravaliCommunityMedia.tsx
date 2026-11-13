"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

const API = "http://127.0.0.1:8000";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const districts = [
  { id: "dakshina-kannada", name: "Dakshina Kannada" },
  { id: "udupi", name: "Udupi" },
  { id: "uttara-kannada", name: "Uttara Kannada" },
] as const;

type DistrictId = (typeof districts)[number]["id"];

type CommunityUpload = {
  id: string;
  district_id: DistrictId;
  contributor: string;
  caption: string;
  media_type: "image" | "video";
  url: string;
  created_at: string;
};

type CommunityResponse = {
  uploads: CommunityUpload[];
};

type UploadResponse = {
  detail?: string;
  upload?: CommunityUpload;
  message?: string;
};

export default function KaravaliCommunityMedia() {
  const [uploads, setUploads] = useState<CommunityUpload[]>([]);
  const [districtId, setDistrictId] = useState<DistrictId | "">("");
  const [contributor, setContributor] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    async function loadUploads() {
      try {
        const responses = await Promise.all(
          districts.map(async (district) => {
            const response = await fetch(
              `${API}/api/districts/${district.id}/community`,
            );
            if (!response.ok) {
              throw new Error(`Could not load ${district.name} media.`);
            }
            return (await response.json()) as CommunityResponse;
          }),
        );
        if (active) {
          setUploads(responses.flatMap((response) => response.uploads ?? []));
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load community media.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadUploads();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage("");

    if (!districtId || !file || !contributor.trim()) {
      setFormMessage("Choose a district, enter your name, and select a file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFormMessage("The maximum file size is 100 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("contributor", contributor);
    formData.append("caption", caption);
    setSubmitting(true);

    try {
      const response = await fetch(
        `${API}/api/districts/${districtId}/uploads`,
        { method: "POST", body: formData },
      );
      const result = (await response.json()) as UploadResponse;

      if (!response.ok) {
        throw new Error(result.detail || "The media could not be uploaded.");
      }
      const uploaded = result.upload;
      if (!uploaded) {
        throw new Error("The server did not return the uploaded media.");
      }

      setUploads((current) => [
        uploaded,
        ...current.filter((upload) => upload.id !== uploaded.id),
      ]);
      setCaption("");
      setFile(null);
      setFileInputKey((current) => current + 1);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFormMessage(result.message || "Your media is now visible below.");
    } catch (error) {
      setFormMessage(
        error instanceof Error
          ? error.message
          : "The media could not be uploaded.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="community-media" aria-labelledby="community-media-title">
      <div className="community-media-heading">
        <p className="district-explorer-kicker">SHARED BY THE COMMUNITY</p>
        <h2 id="community-media-title">Karavali photos &amp; videos</h2>
        <p>Share a photo or video from one of the coastal districts.</p>
      </div>

      <form className="community-media-form" onSubmit={handleSubmit}>
        <label>
          District
          <select
            value={districtId}
            onChange={(event) =>
              setDistrictId(event.target.value as DistrictId | "")
            }
            required
          >
            <option value="" disabled>
              Select a district
            </option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </label>
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
            key={fileInputKey}
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
          />
          <span>JPG, PNG, WEBP, MP4, or WEBM · up to 100 MB</span>
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Uploading…" : "Upload media"}
        </button>
        {formMessage && (
          <p className="community-media-message" role="status">
            {formMessage}
          </p>
        )}
      </form>

      <div className="community-media-list" aria-live="polite">
        {loading && <p>Loading community media…</p>}
        {!loading && loadError && (
          <p className="community-media-error" role="alert">
            {loadError}
          </p>
        )}
        {!loading && !loadError && uploads.length === 0 && (
          <p>No community photos or videos yet. Be the first to share one.</p>
        )}
        {uploads.map((upload) => {
          const district = districts.find(
            (item) => item.id === upload.district_id,
          );
          return (
            <article className="community-media-item" key={upload.id}>
              <div className="community-media-preview">
                {upload.media_type === "video" ? (
                  <video
                    src={`${API}${upload.url}`}
                    controls
                    playsInline
                    preload="metadata"
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <img
                    src={`${API}${upload.url}`}
                    alt={upload.caption || `Photo from ${district?.name ?? "Karavali"}`}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="community-media-description">
                <p className="community-media-caption">
                  {upload.caption || "Shared media"}
                </p>
                <p>
                  {district?.name ?? "Karavali"} · Shared by {upload.contributor}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
