"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  regionCategories,
  type RegionCategoryItem,
} from "../region-content";

const API = "http://127.0.0.1:8000";
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const districts = [
  { id: "dakshina-kannada", name: "Dakshina Kannada" },
  { id: "udupi", name: "Udupi" },
  { id: "uttara-kannada", name: "Uttara Kannada" },
];

type Contribution = {
  id: number;
  title: string;
  category: string;
  district: string;
  location: string;
  description: string;
  photograph: string | null;
  contributor: string;
  created_at: string;
};

type ApiError = {
  detail?: string;
  message?: string;
};

export default function KaravaliContributions() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [categories, setCategories] = useState<RegionCategoryItem[]>([
    ...regionCategories,
  ]);
  const [categoryLoadError, setCategoryLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadContributions() {
      try {
        const response = await fetch(`${API}/api/karavali/contributions`, {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          contributions: Contribution[];
        } & ApiError;
        if (!response.ok) {
          throw new Error(data.detail || "Could not load community contributions.");
        }
        if (active) setContributions(data.contributions);
      } catch (loadError) {
        if (active) {
          setLoadError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load community contributions.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadContributions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadCategories() {
      try {
        const response = await fetch(`${API}/api/karavali/categories`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Could not load the current contribution categories.");
        }
        const data = (await response.json()) as {
          categories: RegionCategoryItem[];
        };
        if (active) {
          setCategories(data.categories);
          setCategoryLoadError("");
        }
      } catch (error) {
        if (active) {
          setCategoryLoadError(
            error instanceof Error
              ? error.message
              : "Could not load the current contribution categories.",
          );
        }
      }
    }
    void loadCategories();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");
    if (file instanceof File && file.size > MAX_FILE_SIZE) {
      setError("The maximum image size is 100 MB.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/api/karavali/contributions`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as ApiError;
      if (!response.ok) {
        throw new Error(data.detail || "Your contribution could not be submitted.");
      }
      form.reset();
      setMessage(
        data.message ||
          "Thank you. Your contribution will be visible after moderator approval.",
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Your contribution could not be submitted.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="karavali-contributions" aria-labelledby="karavali-contributions-title">
      <header className="karavali-contributions-heading">
        <p className="district-explorer-kicker">COMMUNITY KNOWLEDGE</p>
        <h2 id="karavali-contributions-title">Add a Karavali story or place</h2>
        <p>
          Share local knowledge, a memory, or a place worth documenting.
          Contributions are reviewed before they appear publicly.
        </p>
        <p><Link href="/admin/karavali">Moderator dashboard</Link></p>
      </header>

      <form className="karavali-contribution-form" onSubmit={handleSubmit}>
        <label>
          Contribution title
          <input name="title" maxLength={120} required />
        </label>
        <label>
          Category
          <select name="category" defaultValue="" required>
            <option value="" disabled>Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
          {categoryLoadError && (
            <span className="karavali-inline-error" role="alert">
              {categoryLoadError} The available editorial categories remain selectable.
            </span>
          )}
        </label>
        <label>
          District
          <select name="district" defaultValue="" required>
            <option value="" disabled>Select a district</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>{district.name}</option>
            ))}
          </select>
        </label>
        <label>
          Place or locality
          <input name="location" maxLength={160} required />
        </label>
        <label>
          Your name
          <input name="contributor" maxLength={80} required />
        </label>
        <label className="karavali-form-wide">
          Story or details
          <textarea name="description" maxLength={3000} required />
        </label>
        <label className="karavali-form-wide">
          Optional photo
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
          <span>JPG, PNG, or WEBP · up to 100 MB</span>
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit for review"}
        </button>
        {message && <p className="karavali-inline-status" role="status">{message}</p>}
        {error && <p className="karavali-inline-error" role="alert">{error}</p>}
      </form>

      <div className="karavali-community-contribution-list" aria-live="polite">
        <h2>Community contributions</h2>
        {loading && <p role="status">Loading approved contributions…</p>}
        {loadError && <p className="karavali-inline-error" role="alert">{loadError}</p>}
        {!loading && !loadError && contributions.length === 0 && (
          <p>No approved community contributions yet.</p>
        )}
        {!loadError && (
          <ul className="karavali-contribution-list">
            {contributions.map((contribution) => (
              <li key={contribution.id}>
                <span className="karavali-place-meta">
                  {districts.find((district) => district.id === contribution.district)?.name ??
                    contribution.district} · {contribution.category} · {contribution.location}
                </span>
                <h3>{contribution.title}</h3>
                <p>{contribution.description}</p>
                <p>
                  Shared by {contribution.contributor} ·{" "}
                  {new Date(contribution.created_at).toLocaleDateString()}
                </p>
                {contribution.photograph && (
                  <img
                    src={`${API}${contribution.photograph}`}
                    alt={`Photo for ${contribution.title}`}
                    loading="lazy"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
