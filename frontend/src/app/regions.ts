export interface RegionDetail {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  districts: string[];
  // Future expansion fields (optional placeholders)
  culturalInfo?: string;
  historicalInfo?: string;
  agriculture?: string;
  cuisine?: string;
  languages?: string[];
  festivals?: string[];
  tourism?: string[];
  traditionalOccupations?: string[];
  localKnowledge?: string;
}

export const karnatakaRegions: RegionDetail[] = [
  {
    id: "old-mysuru",
    slug: "old-mysuru",
    name: "OLD MYSURU",
    subtitle: "Southern Royal & Agrarian Culture",
    districts: [
      "Mysuru",
      "Mandya",
      "Chamarajanagar",
      "Hassan",
      "Tumakuru",
      "Bengaluru Urban",
      "Bengaluru Rural",
      "Ramanagara",
      "Kolar",
      "Chikkaballapura",
    ],
  },
  {
    id: "uttara-karnataka",
    slug: "uttara-karnataka",
    name: "UTTARA KARNATAKA",
    subtitle: "Northern Deccan Culture",
    districts: [
      "Belagavi",
      "Dharwad",
      "Gadag",
      "Bagalkot",
      "Vijayapura",
      "Haveri",
      "Davangere",
      "Chitradurga",
      "Kalaburagi",
      "Bidar",
      "Yadgir",
      "Raichur",
      "Koppal",
      "Ballari",
      "Vijayanagara",
    ],
  },
  {
    id: "karavali",
    slug: "karavali",
    name: "KARAVALI",
    subtitle: "Coastal Tuluva-Konkani Culture",
    districts: [
      "Dakshina Kannada",
      "Udupi",
      "Uttara Kannada",
    ],
  },
  {
    id: "malenadu-kodagu",
    slug: "malenadu-kodagu",
    name: "MALENADU & KODAGU",
    subtitle: "Hill & Plantation Culture",
    districts: [
      "Kodagu",
      "Chikkamagaluru",
      "Shivamogga",
    ],
  },
];

export function regionSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
