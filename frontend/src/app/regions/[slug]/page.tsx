import { notFound } from "next/navigation";
import RegionInformation from "../../components/RegionInformation";
import { isRegionSlug, regionalContent } from "../../region-content";
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

  if (!region || !isRegionSlug(region.slug)) notFound();

  return <RegionInformation region={region} content={regionalContent[region.slug]} />;
}

