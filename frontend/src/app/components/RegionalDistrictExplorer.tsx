"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { districts, districtSlug } from "../districts";

type RegionalDistrictExplorerProps = {
  districtNames: string[];
  regionName: string;
};

const districtNameAliases: Record<string, string> = {
  Chikkaballapura: "Chikkaballapur",
  Davangere: "Davanagere",
};

export default function RegionalDistrictExplorer({
  districtNames,
  regionName,
}: RegionalDistrictExplorerProps) {
  const regionalDistricts = useMemo(
    () =>
      districtNames.map((name) => {
        const catalogName = districtNameAliases[name] ?? name;
        return {
          name,
          record: districts.find((item) => item.name === catalogName),
        };
      }),
    [districtNames],
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const selectedDistrictDetails = regionalDistricts.find(
    (district) => district.name === selectedDistrict,
  );

  function selectDistrict(name: string) {
    setSelectedDistrict(name);
  }

  return (
    <section
      aria-labelledby="region-district-explorer-title"
      className="region-district-explorer"
    >
      <header className="region-district-explorer-heading">
        <div>
          <p className="district-explorer-kicker">DISTRICT EXPLORER</p>
          <h2 id="region-district-explorer-title">Explore {regionName} by district</h2>
          <p>Select a district for its cultural spotlight, or continue with all regional stories.</p>
        </div>
        {selectedDistrict && (
          <button
            className="region-district-clear"
            onClick={() => setSelectedDistrict(null)}
            type="button"
          >
            View the whole region
          </button>
        )}
      </header>

      <div className="region-district-explorer-layout">
        <div className="region-district-cards">
          {regionalDistricts.map((district) => (
            <article
              className={`region-district-card${selectedDistrict === district.name ? " is-selected" : ""}`}
              key={district.name}
            >
              <button
                aria-pressed={selectedDistrict === district.name}
                onClick={() => selectDistrict(district.name)}
                type="button"
              >
                <span className="region-district-card-kicker">DISTRICT</span>
                <span className="region-district-card-name">{district.name}</span>
                <span className="region-district-card-summary">
                  {district.record?.tradition ??
                    "District-specific cultural records are being prepared and verified."}
                </span>
              </button>
              {district.record ? (
                <Link href={`/districts/${districtSlug(district.record.name)}`}>
                  Open district guide <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span className="region-district-pending">District guide pending verification</span>
              )}
            </article>
          ))}
        </div>

        <div className="region-district-map-panel">
          <div
            aria-label={`Illustrative district locations in ${regionName}`}
            className="region-district-map"
            role="group"
          >
            <Image
              alt=""
              height={1366}
              loading="lazy"
              sizes="(max-width: 760px) 100vw, 360px"
              src="/images/karnataka-customs-map.png"
              width={768}
            />
            {regionalDistricts.map(({ name, record }) =>
              record ? (
                <button
                  aria-label={`Select ${name}`}
                  aria-pressed={selectedDistrict === name}
                  className={`region-district-map-marker${selectedDistrict === name ? " is-selected" : ""}`}
                  key={name}
                  onClick={() => selectDistrict(name)}
                  style={{
                    left: `${record.mapPosition.x}%`,
                    top: `${record.mapPosition.y}%`,
                  }}
                  type="button"
                >
                  <span aria-hidden="true" />
                  <span>{name}</span>
                </button>
              ) : null,
            )}
          </div>
          <p>
            Locator illustration only; markers are approximate and do not show
            administrative boundaries.
          </p>
        </div>
      </div>

      {selectedDistrict && (
        <div className="region-district-selection" role="status">
          <div>
            <p className="district-explorer-kicker">CULTURAL SPOTLIGHT</p>
            <h3>{selectedDistrict}</h3>
            <p>
              {selectedDistrictDetails?.record?.tradition ??
                "District-specific cultural records are being prepared and verified."}
            </p>
          </div>
          {selectedDistrictDetails?.record && (
            <Link
              href={`/districts/${districtSlug(selectedDistrictDetails.record.name)}`}
            >
              Explore district guide <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
