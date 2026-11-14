"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type RegionalContribution = {
  id: string;
  region_id: string;
  district: string;
  location: string;
  contributor: string;
  experience: string;
  topics: string[];
  media_type: "image" | "video" | null;
  url: string | null;
  created_at: string;
};

type GalleryFilter = "all" | "photos" | "videos";

type RegionalCommunityGalleryProps = {
  regionId: string;
  regionName: string;
  districts: string[];
};

type ContributionsResponse = {
  contributions?: RegionalContribution[];
  detail?: string;
};

type SubmissionResponse = {
  message?: string;
  detail?: string;
  contribution?: RegionalContribution;
};

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

const storyTopics = [
  { value: "stay", label: "Stay & hospitality" },
  { value: "culture", label: "Culture & people" },
  { value: "communities", label: "Communities" },
  { value: "history", label: "History" },
  { value: "languages", label: "Languages" },
  { value: "festivals", label: "Festivals" },
  { value: "performing-arts", label: "Performing arts" },
  { value: "food", label: "Food" },
  { value: "weather", label: "Weather" },
  { value: "climate", label: "Climate" },
  { value: "nature", label: "Nature & landscape" },
  { value: "architecture", label: "Architecture" },
  { value: "agriculture", label: "Agriculture" },
  { value: "oral-history", label: "Oral history" },
  { value: "traditional-knowledge", label: "Traditional knowledge" },
  { value: "personalities", label: "Local personalities" },
  { value: "other", label: "Other" },
];

function formatUploadDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "The community archive is temporarily unavailable. The regional guide remains available; please try again shortly.";
  }
  return error instanceof Error ? error.message : fallback;
}

export default function RegionalCommunityGallery({
  regionId,
  regionName,
  districts,
}: RegionalCommunityGalleryProps) {
  const [contributions, setContributions] = useState<RegionalContribution[]>([]);
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [contributor, setContributor] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadDialogRef = useRef<HTMLDialogElement>(null);
  const previewDialogRef = useRef<HTMLDialogElement>(null);
  const uploadRequestRef = useRef<XMLHttpRequest | null>(null);
  const touchStartX = useRef<number | null>(null);

  const photoCount = contributions.filter(
    (item) => item.media_type === "image" && item.url,
  ).length;
  const videoCount = contributions.filter(
    (item) => item.media_type === "video" && item.url,
  ).length;
  const galleryItems = useMemo(
    () =>
      contributions.filter((item) => {
        if (filter === "photos") {
          return item.media_type === "image" && Boolean(item.url);
        }
        if (filter === "videos") {
          return item.media_type === "video" && Boolean(item.url);
        }
        return true;
      }),
    [contributions, filter],
  );
  const activeContribution = galleryItems[activeIndex];

  const loadContributions = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(
        `${API_BASE}/api/regions/${encodeURIComponent(regionId)}/contributions`,
        { cache: "no-store" },
      );
      const result = (await response.json()) as ContributionsResponse;
      if (!response.ok) {
        throw new Error(result.detail || "Could not load regional media.");
      }
      if (!Array.isArray(result.contributions)) {
        throw new Error("The regional archive returned an invalid response.");
      }
      setContributions(result.contributions);
    } catch (error) {
      setLoadError(errorMessage(error, "Could not load regional media."));
    } finally {
      setLoading(false);
    }
  }, [regionId]);

  useEffect(() => {
    void loadContributions();
  }, [loadContributions]);

  useEffect(() => {
    const dialog = uploadDialogRef.current;
    if (!dialog) return;
    if (uploadOpen && !dialog.open) dialog.showModal();
    else if (!uploadOpen && dialog.open) dialog.close();
  }, [uploadOpen]);

  useEffect(() => {
    const dialog = previewDialogRef.current;
    if (!dialog) return;
    if (previewOpen && !dialog.open) dialog.showModal();
    else if (!previewOpen && dialog.open) dialog.close();
  }, [previewOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [filter, regionId]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(
    () => () => {
      uploadRequestRef.current?.abort();
    },
    [],
  );

  function moveGallery(step: number) {
    if (galleryItems.length < 2) return;
    setActiveIndex(
      (current) => (current + step + galleryItems.length) % galleryItems.length,
    );
  }

  function toggleTopic(topic: string) {
    setSelectedTopics((current) =>
      current.includes(topic)
        ? current.filter((value) => value !== topic)
        : [...current, topic],
    );
  }

  function chooseFile(nextFile: File | null) {
    setUploadError("");
    if (nextFile && nextFile.size > 100 * 1024 * 1024) {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadError("The selected file is over the 100 MB size limit.");
      return;
    }
    setFile(nextFile);
  }

  async function submitContribution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError("");
    const formData = new FormData();
    formData.append("district", selectedDistrict);
    formData.append("location", location.trim());
    formData.append("contributor", contributor.trim());
    formData.append("experience", experience.trim());
    formData.append("topics", JSON.stringify(selectedTopics));
    formData.append("rights_confirmation", String(rightsConfirmed));
    if (file) formData.append("file", file);

    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await new Promise<SubmissionResponse>((resolve, reject) => {
        const request = new XMLHttpRequest();
        uploadRequestRef.current = request;
        request.open(
          "POST",
          `${API_BASE}/api/regions/${encodeURIComponent(regionId)}/contributions`,
        );
        request.upload.onprogress = (progressEvent) => {
          if (progressEvent.lengthComputable) {
            setUploadProgress(
              Math.round((progressEvent.loaded / progressEvent.total) * 100),
            );
          }
        };
        request.onerror = () => reject(new TypeError("Failed to fetch"));
        request.onabort = () => reject(new Error("The upload was cancelled."));
        request.onload = () => {
          let response: SubmissionResponse;
          try {
            response = JSON.parse(request.responseText) as SubmissionResponse;
          } catch {
            reject(new Error("The regional archive returned an invalid response."));
            return;
          }
          if (request.status < 200 || request.status >= 300) {
            reject(
              new Error(response.detail || "Could not share this experience."),
            );
            return;
          }
          if (!response.contribution) {
            reject(new Error("The archive did not return the saved experience."));
            return;
          }
          resolve(response);
        };
        request.onloadend = () => {
          if (uploadRequestRef.current === request) {
            uploadRequestRef.current = null;
          }
        };
        request.send(formData);
      });

      const saved = result.contribution;
      if (!saved) {
        throw new Error("The archive did not return the saved experience.");
      }
      setContributions((current) => [
        saved,
        ...current.filter((item) => item.id !== saved.id),
      ].slice(0, 100));
      setFilter(
        saved.media_type === "image"
          ? "photos"
          : saved.media_type === "video"
            ? "videos"
            : "all",
      );
      setActiveIndex(0);
      setNotice(
        result.message || "Your experience is now part of the regional archive.",
      );
      setUploadOpen(false);
      setSelectedDistrict("");
      setLocation("");
      setContributor("");
      setExperience("");
      setSelectedTopics([]);
      setRightsConfirmed(false);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setUploadError(errorMessage(error, "Could not share this experience."));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <section
      className="regional-gallery"
      id="regional-contributions"
      aria-labelledby="regional-gallery-title"
    >
      <header className="regional-gallery-heading">
        <div>
          <p className="district-explorer-kicker">COMMUNITY FIELD ARCHIVE</p>
          <h2 id="regional-gallery-title">Moments from {regionName}</h2>
          <p>
            Visitor photographs, films and first-hand accounts of the places,
            people and traditions that make this region distinctive.
          </p>
        </div>
        <div className="regional-gallery-actions">
          <button
            type="button"
            onClick={() => {
              setUploadError("");
              setNotice("");
              setUploadOpen(true);
            }}
          >
            <span aria-hidden="true">＋</span> Upload a memory
          </button>
        </div>
      </header>

      {notice && (
        <p className="regional-gallery-notice" role="status">{notice}</p>
      )}

      <div className="regional-gallery-toolbar">
        <div className="regional-gallery-filters" aria-label="Filter community media">
          {([
            ["all", "All memories", contributions.length],
            ["photos", "Photos", photoCount],
            ["videos", "Videos", videoCount],
          ] as const).map(([value, label, count]) => (
            <button
              aria-pressed={filter === value}
              className={filter === value ? "is-active" : ""}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              {label} <span>{count}</span>
            </button>
          ))}
        </div>
        <p>Shared by visitors · {regionName}</p>
      </div>

      {loadError ? (
        <div className="regional-gallery-empty regional-gallery-error" role="alert">
          <span className="regional-gallery-empty-mark" aria-hidden="true">!</span>
          <p>{loadError}</p>
          <button disabled={loading} onClick={() => void loadContributions()} type="button">
            Retry archive connection
          </button>
        </div>
      ) : loading ? (
        <div className="regional-gallery-empty" role="status">
          <span className="regional-gallery-loader" aria-hidden="true" />
          Loading community memories…
        </div>
      ) : galleryItems.length === 0 ? (
        <div className="regional-gallery-empty">
          <span className="regional-gallery-empty-mark" aria-hidden="true">
            {filter === "videos" ? "▷" : "✳"}
          </span>
          <p>
            {filter === "photos"
              ? "No photographs have been shared yet."
              : filter === "videos"
                ? "No videos have been shared yet."
                : "This archive is ready for its first memory."}
          </p>
          <span>Share a moment from {regionName} to help it grow.</span>
        </div>
      ) : (
        <>
          <div className="regional-gallery-stage">
            <div
              aria-label="Community media viewer"
              aria-live="polite"
              aria-roledescription="carousel"
              className="regional-gallery-viewport"
              onTouchEnd={(event) => {
                if (touchStartX.current === null) return;
                const delta = event.changedTouches[0].clientX - touchStartX.current;
                if (Math.abs(delta) > 48) moveGallery(delta < 0 ? 1 : -1);
                touchStartX.current = null;
              }}
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0].clientX;
              }}
              role="region"
            >
              <div
                className="regional-gallery-track"
                style={{
                  width: `${galleryItems.length * 100}%`,
                  transform: `translateX(-${activeIndex * (100 / galleryItems.length)}%)`,
                }}
              >
                {galleryItems.map((item, index) => (
                  <article
                    aria-hidden={index !== activeIndex}
                    aria-label={`${index + 1} of ${galleryItems.length}`}
                    aria-roledescription="slide"
                    className="regional-gallery-slide"
                    key={item.id}
                    style={{ flexBasis: `${100 / galleryItems.length}%` }}
                  >
                    {item.url && item.media_type === "image" ? (
                      <button
                        aria-label={`View photograph from ${item.location} full screen`}
                        className="regional-gallery-image-button"
                        onClick={() => setPreviewOpen(true)}
                        tabIndex={index === activeIndex ? 0 : -1}
                        type="button"
                      >
                        <Image
                          alt={`Visitor photograph from ${item.location}, ${item.district}`}
                          fill
                          priority={index === activeIndex}
                          sizes="(max-width: 760px) 100vw, 88vw"
                          src={`${API_BASE}${item.url}`}
                          unoptimized
                        />
                      </button>
                    ) : item.url && item.media_type === "video" ? (
                      index === activeIndex ? (
                        <video
                          className="regional-gallery-video"
                          controls
                          playsInline
                          preload="metadata"
                          src={`${API_BASE}${item.url}`}
                        />
                      ) : (
                        <div className="regional-gallery-video-placeholder" aria-hidden="true">
                          <span>▷</span>
                          <p>Community film · {item.location}</p>
                        </div>
                      )
                    ) : (
                      <div className="regional-gallery-text-slide">
                        <span>COMMUNITY MEMORY</span>
                        <p>{item.experience}</p>
                        <small>{item.location}</small>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <button
              aria-label="Open full-screen media preview"
              className="regional-gallery-expand"
              onClick={() => setPreviewOpen(true)}
              type="button"
            >
              <span aria-hidden="true">⤢</span> Full screen
            </button>
            {galleryItems.length > 1 && (
              <div className="regional-gallery-navigation">
                <button aria-label="Previous memory" onClick={() => moveGallery(-1)} type="button">
                  ←
                </button>
                <span>
                  {String(activeIndex + 1).padStart(2, "0")} /{" "}
                  {String(galleryItems.length).padStart(2, "0")}
                </span>
                <button aria-label="Next memory" onClick={() => moveGallery(1)} type="button">
                  →
                </button>
              </div>
            )}
          </div>

          {activeContribution && (
            <div className="regional-gallery-caption">
              <div>
                <p className="district-explorer-kicker">
                  {activeContribution.media_type === "video"
                    ? "VISITOR VIDEO"
                    : activeContribution.media_type === "image"
                      ? "VISITOR PHOTOGRAPH"
                      : "COMMUNITY MEMORY"}
                  {" · "}
                  {activeContribution.district}
                </p>
                <h3>{activeContribution.location}</h3>
                <p>{activeContribution.experience}</p>
                {activeContribution.topics.length > 0 && (
                  <ul aria-label="Memory topics">
                    {activeContribution.topics.map((topic) => (
                      <li key={topic}>
                        {storyTopics.find((entry) => entry.value === topic)?.label ?? topic}
                      </li>
                    ))}
                  </ul>
                )}
                <span>
                  Shared by {activeContribution.contributor} ·{" "}
                  {formatUploadDate(activeContribution.created_at)}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <dialog
        aria-labelledby="regional-gallery-upload-heading"
        className="regional-gallery-dialog regional-gallery-upload-dialog"
        id="regional-gallery-upload"
        onCancel={(event) => {
          event.preventDefault();
          if (!uploading) setUploadOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget && !uploading) {
            setUploadOpen(false);
          }
        }}
        onClose={() => setUploadOpen(false)}
        ref={uploadDialogRef}
      >
        <div className="regional-gallery-upload-panel">
          <header className="regional-gallery-dialog-heading">
            <div>
              <p className="district-explorer-kicker">ADD TO THE ARCHIVE</p>
              <h2 id="regional-gallery-upload-heading">Share a moment</h2>
              <p>Help others experience {regionName} through your visit.</p>
            </div>
            <button
              aria-label="Close upload panel"
              disabled={uploading}
              onClick={() => setUploadOpen(false)}
              type="button"
            >
              ×
            </button>
          </header>
          <form className="regional-gallery-form" onSubmit={submitContribution}>
            <label>
              District
              <select
                onChange={(event) => setSelectedDistrict(event.target.value)}
                required
                value={selectedDistrict}
              >
                <option disabled value="">Choose a district</option>
                {districts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </label>
            <label>
              Display name
              <input
                autoComplete="name"
                maxLength={80}
                onChange={(event) => setContributor(event.target.value)}
                required
                value={contributor}
              />
            </label>
            <label>
              City, town or place visited
              <input
                maxLength={160}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="For example, Madikeri"
                required
                value={location}
              />
            </label>
            <label>
              Caption / experience
              <textarea
                maxLength={3000}
                onChange={(event) => setExperience(event.target.value)}
                placeholder="Describe the place, people, culture, food, weather or traditions you experienced."
                required
                rows={4}
                value={experience}
              />
            </label>
            <fieldset className="regional-gallery-topics">
              <legend>Topics (optional)</legend>
              <div>
                {storyTopics.map((topic) => (
                  <label key={topic.value}>
                    <input
                      checked={selectedTopics.includes(topic.value)}
                      onChange={() => toggleTopic(topic.value)}
                      type="checkbox"
                    />
                    {topic.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="regional-gallery-file">
              Photograph or video
              <input
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
                ref={fileInputRef}
                type="file"
              />
            </label>
            <p className="regional-gallery-file-note">
              JPG, PNG, WebP, MP4 or WebM · maximum 100 MB
              {file ? ` · ${file.name}` : ""}
            </p>
            <div className="regional-gallery-upload-preview">
              {file && previewUrl ? (
                file.type.startsWith("video/") ? (
                  <video controls playsInline src={previewUrl} />
                ) : (
                  <Image alt={`Preview of ${file.name}`} fill sizes="440px" src={previewUrl} unoptimized />
                )
              ) : (
                <span>Your media preview will appear here</span>
              )}
            </div>
            {uploading && (
              <div className="regional-gallery-progress">
                <progress aria-label="Upload progress" max={100} value={uploadProgress} />
                <span>{uploadProgress}% uploaded</span>
              </div>
            )}
            <label className="regional-gallery-consent">
              <input
                checked={rightsConfirmed}
                onChange={(event) => setRightsConfirmed(event.target.checked)}
                required
                type="checkbox"
              />
              <span>
                I created this story and media, or have permission to share them
                publicly with the name above.
              </span>
            </label>
            {uploadError && <p className="regional-gallery-error-message" role="alert">{uploadError}</p>}
            <button className="regional-gallery-submit" disabled={uploading} type="submit">
              {uploading ? "Uploading…" : "Share with the community"}
            </button>
          </form>
        </div>
      </dialog>

      <dialog
        aria-labelledby="regional-gallery-preview-heading"
        className="regional-gallery-dialog regional-gallery-preview-dialog"
        onCancel={(event) => {
          event.preventDefault();
          setPreviewOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setPreviewOpen(false);
        }}
        onClose={() => setPreviewOpen(false)}
        onKeyDown={(event) => {
          if (event.target instanceof HTMLVideoElement) return;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveGallery(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            moveGallery(1);
          }
        }}
        ref={previewDialogRef}
      >
        {activeContribution && (
          <div className="regional-gallery-preview-content">
            <header className="regional-gallery-preview-heading">
              <div>
                <p className="district-explorer-kicker">
                  {activeContribution.district} · {activeContribution.location}
                </p>
                <h2 id="regional-gallery-preview-heading">
                  {activeContribution.media_type === "video"
                    ? "Community video"
                    : activeContribution.media_type === "image"
                      ? "Community photograph"
                      : "Community memory"}
                </h2>
              </div>
              <button
                aria-label="Close full-screen preview"
                onClick={() => setPreviewOpen(false)}
                type="button"
              >
                ×
              </button>
            </header>
            <div className="regional-gallery-preview-stage">
              {activeContribution.url && activeContribution.media_type === "image" ? (
                <Image
                  alt={`Visitor photograph from ${activeContribution.location}`}
                  fill
                  sizes="100vw"
                  src={`${API_BASE}${activeContribution.url}`}
                  unoptimized
                />
              ) : activeContribution.url && activeContribution.media_type === "video" ? (
                <video controls playsInline src={`${API_BASE}${activeContribution.url}`} />
              ) : (
                <p>{activeContribution.experience}</p>
              )}
            </div>
            <footer className="regional-gallery-preview-footer">
              <p>{activeContribution.experience}</p>
              <span>
                Shared by {activeContribution.contributor} ·{" "}
                {formatUploadDate(activeContribution.created_at)}
              </span>
              {galleryItems.length > 1 && (
                <div>
                  <button onClick={() => moveGallery(-1)} type="button">← Previous</button>
                  <span>{activeIndex + 1} / {galleryItems.length}</span>
                  <button onClick={() => moveGallery(1)} type="button">Next →</button>
                </div>
              )}
            </footer>
          </div>
        )}
      </dialog>
    </section>
  );
}
