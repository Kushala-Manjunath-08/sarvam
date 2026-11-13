"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

const API = "http://127.0.0.1:8000";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const districts = [
  { id: "dakshina-kannada", name: "Dakshina Kannada" },
  { id: "udupi", name: "Udupi" },
  { id: "uttara-kannada", name: "Uttara Kannada" },
] as const;

type DistrictId = string;
type District = { id: DistrictId; name: string };
type CommunityUpload = {
  id: string;
  district_id: DistrictId;
  contributor: string;
  caption: string;
  media_type: "image" | "video";
  url: string;
  created_at: string;
};
type GalleryFilter = "all" | "image" | "video";
type UploadResponse = {
  detail?: string;
  upload?: CommunityUpload;
  message?: string;
};

function responseError(data: UploadResponse, fallback: string) {
  return data.detail || data.message || fallback;
}

export default function KaravaliCommunityGallery() {
  const [districtList, setDistrictList] = useState<District[]>([...districts]);
  const [uploads, setUploads] = useState<CommunityUpload[]>([]);
  const [district, setDistrict] = useState("all");
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedUpload, setSelectedUpload] = useState<CommunityUpload | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | "">("");
  const [contributor, setContributor] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    async function loadUploads() {
      try {
        const districtResponse = await fetch(`${API}/api/karavali/districts`, {
          cache: "no-store",
        });
        if (!districtResponse.ok) {
          throw new Error("Could not load the Karavali district list.");
        }
        const districtData = (await districtResponse.json()) as {
          districts: District[];
        };
        if (active) setDistrictList(districtData.districts);
        const responses = await Promise.all(
          districtData.districts.map(async (item) => {
            const response = await fetch(
              `${API}/api/districts/${item.id}/community`,
              { cache: "no-store" },
            );
            if (!response.ok) {
              throw new Error(`Could not load ${item.name} media.`);
            }
            return (await response.json()) as {
              uploads?: CommunityUpload[];
            };
          }),
        );
        if (active) {
          setUploads(responses.flatMap((response) => response.uploads ?? []));
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : "Could not load community media.",
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

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!selectedUpload && !uploadOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedUpload(null);
        setUploadOpen(false);
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedUpload, uploadOpen]);

  const visibleUploads = useMemo(
    () =>
      uploads.filter(
        (upload) =>
          (district === "all" || upload.district_id === district) &&
          (filter === "all" || upload.media_type === filter),
      ),
    [district, filter, uploads],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError("");
    setUploadMessage("");
    if (!selectedDistrict || !file || !contributor.trim()) {
      setUploadError("Choose a district, enter your name, and select a photo or video.");
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
    setUploadProgress(0);

    try {
      const result = await new Promise<UploadResponse>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("POST", `${API}/api/districts/${selectedDistrict}/uploads`);
        request.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        request.onerror = () => reject(new Error("The media upload failed."));
        request.onload = () => {
          let data: UploadResponse;
          try {
            data = JSON.parse(request.responseText) as UploadResponse;
          } catch {
            reject(new Error("The server returned an invalid upload response."));
            return;
          }
          if (request.status < 200 || request.status >= 300) {
            reject(new Error(responseError(data, "The media could not be uploaded.")));
            return;
          }
          if (!data.upload) {
            reject(new Error("The server did not return the uploaded media."));
            return;
          }
          resolve(data);
        };
        request.send(formData);
      });

      const uploaded = result.upload;
      if (!uploaded) {
        throw new Error("The server did not return the uploaded media.");
      }
      setUploads((current) => [
        uploaded,
        ...current.filter((upload) => upload.id !== uploaded.id),
      ]);
      setUploadMessage(result.message || "Your media is now part of the gallery.");
      setUploadOpen(false);
      setFile(null);
      setCaption("");
      setSelectedDistrict("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "The media could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }

  const selectedIndex = selectedUpload
    ? uploads.findIndex((upload) => upload.id === selectedUpload.id)
    : -1;

  return (
    <section className="karavali-community-gallery" aria-labelledby="karavali-gallery-title">
      <header className="karavali-gallery-heading">
        <div>
          <p className="district-explorer-kicker">THE COAST, THROUGH YOUR EYES</p>
          <h2 id="karavali-gallery-title">Community field archive</h2>
          <p>
            Photographs and short films shared from Dakshina Kannada, Udupi,
            and Uttara Kannada.
          </p>
        </div>
        <button
          className="karavali-gallery-upload-trigger"
          type="button"
          onClick={() => {
            setUploadError("");
            setUploadOpen(true);
          }}
        >
          <span aria-hidden="true">＋</span> Share a photograph or film
        </button>
      </header>

      {uploadMessage && (
        <p className="karavali-inline-status" role="status">{uploadMessage}</p>
      )}
      {uploadError && !uploadOpen && (
        <p className="karavali-inline-error" role="alert">{uploadError}</p>
      )}

      <div className="karavali-gallery-toolbar">
        <div className="karavali-gallery-filters" aria-label="Filter community media">
          {(["all", "image", "video"] as const).map((value) => (
            <button
              type="button"
              key={value}
              className={filter === value ? "is-active" : ""}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {value === "all" ? "Everything" : value === "image" ? "Photographs" : "Films"}
            </button>
          ))}
        </div>
        <label className="karavali-gallery-district-filter">
          District
          <select value={district} onChange={(event) => setDistrict(event.target.value)}>
            <option value="all">All districts</option>
            {districtList.map((item) => (
              <option value={item.id} key={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p role="status">Gathering community media…</p>}
      {!loading && loadError && (
        <p className="karavali-inline-error" role="alert">{loadError}</p>
      )}
      {!loading && !loadError && visibleUploads.length === 0 && (
        <p className="karavali-gallery-empty" role="status">
          No community media matches this view yet. Share the first photograph or film.
        </p>
      )}
      {!loading && !loadError && visibleUploads.length > 0 && (
        <div className="karavali-gallery-masonry" aria-live="polite">
          {visibleUploads.map((upload, index) => {
            const uploadDistrict = districtList.find(
              (item) => item.id === upload.district_id,
            );
            return (
              <button
                type="button"
                className={`karavali-gallery-tile karavali-gallery-tile-${index % 5}`}
                key={upload.id}
                onClick={() => setSelectedUpload(upload)}
                aria-label={`Open ${upload.media_type} shared from ${uploadDistrict?.name ?? "Karavali"} by ${upload.contributor}`}
              >
                {upload.media_type === "video" ? (
                  <video
                    src={`${API}${upload.url}`}
                    muted
                    playsInline
                    preload="metadata"
                    aria-hidden="true"
                  />
                ) : (
                  <img
                    src={`${API}${upload.url}`}
                    alt=""
                    loading="lazy"
                  />
                )}
                <span className="karavali-gallery-tile-mark" aria-hidden="true">
                  {upload.media_type === "video" ? "▶" : "↗"}
                </span>
                <span className="karavali-gallery-tile-caption">
                  <span>{uploadDistrict?.name ?? "Karavali"} / {upload.contributor}</span>
                  <strong>{upload.caption || (upload.media_type === "video" ? "Community film" : "Field photograph")}</strong>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selectedUpload && (
        <div
          className="karavali-gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="karavali-gallery-lightbox-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedUpload(null);
          }}
        >
          <button
            type="button"
            className="karavali-gallery-close"
            onClick={() => setSelectedUpload(null)}
            aria-label="Close media viewer"
          >
            ×
          </button>
          {selectedUpload.media_type === "video" ? (
            <video
              className="karavali-gallery-lightbox-media"
              src={`${API}${selectedUpload.url}`}
              controls
              autoPlay
              playsInline
            />
          ) : (
            <img
              className="karavali-gallery-lightbox-media"
              src={`${API}${selectedUpload.url}`}
              alt={selectedUpload.caption || "Community photograph from Karavali"}
            />
          )}
          <div className="karavali-gallery-lightbox-caption">
            <button
              type="button"
              onClick={() =>
                setSelectedUpload(
                  selectedIndex > 0 ? uploads[selectedIndex - 1] : null,
                )
              }
              disabled={selectedIndex <= 0}
              aria-label="Previous media"
            >
              ←
            </button>
            <div>
              <h3 id="karavali-gallery-lightbox-title">
                {selectedUpload.caption || "Shared from Karavali"}
              </h3>
              <p>
                {districtList.find((item) => item.id === selectedUpload.district_id)?.name}
                {" · "}Shared by {selectedUpload.contributor}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelectedUpload(
                  selectedIndex >= 0 && selectedIndex < uploads.length - 1
                    ? uploads[selectedIndex + 1]
                    : null,
                )
              }
              disabled={selectedIndex < 0 || selectedIndex === uploads.length - 1}
              aria-label="Next media"
            >
              →
            </button>
          </div>
        </div>
      )}

      {uploadOpen && (
        <div
          className="karavali-gallery-lightbox karavali-gallery-upload-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="karavali-gallery-upload-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !uploading) setUploadOpen(false);
          }}
        >
          <section className="karavali-gallery-upload-panel">
            <button
              type="button"
              className="karavali-gallery-close"
              onClick={() => setUploadOpen(false)}
              disabled={uploading}
              aria-label="Close upload form"
            >
              ×
            </button>
            <p className="district-explorer-kicker">ADD TO THE ARCHIVE</p>
            <h2 id="karavali-gallery-upload-title">Share a moment from the coast</h2>
            <form className="community-media-form" onSubmit={handleSubmit}>
              <label>
                District
                <select
                  value={selectedDistrict}
                  onChange={(event) =>
                    setSelectedDistrict(event.target.value as DistrictId | "")
                  }
                  required
                >
                  <option value="" disabled>Select a district</option>
                  {districtList.map((item) => (
                    <option value={item.id} key={item.id}>{item.name}</option>
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
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  required
                />
                <span>JPG, PNG, WEBP, MP4, or WEBM · up to 100 MB</span>
              </label>
              {previewUrl && file && (
                <div className="karavali-upload-preview community-media-file">
                  <span>Preview: {file.name}</span>
                  {file.type.startsWith("video/") ? (
                    <video src={previewUrl} controls playsInline />
                  ) : (
                    <img src={previewUrl} alt="Selected upload preview" />
                  )}
                </div>
              )}
              {uploading && (
                <progress value={uploadProgress} max={100} aria-label="Upload progress" />
              )}
              {uploadError && (
                <p className="community-media-error" role="alert">{uploadError}</p>
              )}
              <button type="submit" disabled={uploading}>
                {uploading ? `Uploading… ${uploadProgress}%` : "Publish to the gallery"}
              </button>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
