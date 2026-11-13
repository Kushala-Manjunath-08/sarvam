import Image from "next/image";
import Link from "next/link";
import { districts, districtSlug } from "../districts";

function getDistrict(name: string) {
  const district = districts.find((item) => item.name === name);
  if (!district) throw new Error(`Unknown district in map stories: ${name}`);
  return district;
}

const customs = [
  { district: getDistrict("Bidar"), label: "Bidriware", left: 73, top: 19 },
  { district: getDistrict("Bagalkot"), label: "Ilkal weaving", left: 45, top: 30 },
  { district: getDistrict("Vijayanagara"), label: "Hampi heritage", left: 61, top: 37 },
  { district: getDistrict("Dakshina Kannada"), label: "Yakshagana", left: 17, top: 39 },
  { district: getDistrict("Hassan"), label: "Hoysala carvings", left: 40, top: 56 },
  { district: getDistrict("Udupi"), label: "Udupi cuisine", left: 17, top: 72 },
  { district: getDistrict("Chikkamagaluru"), label: "Coffee hills", left: 24, top: 68 },
  { district: getDistrict("Mysuru"), label: "Mysore Dasara", left: 67, top: 69 },
];

export default function DistrictMapPage() {
  return (
    <main className="landing-page district-page-active">
      <section className="map-explorer" aria-labelledby="map-heading">
        <header className="map-explorer-header">
          <p className="district-explorer-kicker">SARVAM&nbsp; / &nbsp;KARNATAKA</p>
          <h1 id="map-heading">A map of living customs.</h1>
          <p>
            Tap a landmark to read its story, or tap the map background to browse all
            Karnataka stories.
          </p>
        </header>

        <div className="custom-map-stage">
          <Link
            className="map-base-link"
            href="/search"
            aria-label="Explore all Karnataka stories"
          >
            <Image
              src="/images/karnataka-customs-map.png"
              alt=""
              width={768}
              height={1366}
              sizes="(max-width: 480px) 100vw, 440px"
              priority
            />
          </Link>

          {customs.map(({ district, label, left, top }) => (
            <Link
              className="map-custom-hotspot"
              href={`/districts/${districtSlug(district.name)}`}
              key={district.name}
              style={{ left: `${left}%`, top: `${top}%` }}
              aria-label={`Explore ${label} in ${district.name}`}
              title={`Explore ${label}`}
            >
              <span className="map-custom-label">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
