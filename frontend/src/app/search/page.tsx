<<<<<<< HEAD
"use client";

=======
>>>>>>> 2862455 (Save latest karavaliRegion changes before merging main)
import Link from "next/link";
import { karnatakaRegions } from "../regions";

export default function DistrictSearchPage() {
  return (
    <main className="landing-page district-page-active">
      <section className="district-explorer" aria-labelledby="district-heading">
        <header className="district-explorer-header">
<<<<<<< HEAD
          <p className="district-explorer-kicker">
            LEGACYOS / REGIONAL ATLAS
          </p>
=======
          <p className="district-explorer-kicker">LEGACYOS / REGIONAL ATLAS</p>
>>>>>>> 2862455 (Save latest karavaliRegion changes before merging main)
          <h1 id="district-heading">Karnataka Regional Search</h1>
          <p className="district-explorer-description">
            Choose a cultural region to explore its districts and heritage.
          </p>
        </header>

<<<<<<< HEAD
        {/* Four Regional Cards ONLY */}
        <div className="region-cards-grid">
          {karnatakaRegions.map((region) => {
            return (
              <Link
                key={region.id}
                href={`/regions/${region.slug}`}
                className="region-card"
                aria-label={`Explore ${region.name}: ${region.subtitle}`}
              >
                <div>
                  <div className="region-card-top">
                    <div className="region-card-title-group">
                      <span className="region-card-subtitle">
                        {region.subtitle}
                      </span>
                      <h2 className="region-card-name">
                        {region.name}
                      </h2>
                    </div>
                    <span className="region-card-count">
                      {region.districts.length} districts
                    </span>
=======
        <div className="region-cards-grid">
          {karnatakaRegions.map((region) => (
            <Link
              key={region.id}
              href={`/regions/${region.slug}`}
              className="region-card"
              aria-label={`Explore ${region.name}: ${region.subtitle}`}
            >
              <div>
                <div className="region-card-top">
                  <div className="region-card-title-group">
                    <span className="region-card-subtitle">{region.subtitle}</span>
                    <h2 className="region-card-name">{region.name}</h2>
>>>>>>> 2862455 (Save latest karavaliRegion changes before merging main)
                  </div>
                  <span className="region-card-count">
                    {region.districts.length} districts
                  </span>
                </div>
              </div>

<<<<<<< HEAD
                <div className="region-card-footer">
                  <span>Explore region districts</span>
                  <span className="region-card-arrow" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
=======
              <div className="region-card-footer">
                <span>Explore region districts</span>
                <span className="region-card-arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </Link>
          ))}
>>>>>>> 2862455 (Save latest karavaliRegion changes before merging main)
        </div>
      </section>
    </main>
  );
}
