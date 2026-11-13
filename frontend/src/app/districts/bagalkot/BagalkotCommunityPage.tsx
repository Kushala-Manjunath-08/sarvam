"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import DistrictIllustration from "../../components/DistrictIllustration";
import {
  bengaluruDivisionDistrictNames,
  districtSlug,
  districts,
} from "../../districts";
import { bengaluruHeritageRecords } from "../bengaluruHeritageRecords";
import { bengaluruDistrictProfiles } from "../bengaluruDistrictProfiles";
import { bengaluruMediaStories } from "../bengaluruMediaStories";

const API = "http://127.0.0.1:8000";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const bagalkot = (() => {
  const district = districts.find((item) => item.name === "Bagalkot");
  if (!district) throw new Error("Bagalkot district artwork is missing.");
  return district;
})();
const bengaluruDivisionDistricts = bengaluruDivisionDistrictNames.map((name) => {
  const district = districts.find((item) => item.name === name);
  if (!district) throw new Error(`Missing artwork for ${name}.`);
  return district;
});
const bengaluruUrban = (() => {
  const district = bengaluruDivisionDistricts.find(
    (item) => item.name === "Bengaluru Urban",
  );
  if (!district) throw new Error("Bengaluru Urban district artwork is missing.");
  return district;
})();

interface HeritageRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  period: string;
  language: string[];
  source: {
    name: string;
    url: string;
  };
}

interface MediaReference {
  id: string;
  title: string;
  subject: string;
  location: string;
  catalogue_url: string;
  rights_status: string;
  availability: string;
}

interface CommunityUpload {
  id: string;
  contributor: string;
  caption: string;
  media_type: "image" | "video";
  url: string;
  created_at: string;
}

interface Feedback {
  id: string;
  contributor: string;
  message: string;
  created_at: string;
}

interface CommunityComment {
  id: number | string;
  post_id: string;
  contributor: string;
  message: string;
  created_at: string;
}

interface PostInteraction {
  likes_count: number;
  liked: boolean;
  comments: CommunityComment[];
}

interface DistrictData {
  district: {
    name: string;
    state: string;
    primary_language: string;
  };
  records: HeritageRecord[];
  media_references: MediaReference[];
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return <span className="community-avatar" aria-hidden="true">{initial}</span>;
}

export function CommunityHeritagePage({
  collection,
  districtName,
}: {
  collection: "bagalkot" | "bengaluru-division";
  districtName?: string;
}) {
  const isBengaluruDistrict = Boolean(districtName);
  const isBengaluruDivision =
    collection === "bengaluru-division" && !isBengaluruDistrict;
  const isBagalkot = collection === "bagalkot";
  const collectionName =
    districtName ?? (isBengaluruDivision ? "Bengaluru Division" : "Bagalkot");
  const collectionApiPath = collection === "bengaluru-division"
    ? "/api/regions/bengaluru-division"
    : "/api/districts/bagalkot";
  const bengaluruDistrictName = bengaluruDivisionDistrictNames.find(
    (name) => name === districtName,
  );
  const selectedDistrict = bengaluruDivisionDistricts.find(
    (district) => district.name === districtName,
  );
  const districtPosition =
    bengaluruDivisionDistricts.findIndex((district) => district.name === districtName) + 1;
  if (isBengaluruDistrict && !selectedDistrict) {
    throw new Error(`Missing Bengaluru division district: ${districtName}.`);
  }
  const featuredDistrict = selectedDistrict ?? (isBengaluruDivision ? bengaluruUrban : bagalkot);
  const visibleMediaStories = isBengaluruDistrict
    ? bengaluruMediaStories.filter((story) => story.location === districtName)
    : bengaluruMediaStories;
  const featuredMediaStory = visibleMediaStories[0];
  const districtProfile = bengaluruDistrictName
    ? bengaluruDistrictProfiles[bengaluruDistrictName]
    : undefined;
  const divisionData: DistrictData = {
    district: {
      name: "Bengaluru Division",
      state: "Karnataka",
      primary_language: "Kannada and regional languages",
    },
    records: bengaluruDivisionDistricts.map((district) => ({
      id: `bengaluru-division-${districtSlug(district.name)}`,
      title: district.name,
      category: district.region,
      description: district.tradition,
      location: district.name,
      period: "Living heritage",
      language: ["Kannada"],
      source: {
        name: `Explore ${district.name}`,
        url: `/districts/${districtSlug(district.name)}`,
      },
    })),
    media_references: [],
  };
  const districtData: DistrictData = {
    district: {
      name: collectionName,
      state: "Karnataka",
      primary_language: "Kannada",
    },
    records: bengaluruDistrictName
      ? bengaluruHeritageRecords[bengaluruDistrictName]
      : [],
    media_references: [],
  };
  const [data, setData] = useState<DistrictData | null>(null);
  const [uploads, setUploads] = useState<CommunityUpload[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [contributor, setContributor] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState("");

  const [visitorId, setVisitorId] = useState("");
  const [postInteractions, setPostInteractions] = useState<Record<string, PostInteraction>>({});
  const [socialError, setSocialError] = useState("");
  const [busyLikes, setBusyLikes] = useState<Record<string, boolean>>({});
  const [commentNames, setCommentNames] = useState<Record<string, string>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [busyComments, setBusyComments] = useState<Record<string, boolean>>({});

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ""),
    [selectedFile],
  );

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function loadPage() {
    try {
      setError("");

      const communityResponse = await fetch(
        `${API}${collectionApiPath}/community${
          selectedDistrict ? `?district_id=${districtSlug(selectedDistrict.name)}` : ""
        }`,
      );

      if (!communityResponse.ok) {
        throw new Error(`Unable to load ${collectionName} community stories.`);
      }

      const communityData: { uploads: CommunityUpload[]; feedback: Feedback[] } =
        await communityResponse.json();

      if (isBengaluruDivision) {
        setData(divisionData);
      } else if (isBengaluruDistrict) {
        setData(districtData);
      } else {
        const districtResponse = await fetch(`${API}/api/districts/bagalkot`);
        if (!districtResponse.ok) {
          throw new Error(`Unable to load ${collectionName} information.`);
        }
        setData(await districtResponse.json());
      }
      setUploads(communityData.uploads);
      setFeedback(communityData.feedback);
    } catch (loadError) {
      console.error(`${collectionName} page error:`, loadError);
      setError(
        getErrorMessage(loadError, `Unable to load ${collectionName} information.`),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage();
  }, []);

  useEffect(() => {
    try {
      const storageKey = `legacyos-${collection}-visitor`;
      let id = window.localStorage.getItem(storageKey);

      if (!id) {
        id = window.crypto.randomUUID();
        window.localStorage.setItem(storageKey, id);
      }

      setVisitorId(id);
    } catch (storageError) {
      setSocialError(
        getErrorMessage(storageError, "Browser storage is required for likes."),
      );
    }
  }, []);

  useEffect(() => {
    if (!visitorId || uploads.length === 0) {
      setPostInteractions({});
      return;
    }

    let active = true;

    async function loadPostInteractions() {
      try {
        setSocialError("");
        const results = await Promise.all(
          uploads.map(async (upload) => {
            const query = new URLSearchParams({ user_id: visitorId });
            const [likesResponse, commentsResponse] = await Promise.all([
              fetch(`${API}${collectionApiPath}/posts/${upload.id}/likes?${query}`),
              fetch(`${API}${collectionApiPath}/posts/${upload.id}/comments`),
            ]);

            if (!likesResponse.ok || !commentsResponse.ok) {
              throw new Error("Could not load likes or comments for a community post.");
            }

            const likes: { likes_count: number; liked: boolean } =
              await likesResponse.json();
            const comments: { comments: CommunityComment[] } =
              await commentsResponse.json();

            return {
              id: upload.id,
              interaction: {
                likes_count: likes.likes_count,
                liked: likes.liked,
                comments: comments.comments,
              },
            };
          }),
        );

        if (active) {
          setPostInteractions(
            Object.fromEntries(
              results.map(({ id, interaction }) => [id, interaction]),
            ),
          );
        }
      } catch (interactionError) {
        if (active) {
          setSocialError(
            getErrorMessage(interactionError, "Could not load community interactions."),
          );
        }
      }
    }

    void loadPostInteractions();
    return () => {
      active = false;
    };
  }, [uploads, visitorId]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setUploadMessage("Choose a photo or video to share.");
      return;
    }

    if (!contributor.trim()) {
      setUploadMessage("Add your name before sharing.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadMessage("The maximum file size is 100 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("contributor", contributor.trim());
    formData.append("caption", caption.trim());
    if (selectedDistrict) {
      formData.append("district_id", districtSlug(selectedDistrict.name));
    }

    setUploading(true);
    setUploadMessage("");

    try {
      const response = await fetch(`${API}${collectionApiPath}/uploads`, {
        method: "POST",
        body: formData,
      });
      const result: { detail?: string; message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || result.message || "Upload failed.");
      }

      setUploadMessage(`Your story is now part of the ${collectionName} community.`);
      setSelectedFile(null);
      setContributor("");
      setCaption("");

      const input = document.getElementById("community-file") as HTMLInputElement | null;
      if (input) input.value = "";

      await loadPage();
    } catch (uploadError) {
      setUploadMessage(getErrorMessage(uploadError, "Upload failed. Please try again."));
    } finally {
      setUploading(false);
    }
  }

  async function handleFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!feedbackName.trim() || !feedbackMessage.trim()) {
      setFeedbackStatus("Add your name and story before sharing.");
      return;
    }

    const formData = new FormData();
    formData.append("contributor", feedbackName.trim());
    formData.append("message", feedbackMessage.trim());
    if (selectedDistrict) {
      formData.append("district_id", districtSlug(selectedDistrict.name));
    }

    setSendingFeedback(true);
    setFeedbackStatus("");

    try {
      const response = await fetch(`${API}${collectionApiPath}/feedback`, {
        method: "POST",
        body: formData,
      });
      const result: { detail?: string; message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || result.message || "Could not submit your story.");
      }

      setFeedbackStatus("Thank you. Your story has been shared with the community.");
      setFeedbackName("");
      setFeedbackMessage("");
      await loadPage();
    } catch (feedbackError) {
      setFeedbackStatus(
        getErrorMessage(feedbackError, "Could not submit your story. Please try again."),
      );
    } finally {
      setSendingFeedback(false);
    }
  }

  async function toggleLike(postId: string) {
    if (!visitorId || busyLikes[postId]) return;

    setBusyLikes((current) => ({ ...current, [postId]: true }));
    setSocialError("");

    try {
      const formData = new FormData();
      formData.append("user_id", visitorId);
      const response = await fetch(
        `${API}${collectionApiPath}/posts/${postId}/like`,
        { method: "POST", body: formData },
      );
      const result: { detail?: string; liked: boolean; likes_count: number } =
        await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Could not update this like.");
      }

      setPostInteractions((current) => ({
        ...current,
        [postId]: {
          likes_count: result.likes_count,
          liked: result.liked,
          comments: current[postId]?.comments ?? [],
        },
      }));
    } catch (likeError) {
      setSocialError(getErrorMessage(likeError, "Could not update this like."));
    } finally {
      setBusyLikes((current) => ({ ...current, [postId]: false }));
    }
  }

  async function addComment(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    const name = commentNames[postId]?.trim() ?? "";
    const message = commentDrafts[postId]?.trim() ?? "";

    if (!name || !message) {
      setSocialError("Add your name and a comment before posting.");
      return;
    }

    setBusyComments((current) => ({ ...current, [postId]: true }));
    setSocialError("");

    try {
      const formData = new FormData();
      formData.append("contributor", name);
      formData.append("message", message);
      const response = await fetch(
        `${API}${collectionApiPath}/posts/${postId}/comments`,
        { method: "POST", body: formData },
      );
      const result: { detail?: string; comment?: CommunityComment } =
        await response.json();

      if (!response.ok || !result.comment) {
        throw new Error(result.detail || "Could not post your comment.");
      }

      setPostInteractions((current) => ({
        ...current,
        [postId]: {
          likes_count: current[postId]?.likes_count ?? 0,
          liked: current[postId]?.liked ?? false,
          comments: [result.comment!, ...(current[postId]?.comments ?? [])],
        },
      }));
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    } catch (commentError) {
      setSocialError(getErrorMessage(commentError, "Could not post your comment."));
    } finally {
      setBusyComments((current) => ({ ...current, [postId]: false }));
    }
  }

  function dateLabel(date: string) {
    const parsedDate = new Date(date);
    if (!Number.isFinite(parsedDate.getTime())) return "Recently shared";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="bagalkot-page">
      <header className="bagalkot-topbar">
        <Link className="bagalkot-brand" href="/">
          <span className="bagalkot-brand-mark" aria-hidden="true">L</span>
          <span>
            <strong>LEGACYOS</strong>
            <small>KARNATAKA HERITAGE</small>
          </span>
        </Link>
        <nav className="bagalkot-top-links" aria-label={`${collectionName} page links`}>
          <a className="bagalkot-about-link" href="#legacyos">About LegacyOS</a>
          <Link
            className="bagalkot-back-link"
            href={isBengaluruDistrict ? "/divisions/bengaluru#heritage" : "/search"}
          >
            <span aria-hidden="true">←</span>{" "}
            {isBengaluruDistrict
              ? "Bengaluru Division"
              : isBengaluruDivision
                ? "All regions"
                : "All districts"}
          </Link>
        </nav>
      </header>

      {loading && (
        <div className="bagalkot-loading" role="status">
          <span className="bagalkot-loading-mark" aria-hidden="true" />
          Loading {collectionName} stories…
        </div>
      )}

      {error && (
        <div className="bagalkot-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void loadPage()}>Try again</button>
        </div>
      )}

      {data && (
        <>
          <section className="bagalkot-hero">
            <div className="bagalkot-hero-glow" aria-hidden="true" />
            <div className="bagalkot-hero-copy">
              <p className="bagalkot-eyebrow">
                {isBengaluruDistrict
                  ? `KARNATAKA / BENGALURU DIVISION / ${districtName?.toUpperCase()}`
                  : isBengaluruDivision
                    ? "KARNATAKA / BENGALURU DIVISION"
                  : "KARNATAKA / NORTH KARNATAKA"}
              </p>
              <h1>{collectionName},<br />through the eyes of the people.</h1>
              <p className="bagalkot-hero-description">
                {isBengaluruDistrict
                  ? `Discover the customs, craft, and heritage of ${collectionName} through the people who know it best.`
                  : isBengaluruDivision
                    ? "Nine districts, many traditions, and stories still being written. Explore the division through the people who know it best."
                  : "Ancient stone, living craft, and stories still being written. Discover the district through the people who know it best."}
              </p>
              <p className="bagalkot-hero-slogan">
                {isBengaluruDistrict
                  ? "“One District, Many Stories”"
                  : isBengaluruDivision
                    ? "“One Division, Many Stories”"
                  : "“One District, Many Features”"}
              </p>
              <div className="bagalkot-hero-actions">
                <a className="bagalkot-button bagalkot-button-gold" href="#heritage">
                  Explore the heritage <span aria-hidden="true">↓</span>
                </a>
                <a className="bagalkot-button bagalkot-button-ghost" href="#community">
                  Meet the community
                </a>
              </div>
              <p className="bagalkot-language">
                {data.district.state} <span>·</span> {data.district.primary_language}
              </p>
            </div>
            <div className="bagalkot-hero-art" aria-hidden="true">
              <DistrictIllustration
                district={featuredDistrict}
                index={districts.indexOf(featuredDistrict)}
              />
              <span className="bagalkot-art-caption">
                {isBengaluruDivision
                  ? "BENGALURU CITY / DISTRICT HERITAGE"
                  : isBengaluruDistrict
                    ? `${collectionName.toUpperCase()} / DISTRICT HERITAGE`
                    : "ILKAL WEAVING / BADAMI CHALUKYA COUNTRY"}
              </span>
            </div>
            <div className="bagalkot-hero-index" aria-hidden="true">
              {isBengaluruDistrict
                ? `BENGALURU DIVISION / ${String(districtPosition).padStart(2, "0")} OF 09`
                : isBengaluruDivision
                  ? "KARNATAKA / 9 DISTRICTS"
                : "15°55′N 75°41′E"}
            </div>
          </section>

          <div className="bagalkot-content">
            <section className="bagalkot-stats" aria-label={`${collectionName} archive at a glance`}>
              <div className="bagalkot-stat">
                <span className="bagalkot-stat-number">{data.records.length}</span>
                <span className="bagalkot-stat-label">heritage stories</span>
              </div>
              <div className="bagalkot-stat">
                <span className="bagalkot-stat-number">{uploads.length}</span>
                <span className="bagalkot-stat-label">community posts</span>
              </div>
              <div className="bagalkot-stat">
                <span className="bagalkot-stat-number">{feedback.length}</span>
                <span className="bagalkot-stat-label">shared memories</span>
              </div>
              <p className="bagalkot-stat-note">An archive shaped by history and the people who carry it forward.</p>
            </section>

            {(isBengaluruDivision || isBengaluruDistrict) && (
              <section id="stories" className="bengaluru-media-section">
                <div className="bagalkot-section-heading">
                  <div>
                    <p className="bagalkot-kicker">
                      {isBengaluruDistrict
                        ? `${collectionName.toUpperCase()} / PHOTO STORY`
                        : "BENGALURU DIVISION / PHOTO STORIES"}
                    </p>
                    <h2>
                      {isBengaluruDistrict
                        ? `A closer look at ${collectionName}`
                        : "Places with stories to tell"}
                    </h2>
                    <p>
                      {isBengaluruDistrict
                        ? `${selectedDistrict?.tradition} Photo credit and reuse license are included.`
                        : "Explore places and traditions across the division, with image credits and reuse licenses included."}
                    </p>
                  </div>
                </div>

                <div className="bengaluru-media-grid">
                  {visibleMediaStories.map((story) => (
                    <article className="bengaluru-media-card" key={story.title}>
                      <a
                        className="bengaluru-media-image-link"
                        href={story.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View the source photo for ${story.title}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={story.image} alt={story.alt} loading="lazy" />
                      </a>
                      <div className="bengaluru-media-copy">
                        <p className="bagalkot-kicker">{story.location}</p>
                        <h3>{story.title}</h3>
                        <p>{story.caption}</p>
                        <small className="bengaluru-media-credit">
                          Photo “{story.imageTitle}” by{" "}
                          <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {story.photographer}
                          </a>{" "}
                          via Wikimedia Commons ·{" "}
                          <a
                            href={story.licenseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {story.licenseName}
                          </a>
                        </small>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="bengaluru-media-feature-row">
                  <article className="bengaluru-history-story">
                    <p className="bagalkot-kicker">
                      {isBengaluruDistrict ? "A STORY ROOTED IN PLACE" : "A HISTORY IN LAYERS"}
                    </p>
                    <h3>
                      {isBengaluruDistrict
                        ? `Living heritage in ${collectionName}`
                        : "From a planned settlement to a modern capital"}
                    </h3>
                    <p>
                      {isBengaluruDistrict
                        ? selectedDistrict?.tradition
                        : "Kempe Gowda I founded Bengaluru in 1537. The old pete and cantonment still leave their mark on the city's streets and landmarks."}
                    </p>
                    <a
                      href={
                        isBengaluruDistrict
                          ? featuredMediaStory?.sourceUrl ?? "/divisions/bengaluru#heritage"
                          : "https://karnatakatourism.org/en/destinations/bengaluru/"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {isBengaluruDistrict
                        ? "View the photo source and details"
                        : "Read the Karnataka Tourism history guide"}{" "}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </article>

                  <article className="bengaluru-video-story">
                    <div className="bengaluru-video-frame">
                      <iframe
                        src="https://www.youtube-nocookie.com/embed/ZAjd9Lh1-lA?rel=0"
                        title="Script your Adventure | Karnataka Tourism | One State, Many Worlds"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="bengaluru-video-copy">
                      <p className="bagalkot-kicker">OFFICIAL KARNATAKA TOURISM FILM</p>
                      <h3>Script your Adventure</h3>
                      <p>
                        A statewide destination film from Karnataka Tourism. For
                        Bengaluru's history, see the linked city guide.
                      </p>
                      <a
                        href="https://www.youtube.com/watch?v=ZAjd9Lh1-lA"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Watch on YouTube <span aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </article>
                </div>
              </section>
            )}

            <section id="community" className="bagalkot-community">
              <div className="bagalkot-section-heading">
                <div>
                  <p className="bagalkot-kicker">SHARED BY THE PEOPLE</p>
                  <h2>Stories from {collectionName}</h2>
                  <p>Travel notes, photographs, and moments from people who have been here.</p>
                </div>
                <a className="bagalkot-text-link" href="#share-memory">Share your story <span aria-hidden="true">↗</span></a>
              </div>

              {socialError && <p className="bagalkot-inline-error" role="status">{socialError}</p>}

              <div className="bagalkot-community-layout">
                <div className="bagalkot-feed">
                  {uploads.length === 0 ? (
                    <div className="bagalkot-empty-feed">
                      <div className="bagalkot-empty-icon" aria-hidden="true">
                        <svg viewBox="0 0 48 48">
                          <rect x="7" y="10" width="34" height="28" rx="5" />
                          <circle cx="18" cy="20" r="3" />
                          <path d="m10 33 10-9 7 6 5-4 7 8" />
                        </svg>
                      </div>
                      <p className="bagalkot-kicker">THE FIRST STORY IS YOURS</p>
                      <h3>Make the first memory.</h3>
                      <p>Share a place you loved, a detail you noticed, or a moment that stayed with you.</p>
                      <a className="bagalkot-button bagalkot-button-dark" href="#share-memory">Post a photo or video</a>
                    </div>
                  ) : (
                    uploads.map((item) => {
                      const interaction = postInteractions[item.id] ?? {
                        likes_count: 0,
                        liked: false,
                        comments: [],
                      };

                      return (
                        <article className="community-post" key={item.id}>
                          <header className="community-post-header">
                            <Avatar name={item.contributor} />
                            <div className="community-post-author">
                              <strong>{item.contributor}</strong>
                              <span>{collectionName}, Karnataka <span aria-hidden="true">·</span> {dateLabel(item.created_at)}</span>
                            </div>
                            <span className="community-post-tag">{item.media_type === "video" ? "VIDEO STORY" : "PHOTO STORY"}</span>
                          </header>

                          <div className="community-post-media">
                            {item.media_type === "video" ? (
                              <video
                                src={`${API}${item.url}`}
                                controls
                                playsInline
                                preload="metadata"
                                aria-label={`Video shared by ${item.contributor}`}
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`${API}${item.url}`}
                                alt={item.caption || `A community photo shared by ${item.contributor}`}
                                loading="lazy"
                              />
                            )}
                          </div>

                          <div className="community-post-body">
                            <div className="community-post-actions">
                              <button
                                className={`community-like-button${interaction.liked ? " is-liked" : ""}`}
                                type="button"
                                aria-pressed={interaction.liked}
                                disabled={!visitorId || busyLikes[item.id]}
                                onClick={() => void toggleLike(item.id)}
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M20.8 8.7c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z" />
                                </svg>
                                {interaction.likes_count} {interaction.likes_count === 1 ? "like" : "likes"}
                              </button>
                              <span className="community-comment-count">
                                {interaction.comments.length} {interaction.comments.length === 1 ? "comment" : "comments"}
                              </span>
                            </div>
                            {item.caption && (
                              <p className="community-post-caption">
                                <strong>{item.contributor}</strong> {item.caption}
                              </p>
                            )}

                            {interaction.comments.length > 0 && (
                              <div className="community-comments">
                                {interaction.comments.slice(0, 3).map((comment) => (
                                  <p key={comment.id}>
                                    <strong>{comment.contributor}</strong> {comment.message}
                                  </p>
                                ))}
                              </div>
                            )}

                            <form
                              className="community-comment-form"
                              onSubmit={(event) => void addComment(event, item.id)}
                            >
                              <input
                                aria-label={`Your name for a comment on ${item.contributor}'s post`}
                                value={commentNames[item.id] ?? ""}
                                onChange={(event) => setCommentNames((current) => ({
                                  ...current,
                                  [item.id]: event.target.value,
                                }))}
                                maxLength={80}
                                placeholder="Your name"
                              />
                              <input
                                aria-label={`Comment on ${item.contributor}'s post`}
                                value={commentDrafts[item.id] ?? ""}
                                onChange={(event) => setCommentDrafts((current) => ({
                                  ...current,
                                  [item.id]: event.target.value,
                                }))}
                                maxLength={1000}
                                placeholder="Add a thoughtful comment..."
                              />
                              <button type="submit" disabled={busyComments[item.id]}>
                                {busyComments[item.id] ? "Posting..." : "Post"}
                              </button>
                            </form>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>

                <aside className="bagalkot-share-column">
                  <form id="share-memory" className="bagalkot-share-card" onSubmit={handleUpload}>
                    <div className="bagalkot-share-card-heading">
                      <Avatar name={contributor || "You"} />
                      <div>
                        <p className="bagalkot-kicker">ADD TO THE ARCHIVE</p>
                        <h3>Share a moment</h3>
                      </div>
                    </div>
                    <p className="bagalkot-share-intro">
                      A photo, a short video, or the story behind it. Your visit can
                      help someone else see {collectionName} differently.
                    </p>

                    <label className="bagalkot-field-label" htmlFor="community-name">Your name</label>
                    <input
                      id="community-name"
                      className="bagalkot-input"
                      value={contributor}
                      onChange={(event) => setContributor(event.target.value)}
                      maxLength={80}
                      required
                      placeholder="How should we credit you?"
                    />

                    <label className="bagalkot-file-picker" htmlFor="community-file">
                      <span className="bagalkot-file-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="M12 16V4m0 0L7 9m5-5 5 5M4 16v4h16v-4" />
                        </svg>
                      </span>
                      <span>
                        <strong>{selectedFile ? selectedFile.name : "Choose a photo or video"}</strong>
                        <small>JPG, PNG, WebP, MP4 or WebM · up to 100 MB</small>
                      </span>
                      <input
                        id="community-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                        required
                        onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                      />
                    </label>

                    {previewUrl && selectedFile && (
                      <div className="bagalkot-upload-preview">
                        {selectedFile.type.startsWith("video/") ? (
                          <video src={previewUrl} controls playsInline aria-label="Video preview" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={previewUrl} alt="Preview of your selected upload" />
                        )}
                      </div>
                    )}

                    <label className="bagalkot-field-label" htmlFor="community-caption">Tell the story</label>
                    <textarea
                      id="community-caption"
                      className="bagalkot-input bagalkot-textarea"
                      value={caption}
                      onChange={(event) => setCaption(event.target.value)}
                      maxLength={500}
                      rows={4}
                      placeholder="Where was this? What should people notice?"
                    />

                    <button className="bagalkot-submit-button" type="submit" disabled={uploading}>
                      {uploading ? "Sharing your story..." : "Share with the community"}
                      {!uploading && <span aria-hidden="true">↗</span>}
                    </button>
                    {uploadMessage && <p className="bagalkot-form-status" role="status">{uploadMessage}</p>}
                    <p className="bagalkot-rights-note">Only share photos and videos you own or have permission to post.</p>
                  </form>

                  <div className="bagalkot-prompt-card">
                    <p className="bagalkot-kicker">A GOOD STORY STARTS WITH</p>
                    <ul>
                      <li>The name of the place</li>
                      <li>What made you pause</li>
                      <li>A detail locals might recognize</li>
                    </ul>
                  </div>
                </aside>
              </div>
            </section>

            <section className="bagalkot-voices">
              <div className="bagalkot-section-heading">
                <div>
                  <p className="bagalkot-kicker">WORDS THAT STAY</p>
                  <h2>Notes from the community</h2>
                  <p>Memories, local knowledge, and thoughtful corrections shared by visitors and residents.</p>
                </div>
              </div>

              <div className="bagalkot-voices-layout">
                <div className="bagalkot-feedback-list">
                  {feedback.length === 0 ? (
                    <div className="bagalkot-note-empty">
                      <span aria-hidden="true">“</span>
                      <p>
                        Have a memory of {collectionName} without a photo? Leave the
                        first note for the next traveler.
                      </p>
                    </div>
                  ) : (
                    feedback.map((item) => (
                      <article className="bagalkot-feedback-card" key={item.id}>
                        <Avatar name={item.contributor} />
                        <div>
                          <div className="bagalkot-feedback-meta">
                            <strong>{item.contributor}</strong>
                            <span>{dateLabel(item.created_at)}</span>
                          </div>
                          <p>{item.message}</p>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <form className="bagalkot-note-form" onSubmit={handleFeedback}>
                  <p className="bagalkot-kicker">YOUR WORDS BELONG HERE</p>
                  <h3>Leave a note</h3>
                  <label className="bagalkot-field-label" htmlFor="feedback-name">Your name</label>
                  <input
                    id="feedback-name"
                    className="bagalkot-input"
                    value={feedbackName}
                    onChange={(event) => setFeedbackName(event.target.value)}
                    maxLength={80}
                    required
                    placeholder="Your name"
                  />
                  <label className="bagalkot-field-label" htmlFor="feedback-message">Your memory or local knowledge</label>
                  <textarea
                    id="feedback-message"
                    className="bagalkot-input bagalkot-textarea"
                    value={feedbackMessage}
                    onChange={(event) => setFeedbackMessage(event.target.value)}
                    maxLength={2000}
                    rows={4}
                    required
                    placeholder="Tell us what you remember or what visitors should know..."
                  />
                  <button className="bagalkot-submit-button bagalkot-submit-light" type="submit" disabled={sendingFeedback}>
                    {sendingFeedback ? "Sharing..." : "Share your note"}
                  </button>
                  {feedbackStatus && <p className="bagalkot-form-status" role="status">{feedbackStatus}</p>}
                </form>
              </div>
            </section>

            <section id="heritage" className="bagalkot-heritage">
              <div className="bagalkot-section-heading">
                <div>
                  <p className="bagalkot-kicker">
                    {isBengaluruDistrict
                      ? `${collectionName.toUpperCase()} / SPECIAL PLACES`
                      : "THE PLACES THAT SHAPE US"}
                  </p>
                  <h2>
                    {isBengaluruDivision
                      ? "Explore the division’s district stories"
                      : isBengaluruDistrict
                        ? `Special places in ${collectionName}`
                      : `Explore ${collectionName}’s heritage`}
                  </h2>
                  <p>
                    {isBengaluruDivision
                      ? "Explore all nine district profiles and share the traditions that connect them."
                      : isBengaluruDistrict
                        ? "Source-linked landmarks and places, alongside the memories of the people who know this district."
                        : "Source-documented records, kept alongside the memories of the people who know these places."}
                  </p>
                </div>
              </div>

              <div className="bagalkot-heritage-grid">
                {data.records.map((record, index) => (
                  <article className="bagalkot-heritage-card" key={record.id}>
                    <div className="bagalkot-record-topline">
                      <span className="bagalkot-record-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="bagalkot-record-category">{record.category}</span>
                    </div>
                    <h3>{record.title}</h3>
                    <p className="bagalkot-record-description">{record.description}</p>
                    <div className="bagalkot-record-details">
                      <span>{record.location}</span>
                      <span>{record.period}</span>
                    </div>
                    <a
                      href={record.source.url}
                      target={!isBengaluruDivision ? "_blank" : undefined}
                      rel={!isBengaluruDivision ? "noopener noreferrer" : undefined}
                    >
                      {isBengaluruDivision
                        ? record.source.name
                        : `Source: ${record.source.name}`}{" "}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </article>
                ))}
              </div>
            </section>

            {isBengaluruDistrict && districtProfile && (
              <section className="bagalkot-living-culture">
                <div className="bagalkot-section-heading">
                  <div>
                    <p className="bagalkot-kicker">LIFE, FOOD, AND PLACE</p>
                    <h2>More than monuments</h2>
                    <p>
                      Explore the landmarks, flavours, and local knowledge that make
                      {` ${collectionName}`} distinctive. Food and customs vary between
                      families and taluks; share your own memories with the community.
                    </p>
                  </div>
                </div>

                <div className="bagalkot-living-grid">
                  <article className="bagalkot-tagline-card">
                    <p className="bagalkot-kicker">DISTRICT LIFE</p>
                    <h3>Local practices</h3>
                    <ul className="bagalkot-crop-list">
                      {districtProfile.practices.map((practice) => (
                        <li key={practice}>{practice}</li>
                      ))}
                    </ul>
                  </article>

                  <article className="bagalkot-living-card">
                    <p className="bagalkot-kicker">LOCAL FOOD</p>
                    <h3>Flavours from {collectionName}</h3>
                    <ul className="bagalkot-food-list">
                      {districtProfile.foods.map((food) => (
                        <li key={food.name}>
                          <strong>{food.name}</strong>
                          <span>{food.description}</span>
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className="bagalkot-living-card bagalkot-agriculture-card">
                    <p className="bagalkot-kicker">CULTURE AND LOCAL KNOWLEDGE</p>
                    <h3>Life shaped by place</h3>
                    <p>{districtProfile.localKnowledge}</p>
                  </article>
                </div>
              </section>
            )}

            {isBagalkot && (
              <section className="bagalkot-living-culture">
              <div className="bagalkot-section-heading">
                <div>
                  <p className="bagalkot-kicker">LIFE, FOOD, AND SOIL</p>
                  <h2>More than monuments</h2>
                  <p>Discover the words, meals, and farming knowledge that make this district feel like home.</p>
                </div>
              </div>

              <div className="bagalkot-living-grid">
                <article className="bagalkot-tagline-card">
                  <p className="bagalkot-kicker">DISTRICT PORTAL TAGLINE</p>
                  <h3>One District,<br />Many Features.</h3>
                  <p>A phrase featured by the Bagalkot District Administration.</p>
                  <a href="https://bagalkot.nic.in/en/" target="_blank" rel="noopener noreferrer">
                    Visit the district portal <span aria-hidden="true">↗</span>
                  </a>
                </article>

                <article className="bagalkot-living-card">
                  <p className="bagalkot-kicker">NORTH KARNATAKA FOOD</p>
                  <h3>Flavours from the region</h3>
                  <ul className="bagalkot-food-list">
                    <li>
                      <strong>Jolada rotti</strong>
                      <span>A hearty flatbread made from jowar (sorghum) flour.</span>
                    </li>
                    <li>
                      <strong>Ennegayi</strong>
                      <span>Brinjal stuffed with a fragrant, spiced filling.</span>
                    </li>
                    <li>
                      <strong>Shenga chutney</strong>
                      <span>A punchy peanut chutney often served alongside rotti.</span>
                    </li>
                  </ul>
                  <p className="bagalkot-culture-note">
                    Recipes and names vary between families and villages. Share your
                    family’s version in the community feed.
                  </p>
                </article>

                <article className="bagalkot-living-card bagalkot-agriculture-card">
                  <p className="bagalkot-kicker">AGRICULTURE AND LOCAL KNOWLEDGE</p>
                  <h3>What can grow here?</h3>
                  <p>
                    North Karnataka farms grow hardy grains and pulses, with other
                    crops depending on local water and soil conditions. Crops to ask
                    Bagalkot farmers about include:
                  </p>
                  <ul className="bagalkot-crop-list" aria-label="Regional crop examples">
                    <li>Jowar (sorghum)</li>
                    <li>Chickpea</li>
                    <li>Pigeon pea</li>
                    <li>Groundnut</li>
                    <li>Cotton</li>
                    <li>Sugarcane in irrigated areas</li>
                  </ul>
                  <p className="bagalkot-culture-note">
                    These are regional examples, not planting advice. Crop choice
                    depends on taluk, season, soil, rainfall, and irrigation; check
                    current local guidance before planting.
                  </p>
                  <a href="https://bagalkot.nic.in/en/agriculture-department/" target="_blank" rel="noopener noreferrer">
                    District Agriculture Department <span aria-hidden="true">↗</span>
                  </a>
                </article>
              </div>
              </section>
            )}

            {data.media_references.length > 0 && (
              <section className="bagalkot-resources">
              <div className="bagalkot-section-heading">
                <div>
                  <p className="bagalkot-kicker">KEEP EXPLORING</p>
                  <h2>Documentaries and references</h2>
                  <p>Catalogue references for heritage-related media; availability and reuse rights vary by source.</p>
                </div>
              </div>
              <div className="bagalkot-resource-grid">
                {data.media_references.map((media) => (
                  <article className="bagalkot-resource-card" key={media.id}>
                    <span className="bagalkot-resource-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path d="m9 6 10 6-10 6z" /></svg>
                    </span>
                    <p className="bagalkot-kicker">{media.location} / {media.availability.replaceAll("_", " ")}</p>
                    <h3>{media.title}</h3>
                    <p>{media.subject}</p>
                    <a href={media.catalogue_url} target="_blank" rel="noopener noreferrer">
                      Visit media catalogue <span aria-hidden="true">↗</span>
                    </a>
                    <small>Rights: {media.rights_status.replaceAll("_", " ")}</small>
                  </article>
                ))}
              </div>
              </section>
            )}

            <section id="legacyos" className="legacyos-overview">
              <div className="legacyos-intro">
                <p className="bagalkot-kicker">THE IDEA BEHIND LEGACYOS</p>
                <h2>Human knowledge should outlive us.</h2>
                <p>
                  When elders, farmers, teachers, artisans, and local experts pass away,
                  their knowledge can disappear with them. Valuable stories, cultural
                  traditions, farming practices, life lessons, and regional wisdom are
                  rarely documented in structured digital formats.
                </p>
              </div>

              <div className="legacyos-purpose-grid">
                <article className="legacyos-purpose-card legacyos-purpose-featured">
                  <span className="legacyos-card-number">01 / VISION</span>
                  <h3>A living record of human experience</h3>
                  <p>
                    Build LegacyOS as an AI-powered Human Knowledge Preservation System
                    that captures, structures, preserves, and transfers human
                    experiences to future generations.
                  </p>
                </article>
                <article className="legacyos-purpose-card">
                  <span className="legacyos-card-number">02 / CORE CONCEPT</span>
                  <h3>From a conversation to lasting knowledge</h3>
                  <p>
                    Interview individuals, record their stories, extract wisdom, build
                    a knowledge graph, and let future generations search and interact
                    with the preserved knowledge.
                  </p>
                </article>
                <article className="legacyos-purpose-card">
                  <span className="legacyos-card-number">03 / INNOVATION</span>
                  <h3>Answers grounded in real lives</h3>
                  <p>
                    Unlike chatbots that provide generic answers, LegacyOS aims to
                    preserve unique human experiences that are unavailable anywhere on
                    the internet.
                  </p>
                </article>
              </div>

              <div className="legacyos-details-grid">
                <article className="legacyos-detail-card legacyos-audience-card">
                  <p className="bagalkot-kicker">WHO IT’S FOR</p>
                  <h3>Knowledge belongs to everyone.</h3>
                  <ul className="legacyos-audience-list">
                    <li>Families</li>
                    <li>Villages</li>
                    <li>Farmers</li>
                    <li>Schools</li>
                    <li>Historians</li>
                    <li>Cultural organizations</li>
                    <li>Governments</li>
                    <li>NGOs</li>
                  </ul>
                </article>
              </div>

              <div className="legacyos-story-grid">
                <article className="legacyos-story-card">
                  <p className="bagalkot-kicker">A POSSIBLE MEMORY</p>
                  <h3>A grandparent shares a lifetime of farming.</h3>
                  <p>
                    LegacyOS could preserve crop strategies, mistakes, lessons learned,
                    village events, and personal stories—then help a future visitor
                    query those memories naturally.
                  </p>
                </article>
                <article className="legacyos-story-card legacyos-impact-card">
                  <p className="bagalkot-kicker">SOCIAL IMPACT</p>
                  <h3>Protect the knowledge that makes each place unique.</h3>
                  <p>
                    Preserve endangered languages, cultural heritage, local knowledge,
                    traditional agriculture practices, and family history.
                  </p>
                </article>
              </div>

              <div className="legacyos-roadmap">
                <article>
                  <p className="bagalkot-kicker">BUSINESS POTENTIAL</p>
                  <p>
                    Family subscriptions; institutional plans for schools and museums;
                    government cultural archiving solutions; and village knowledge
                    repositories.
                  </p>
                </article>
                <article>
                  <p className="bagalkot-kicker">HACKATHON MVP</p>
                  <p>
                    A user interview recorder, transcription module, knowledge
                    extraction, memory graph visualization, and conversational
                    querying.
                  </p>
                </article>
                <article>
                  <p className="bagalkot-kicker">FUTURE ROADMAP</p>
                  <p>
                    Digital humans, a heritage metaverse, AI memory museums, village
                    archives, and lifelong personal knowledge vaults.
                  </p>
                </article>
              </div>

              <p className="legacyos-vision-note">
                This is the LegacyOS vision. The {collectionName} community archive
                is where people can begin sharing stories today.
              </p>
            </section>
          </div>

          <footer className="bagalkot-footer">
            <Link className="bagalkot-brand" href="/">
              <span className="bagalkot-brand-mark" aria-hidden="true">L</span>
              <span><strong>LEGACYOS</strong><small>WISDOM, PASSED FORWARD</small></span>
            </Link>
            <p>Every place is richer when its people can tell the story.</p>
            <Link href="/search">
              Explore other Karnataka regions <span aria-hidden="true">↗</span>
            </Link>
          </footer>
        </>
      )}
    </main>
  );
}

export default function BagalkotCommunityPage() {
  return <CommunityHeritagePage collection="bagalkot" />;
}
