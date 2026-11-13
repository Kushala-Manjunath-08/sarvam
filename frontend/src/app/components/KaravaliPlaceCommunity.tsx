"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

const API = "http://127.0.0.1:8000";
const MAX_FILE_SIZE = 100 * 1024 * 1024;

type PlaceMedia = {
  id: number;
  contributor: string;
  caption: string;
  media_type: "image" | "video";
  url: string;
  created_at: string;
};

type Review = {
  id: number;
  place_id: string;
  contributor: string;
  rating: number;
  review: string;
  created_at: string;
};

type ReviewResponse = {
  average_rating: number;
  total_reviews: number;
  reviews: Review[];
};

type ApiError = {
  detail?: string;
  message?: string;
};

function responseError(data: ApiError, fallback: string) {
  return data.detail || data.message || fallback;
}

function ownerTokenKey(placeId: string, reviewId: number) {
  return `sarvam:karavali:review:${placeId}:${reviewId}`;
}

export default function KaravaliPlaceCommunity({
  placeId,
}: {
  placeId: string;
}) {
  const [media, setMedia] = useState<PlaceMedia[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [contributor, setContributor] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaMessage, setMediaMessage] = useState("");
  const [mediaError, setMediaError] = useState("");

  const [reviewer, setReviewer] = useState("");
  const [rating, setRating] = useState("5");
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [ownerTokens, setOwnerTokens] = useState<Record<number, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState("5");
  const [editText, setEditText] = useState("");
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const loadCommunity = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [mediaResponse, reviewResponse] = await Promise.all([
        fetch(`${API}/api/places/${placeId}/media`, { cache: "no-store" }),
        fetch(`${API}/api/places/${placeId}/reviews`, { cache: "no-store" }),
      ]);
      const [mediaData, reviewData] = await Promise.all([
        mediaResponse.json() as Promise<{ media: PlaceMedia[] } & ApiError>,
        reviewResponse.json() as Promise<ReviewResponse & ApiError>,
      ]);
      if (!mediaResponse.ok) {
        throw new Error(responseError(mediaData, "Could not load place media."));
      }
      if (!reviewResponse.ok) {
        throw new Error(responseError(reviewData, "Could not load reviews."));
      }
      setMedia(mediaData.media);
      setReviews(reviewData.reviews);
      setAverageRating(reviewData.average_rating);
      const tokens: Record<number, string> = {};
      for (const review of reviewData.reviews) {
        const token = window.localStorage.getItem(
          ownerTokenKey(placeId, review.id),
        );
        if (token) tokens[review.id] = token;
      }
      setOwnerTokens(tokens);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load this place's community section.",
      );
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    void loadCommunity();
  }, [loadCommunity]);

  async function handleMediaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMediaError("");
    setMediaMessage("");
    if (!file || !contributor.trim()) {
      setMediaError("Enter your name and select a photo or video.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setMediaError("The maximum file size is 100 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("contributor", contributor.trim());
    formData.append("caption", caption.trim());
    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await new Promise<{ media: PlaceMedia; message?: string }>(
        (resolve, reject) => {
          const request = new XMLHttpRequest();
          request.open("POST", `${API}/api/places/${placeId}/media`);
          request.upload.onprogress = (progressEvent) => {
            if (progressEvent.lengthComputable) {
              setUploadProgress(
                Math.round((progressEvent.loaded / progressEvent.total) * 100),
              );
            }
          };
          request.onerror = () => reject(new Error("The media upload failed."));
          request.onload = () => {
            let data: { media?: PlaceMedia; message?: string } & ApiError;
            try {
              data = JSON.parse(request.responseText) as typeof data;
            } catch {
              reject(new Error("The server returned an invalid upload response."));
              return;
            }
            if (request.status < 200 || request.status >= 300) {
              reject(new Error(responseError(data, "The media could not be uploaded.")));
              return;
            }
            if (!data.media) {
              reject(new Error("The server did not return the uploaded media."));
              return;
            }
            resolve({ media: data.media, message: data.message });
          };
          request.send(formData);
        },
      );
      setMedia((current) => [result.media, ...current]);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setCaption("");
      setMediaMessage(result.message || "Your media is now visible below.");
    } catch (error) {
      setMediaError(
        error instanceof Error ? error.message : "The media could not be uploaded.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewError("");
    setReviewMessage("");
    setReviewSubmitting(true);
    const formData = new FormData();
    formData.append("contributor", reviewer.trim());
    formData.append("rating", rating);
    formData.append("review", reviewText.trim());
    try {
      const response = await fetch(`${API}/api/places/${placeId}/reviews`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        review?: Review;
        owner_token?: string;
      } & ApiError;
      if (!response.ok) {
        throw new Error(responseError(data, "Your review could not be submitted."));
      }
      if (!data.review || !data.owner_token) {
        throw new Error("The server did not return the review owner token.");
      }
      window.localStorage.setItem(
        ownerTokenKey(placeId, data.review.id),
        data.owner_token,
      );
      setReviewer("");
      setReviewText("");
      setRating("5");
      setReviewMessage("Your review has been published.");
      await loadCommunity();
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : "Your review could not be submitted.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function saveReview(reviewId: number) {
    const token = ownerTokens[reviewId];
    if (!token) return;
    setReviewError("");
    const formData = new FormData();
    formData.append("rating", editRating);
    formData.append("review", editText.trim());
    try {
      const response = await fetch(
        `${API}/api/places/${placeId}/reviews/${reviewId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const data = (await response.json()) as ApiError;
      if (!response.ok) {
        throw new Error(responseError(data, "The review could not be updated."));
      }
      setEditingId(null);
      await loadCommunity();
      setReviewMessage("Your review was updated.");
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : "The review could not be updated.",
      );
    }
  }

  async function deleteReview(reviewId: number) {
    const token = ownerTokens[reviewId];
    if (!token || !window.confirm("Delete your review? This cannot be undone.")) {
      return;
    }
    setReviewError("");
    try {
      const response = await fetch(
        `${API}/api/places/${placeId}/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = (await response.json()) as ApiError;
      if (!response.ok) {
        throw new Error(responseError(data, "The review could not be deleted."));
      }
      window.localStorage.removeItem(ownerTokenKey(placeId, reviewId));
      setOwnerTokens((current) => {
        const next = { ...current };
        delete next[reviewId];
        return next;
      });
      await loadCommunity();
      setReviewMessage("Your review was deleted.");
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : "The review could not be deleted.",
      );
    }
  }

  async function submitReport(event: FormEvent<HTMLFormElement>, reviewId: number) {
    event.preventDefault();
    setReviewError("");
    const formData = new FormData();
    formData.append(
      "reporter_id",
      window.localStorage.getItem("sarvam:karavali:reporter-id") ||
        (() => {
          const id = crypto.randomUUID();
          window.localStorage.setItem("sarvam:karavali:reporter-id", id);
          return id;
        })(),
    );
    formData.append("reason", reportReason.trim());
    try {
      const response = await fetch(
        `${API}/api/places/${placeId}/reviews/${reviewId}/report`,
        { method: "POST", body: formData },
      );
      const data = (await response.json()) as ApiError;
      if (!response.ok) {
        throw new Error(responseError(data, "The report could not be submitted."));
      }
      setReportingId(null);
      setReportReason("");
      setReviewMessage("Thank you. Your report has been sent for review.");
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : "The report could not be submitted.",
      );
    }
  }

  return (
    <section className="karavali-place-community" aria-labelledby="place-community-title">
      <header className="karavali-place-community-heading">
        <p className="district-explorer-kicker">PLACE COMMUNITY</p>
        <h2 id="place-community-title">Photos, videos &amp; visitor reviews</h2>
        <p>
          Add a place-specific photo or video, or share a review. Media appears
          below after upload.
        </p>
      </header>

      <form className="community-media-form" onSubmit={handleMediaSubmit}>
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
        <button type="submit" disabled={uploading}>
          {uploading ? `Uploading… ${uploadProgress}%` : "Upload media"}
        </button>
        {uploading && (
          <progress
            className="community-media-message"
            value={uploadProgress}
            max={100}
            aria-label="Upload progress"
          />
        )}
        {mediaMessage && (
          <p className="community-media-message" role="status">{mediaMessage}</p>
        )}
        {mediaError && (
          <p className="community-media-error" role="alert">{mediaError}</p>
        )}
      </form>

      {loading && <p role="status">Loading place community…</p>}
      {loadError && <p className="karavali-inline-error" role="alert">{loadError}</p>}

      {!loading && !loadError && (
        <div className="community-media-list" aria-live="polite">
          {media.length === 0 && <p>No photos or videos have been shared for this place yet.</p>}
          {media.map((item) => (
            <article className="community-media-item" key={item.id}>
              <div className="community-media-preview">
                {item.media_type === "video" ? (
                  <video src={`${API}${item.url}`} controls playsInline preload="metadata">
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <img
                    src={`${API}${item.url}`}
                    alt={item.caption || `Photo shared by ${item.contributor}`}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="community-media-description">
                <p className="community-media-caption">{item.caption || "Shared media"}</p>
                <p>Shared by {item.contributor} · {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="karavali-place-sections">
        <h2>Visitor reviews</h2>
        <p>
          {averageRating > 0
            ? `${averageRating.toFixed(1)} out of 5 · ${reviews.length} ${
                reviews.length === 1 ? "review" : "reviews"
              }`
            : "No reviews yet. Share the first."}
        </p>
        {reviewError && <p className="karavali-inline-error" role="alert">{reviewError}</p>}
        {reviewMessage && <p className="karavali-inline-status" role="status">{reviewMessage}</p>}
        <form className="karavali-review-form" onSubmit={handleReviewSubmit}>
          <label>
            Your name
            <input
              value={reviewer}
              onChange={(event) => setReviewer(event.target.value)}
              maxLength={80}
              required
            />
          </label>
          <label>
            Rating
            <select value={rating} onChange={(event) => setRating(event.target.value)}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>{value} / 5</option>
              ))}
            </select>
          </label>
          <label>
            Review
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              maxLength={2000}
              required
            />
          </label>
          <button type="submit" disabled={reviewSubmitting}>
            {reviewSubmitting ? "Submitting…" : "Publish review"}
          </button>
        </form>

        <ul className="karavali-review-list">
          {reviews.map((item) => (
            <li className="karavali-review-item" key={item.id}>
              <span className="karavali-place-meta">
                {item.rating} / 5 · {item.contributor} · {new Date(item.created_at).toLocaleDateString()}
              </span>
              {editingId === item.id ? (
                <form
                  className="karavali-edit-review-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void saveReview(item.id);
                  }}
                >
                  <label>
                    Rating
                    <select
                      value={editRating}
                      onChange={(event) => setEditRating(event.target.value)}
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>{value} / 5</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Review
                    <textarea
                      value={editText}
                      onChange={(event) => setEditText(event.target.value)}
                      maxLength={2000}
                      required
                    />
                  </label>
                  <div className="karavali-review-actions">
                    <button type="submit">Save changes</button>
                    <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <p>{item.review}</p>
                  <div className="karavali-review-actions">
                    {ownerTokens[item.id] && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditRating(String(item.rating));
                            setEditText(item.review);
                          }}
                        >
                          Edit my review
                        </button>
                        <button type="button" onClick={() => void deleteReview(item.id)}>
                          Delete my review
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setReportingId(reportingId === item.id ? null : item.id);
                        setReportReason("");
                      }}
                    >
                      Report
                    </button>
                  </div>
                  {reportingId === item.id && (
                    <form
                      className="karavali-report-form"
                      onSubmit={(event) => void submitReport(event, item.id)}
                    >
                      <label>
                        Why are you reporting this review?
                        <textarea
                          value={reportReason}
                          onChange={(event) => setReportReason(event.target.value)}
                          maxLength={500}
                          required
                        />
                      </label>
                      <button type="submit">Send report</button>
                    </form>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
