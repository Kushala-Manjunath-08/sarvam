
"use client";

import { useEffect, useState, type FormEvent } from "react";

const API = "http://127.0.0.1:8000";

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

interface DistrictData {
  district: {
    name: string;
    state: string;
    primary_language: string;
  };
  records: HeritageRecord[];
  media_references: MediaReference[];
  future_research: string[];
}

export default function BagalkotPage() {
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

  async function loadPage() {
    try {
      setError("");

      const [districtResponse, communityResponse] = await Promise.all([
        fetch(`${API}/api/districts/bagalkot`),
        fetch(`${API}/api/districts/bagalkot/community`)
      ]);

      if (!districtResponse.ok || !communityResponse.ok) {
        throw new Error("Unable to load Bagalkot information.");
      }

      const districtData: DistrictData = await districtResponse.json();
      const communityData = await communityResponse.json();

      setData(districtData);
      setUploads(communityData.uploads);
      setFeedback(communityData.feedback);
    } catch (error) {
      console.error("BAGALKOT ERROR:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPage();
  }, []);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setUploadMessage("Please choose a photo or video first.");
      return;
    }

    if (!contributor.trim()) {
      setUploadMessage("Please enter your name.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("contributor", contributor);
    formData.append("caption", caption);

    setUploading(true);
    setUploadMessage("");

    try {
      const response = await fetch(
        `${API}/api/districts/bagalkot/uploads`,
        {
          method: "POST",
          body: formData
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Upload failed.");
      }

      setUploadMessage("Your contribution has been published!");
      setSelectedFile(null);
      setCaption("");

      const input = document.getElementById(
        "community-file"
      ) as HTMLInputElement | null;

      if (input) input.value = "";

      await loadPage();
    } catch (error) {
      setUploadMessage(
        error instanceof Error ? error.message : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!feedbackName.trim() || !feedbackMessage.trim()) {
      setFeedbackStatus("Please fill in both fields.");
      return;
    }

    const formData = new FormData();
    formData.append("contributor", feedbackName);
    formData.append("message", feedbackMessage);

    setSendingFeedback(true);
    setFeedbackStatus("");

    try {
      const response = await fetch(
        `${API}/api/districts/bagalkot/feedback`,
        {
          method: "POST",
          body: formData
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Could not submit feedback.");
      }

      setFeedbackStatus("Thank you! Your feedback is now visible.");
      setFeedbackName("");
      setFeedbackMessage("");

      await loadPage();
    } catch (error) {
      setFeedbackStatus(
        error instanceof Error ? error.message : "Could not submit feedback."
      );
    } finally {
      setSendingFeedback(false);
    }
  }

  const dateLabel = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

  return (
    <main className="min-h-screen bg-[#f5f0e6] text-[#30271d]">
      <nav className="flex items-center justify-between border-b border-[#d9cbb4] px-5 py-5 md:px-12">
        <a
          href="/"
          className="text-xl font-bold tracking-[0.18em] text-[#77552c]"
        >
          LEGACYOS
        </a>

        <a
          href="/search"
          className="text-sm font-medium text-[#765b3d] hover:text-[#a16d32]"
        >
          â† All districts
        </a>
      </nav>

      {loading && (
        <div className="px-6 py-24 text-center">
          Loading Bagalkot heritage...
        </div>
      )}

      {error && (
        <div className="mx-auto my-10 max-w-3xl rounded-xl border border-red-300 bg-red-50 p-5 text-red-800">
          {error}
          <button
            onClick={loadPage}
            className="ml-3 underline"
          >
            Retry
          </button>
        </div>
      )}

      {data && (
        <>
          {/* HERO */}
          <section className="relative overflow-hidden bg-[#211b16] px-6 py-24 text-white md:px-16 md:py-36">
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />

            <div className="relative mx-auto max-w-6xl">
              <p className="mb-5 text-xs font-semibold tracking-[0.35em] text-[#dfbd83]">
                LEGACYOS Â· KARNATAKA HERITAGE
              </p>

              <h1 className="max-w-3xl text-5xl font-semibold leading-tight md:text-7xl">
                Discover {data.district.name}.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#e7dccb]">
                Every monument holds a story. Every tradition carries
                knowledge. Every person is a keeper of memories.
              </p>

              <p className="mt-5 text-sm tracking-wider text-[#dfbd83]">
                {data.district.state} Â· {data.district.primary_language}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#heritage"
                  className="rounded-full bg-[#c59a5b] px-7 py-3 font-semibold text-[#211b16] hover:bg-[#dfbd83]"
                >
                  Explore heritage
                </a>

                <a
                  href="#contribute"
                  className="rounded-full border border-white/50 px-7 py-3 font-semibold hover:bg-white/10"
                >
                  Share your memories
                </a>
              </div>
            </div>
          </section>

          {/* INTRODUCTION */}
          <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
            <p className="text-xs font-bold tracking-[0.3em] text-[#a07843]">
              THE DISTRICT
            </p>

            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              A living archive of Bagalkot
            </h2>

            <p className="mt-5 max-w-3xl leading-8 text-[#746655]">
              Explore the history, architecture, spiritual heritage and
              traditions of Bagalkot. LEGACYOS brings documented records
              together with memories and knowledge shared by local communities.
            </p>

            <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                [String(data.records.length), "Heritage records"],
                [String(data.media_references.length), "Media references"],
                [String(uploads.length), "Community contributions"]
              ].map(([number, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#dfd3c1] bg-[#fbf8f1] p-6"
                >
                  <p className="text-4xl font-semibold text-[#906b3d]">
                    {number}
                  </p>
                  <p className="mt-2 text-sm text-[#766a5b]">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* HERITAGE */}
          <section id="heritage" className="bg-[#ebe3d5] px-6 py-16 md:px-10">
            <div className="mx-auto max-w-6xl">
              <p className="text-xs font-bold tracking-[0.3em] text-[#a07843]">
                EXPLORE THE PAST
              </p>

              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
                Heritage and stories
              </h2>

              <div className="mt-9 grid gap-5 md:grid-cols-2">
                {data.records.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-2xl border border-[#d9cbb7] bg-[#faf7f0] p-6 shadow-sm"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-[#a07843]">
                      {record.category}
                    </p>

                    <h3 className="mt-3 text-xl font-semibold">
                      {record.title}
                    </h3>

                    <p className="mt-4 leading-7 text-[#756858]">
                      {record.description}
                    </p>

                    <div className="mt-5 space-y-1 text-sm text-[#766a5b]">
                      <p>
                        <strong>Location:</strong> {record.location}
                      </p>
                      <p>
                        <strong>Period:</strong> {record.period}
                      </p>
                      <p>
                        <strong>Languages:</strong> {record.language.join(", ")}
                      </p>
                    </div>

                    <a
                      href={record.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-block text-sm font-semibold text-[#936a37] underline"
                    >
                      Read source: {record.source.name}
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* DOCUMENTARY REFERENCES */}
          <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
            <p className="text-xs font-bold tracking-[0.3em] text-[#a07843]">
              WATCH AND DISCOVER
            </p>

            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              Documentaries and media references
            </h2>

            <p className="mt-4 max-w-3xl text-[#766a5b]">
              These are catalogue references for heritage-related media.
              They are not confirmed playable videos.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {data.media_references.map((media) => (
                <article
                  key={media.id}
                  className="rounded-2xl border border-[#dfd3c1] bg-[#fbf8f1] p-6"
                >
                  <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-[#e8ddca]">
                    <span className="text-4xl">â–¶</span>
                  </div>

                  <h3 className="text-lg font-semibold">{media.title}</h3>
                  <p className="mt-2 text-sm text-[#766a5b]">
                    {media.subject}
                  </p>
                  <p className="mt-2 text-sm text-[#766a5b]">
                    Location: {media.location}
                  </p>

                  <p className="mt-3 text-xs text-[#936a37]">
                    {media.availability}
                  </p>

                  <a
                    href={media.catalogue_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm font-semibold underline"
                  >
                    Visit media catalogue â†’
                  </a>

                  <p className="mt-3 text-xs text-[#8b6250]">
                    Rights: {media.rights_status}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* COMMUNITY GALLERY */}
          <section className="bg-[#211b16] px-6 py-16 text-white md:px-10">
            <div className="mx-auto max-w-6xl">
              <p className="text-xs font-bold tracking-[0.3em] text-[#dfbd83]">
                SHARED BY THE PEOPLE
              </p>

              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
                Community memories
              </h2>

              <p className="mt-4 text-[#d0c2af]">
                Photos, videos and moments contributed by people connected
                to Bagalkot.
              </p>

              {uploads.length === 0 ? (
                <div className="mt-9 rounded-2xl border border-white/20 p-10 text-center text-[#d0c2af]">
                  No community contributions yet. Be the first to share a
                  memory of Bagalkot.
                </div>
              ) : (
                <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {uploads.map((item) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl bg-[#342a20]"
                    >
                      {item.media_type === "video" ? (
                        <video
                          src={`${API}${item.url}`}
                          controls
                          playsInline
                          preload="metadata"
                          className="aspect-video w-full bg-black object-contain"
                        />
                      ) : (
                        <img
                          src={`${API}${item.url}`}
                          alt={item.caption || "Community contribution"}
                          className="aspect-video w-full object-cover"
                        />
                      )}

                      <div className="p-5">
                        <p className="font-semibold">{item.contributor}</p>
                        <p className="mt-2 text-sm text-[#d0c2af]">
                          {item.caption}
                        </p>
                        <p className="mt-3 text-xs text-[#dfbd83]">
                          {dateLabel(item.created_at)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* UPLOAD */}
          <section id="contribute" className="px-6 py-16 md:px-10">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
              <div>
                <p className="text-xs font-bold tracking-[0.3em] text-[#a07843]">
                  YOUR STORY MATTERS
                </p>

                <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
                  Share your Bagalkot
                </h2>

                <p className="mt-5 leading-8 text-[#766a5b]">
                  Have a photograph of an old tradition? A video of a
                  festival? A memory shared by your grandparents? Contribute
                  it to the growing LEGACYOS community archive.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-[#766a5b]">
                  <li>â€¢ Upload JPG, PNG or WebP photographs.</li>
                  <li>â€¢ Upload MP4 or WebM videos and short reels.</li>
                  <li>â€¢ Add your name and a description.</li>
                  <li>â€¢ Only share material you own or have permission to share.</li>
                </ul>
              </div>

              <form
                onSubmit={handleUpload}
                className="rounded-2xl border border-[#dfd3c1] bg-[#fbf8f1] p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold">Upload a memory</h3>

                <label className="mt-5 block text-sm font-semibold">
                  Your name
                  <input
                    value={contributor}
                    onChange={(event) => setContributor(event.target.value)}
                    maxLength={80}
                    required
                    className="mt-2 w-full rounded-xl border border-[#d9cbb7] bg-white p-3 outline-none focus:border-[#a07843]"
                    placeholder="Enter your name"
                  />
                </label>

                <label className="mt-5 block text-sm font-semibold">
                  Photo or video
                  <input
                    id="community-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                    required
                    onChange={(event) =>
                      setSelectedFile(event.target.files?.[0] || null)
                    }
                    className="mt-2 block w-full rounded-xl border border-[#d9cbb7] bg-white p-3 text-sm"
                  />
                </label>

                <p className="mt-2 text-xs text-[#766a5b]">
                  Maximum file size: 100 MB.
                </p>

                <label className="mt-5 block text-sm font-semibold">
                  Caption or story
                  <textarea
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                    maxLength={500}
                    rows={4}
                    className="mt-2 w-full rounded-xl border border-[#d9cbb7] bg-white p-3 outline-none focus:border-[#a07843]"
                    placeholder="Tell us about this photograph or video..."
                  />
                </label>

                <button
                  type="submit"
                  disabled={uploading}
                  className="mt-6 w-full rounded-full bg-[#8a6337] px-6 py-3 font-semibold text-white hover:bg-[#6f4d2b] disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Share contribution"}
                </button>

                {uploadMessage && (
                  <p role="status" className="mt-4 text-sm">
                    {uploadMessage}
                  </p>
                )}
              </form>
            </div>
          </section>

          {/* FEEDBACK */}
          <section className="bg-[#ebe3d5] px-6 py-16 md:px-10">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
              <div>
                <p className="text-xs font-bold tracking-[0.3em] text-[#a07843]">
                  COMMUNITY VOICES
                </p>

                <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
                  Memories and feedback
                </h2>

                <p className="mt-4 leading-8 text-[#766a5b]">
                  Share a memory, add local knowledge, suggest a correction
                  or tell us what should be preserved for future generations.
                </p>
              </div>

              <form
                onSubmit={handleFeedback}
                className="rounded-2xl border border-[#d9cbb7] bg-[#fbf8f1] p-6"
              >
                <h3 className="text-xl font-semibold">Share your thoughts</h3>

                <label className="mt-5 block text-sm font-semibold">
                  Your name
                  <input
                    value={feedbackName}
                    onChange={(event) => setFeedbackName(event.target.value)}
                    maxLength={80}
                    required
                    className="mt-2 w-full rounded-xl border border-[#d9cbb7] bg-white p-3"
                    placeholder="Enter your name"
                  />
                </label>

                <label className="mt-5 block text-sm font-semibold">
                  Your memory or feedback
                  <textarea
                    value={feedbackMessage}
                    onChange={(event) => setFeedbackMessage(event.target.value)}
                    maxLength={2000}
                    rows={5}
                    required
                    className="mt-2 w-full rounded-xl border border-[#d9cbb7] bg-white p-3"
                    placeholder="Write your story or feedback..."
                  />
                </label>

                <button
                  type="submit"
                  disabled={sendingFeedback}
                  className="mt-6 w-full rounded-full bg-[#8a6337] px-6 py-3 font-semibold text-white hover:bg-[#6f4d2b] disabled:opacity-50"
                >
                  {sendingFeedback ? "Sending..." : "Share feedback"}
                </button>

                {feedbackStatus && (
                  <p role="status" className="mt-4 text-sm">
                    {feedbackStatus}
                  </p>
                )}
              </form>
            </div>

            <div className="mx-auto mt-12 max-w-6xl">
              <h3 className="text-2xl font-semibold">
                Community feedback
              </h3>

              {feedback.length === 0 ? (
                <p className="mt-5 text-[#766a5b]">
                  No feedback yet. Be the first to share your thoughts.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {feedback.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-[#d9cbb7] bg-[#fbf8f1] p-5"
                    >
                      <p className="font-semibold">{item.contributor}</p>
                      <p className="mt-3 leading-7 text-[#766a5b]">
                        {item.message}
                      </p>
                      <p className="mt-3 text-xs text-[#936a37]">
                        {dateLabel(item.created_at)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="bg-[#211b16] px-6 py-10 text-center text-sm text-[#d0c2af]">
            <p className="font-bold tracking-[0.2em] text-[#dfbd83]">
              LEGACYOS
            </p>
            <p className="mt-3">
              Preserving human wisdom beyond generations.
            </p>
            <a href="/search" className="mt-4 inline-block underline">
              Explore other Karnataka districts
            </a>
          </footer>
        </>
      )}
    </main>
  );
}

