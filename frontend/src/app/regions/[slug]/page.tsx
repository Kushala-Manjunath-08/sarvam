import Link from "next/link";
import { notFound } from "next/navigation";
import { karnatakaRegions } from "../../regions";

type RegionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return karnatakaRegions.map((region) => ({ slug: region.slug }));
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { slug } = await params;
  const region = karnatakaRegions.find((r) => r.slug === slug);

  if (!region) notFound();

  return (
    <main className="landing-page district-page-active">
      <section
        className="district-explorer"
        aria-labelledby="region-heading"
      >
        <div style={{ marginBottom: "24px" }}>
          <Link
            href="/search"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--red)",
              textDecoration: "none",
            }}
          >
            ← Back to Regions
          </Link>
        </div>

        <header className="district-explorer-header" style={{ marginBottom: "40px" }}>
          <p className="district-explorer-kicker">
            KARNATAKA REGIONAL ATLAS / {region.name}
          </p>
          <h1 id="region-heading" style={{ marginBottom: "12px" }}>{region.name}</h1>
          <p className="district-explorer-description">
            {region.subtitle}
          </p>
        </header>

        {/* Districts Section as Clean Text List */}
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            background: "#fffdf9",
            border: "1px solid var(--sand-dark)",
            borderRadius: "16px",
            padding: "36px clamp(24px, 4vw, 48px)",
            boxShadow: "0 10px 30px -10px rgba(56, 52, 43, 0.08)",
          }}
        >
          <h2
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "clamp(20px, 2.2vw, 26px)",
              color: "var(--ink)",
              marginTop: 0,
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Districts in this Region
          </h2>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "13px",
              marginBottom: "20px",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 600,
            }}
          >
            {region.districts.length} Districts Total
          </p>

          <p
            style={{
              color: "var(--ink)",
              fontSize: "16px",
              lineHeight: 1.7,
              margin: 0,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {region.districts.map((district, idx) => (
              <span key={district}>
                <strong style={{ fontWeight: 600, color: "var(--red)" }}>{district}</strong>
                {idx < region.districts.length - 1 ? ", " : "."}
              </span>
            ))}
          </p>
        </div>

        {/* Future Expansion Structure (Prepared for future addition of Agriculture, Culture and traditions, Historical information, Food and cuisine, Languages, Festivals, Tourism, Local knowledge) */}
        <div
          aria-hidden="true"
          data-future-expansion="true"
          style={{ display: "none" }}
        >
          {/*
            Future expansion sections container:
            - Agriculture
            - Culture and traditions
            - Historical information
            - Food and cuisine
            - Languages
            - Festivals
            - Tourism
            - Local knowledge
          */}
        </div>
      </section>
    </main>
  );
}

