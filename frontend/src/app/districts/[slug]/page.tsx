import Link from "next/link";
import { notFound } from "next/navigation";
import DistrictIllustration from "../../components/DistrictIllustration";
import { districts, districtSlug } from "../../districts";

type DistrictPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return districts.map((district) => ({ slug: districtSlug(district.name) }));
}

export default async function DistrictPage({ params }: DistrictPageProps) {
  const { slug } = await params;
  const districtIndex = districts.findIndex((district) => districtSlug(district.name) === slug);
  const district = districts[districtIndex];

  if (!district) notFound();

  return (
    <main className="landing-page district-page-active">
      <section className="district-detail-page">
        <nav className="district-breadcrumb" aria-label="Breadcrumb">
          <Link href="/map">Karnataka map</Link>
          <span aria-hidden="true">/</span>
          <Link href="/search">All districts</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{district.name}</span>
        </nav>

        <div className="district-detail-grid">
          <div className="district-detail-art">
            <DistrictIllustration district={district} index={districtIndex} />
          </div>
          <div className="district-detail-copy">
            <p className="district-explorer-kicker">{district.region}</p>
            <h1>{district.name}</h1>
            <p className="district-detail-intro">
              Discover the customs, craft and heritage of {district.name}.
            </p>
            <div className="district-detail-spotlight">
              <p className="keepsakes-heading">Cultural spotlight</p>
              <p>{district.tradition}</p>
            </div>
            <div className="district-detail-actions">
              <Link className="district-detail-map-link" href="/map">
                Back to the map <span aria-hidden="true">↗</span>
              </Link>
              <Link className="district-detail-search-link" href="/search">
                Browse all districts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
