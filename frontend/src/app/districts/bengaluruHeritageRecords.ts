import { bengaluruDivisionDistrictNames } from "../districts";

type BengaluruDivisionDistrictName =
  (typeof bengaluruDivisionDistrictNames)[number];

interface BengaluruHeritageRecord {
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

export const bengaluruHeritageRecords: Record<
  BengaluruDivisionDistrictName,
  BengaluruHeritageRecord[]
> = {
  "Bengaluru Rural": [
    {
      id: "bengaluru-rural-devanahalli-fort",
      title: "Devanahalli Fort",
      category: "Historic architecture",
      description:
        "A fortified historic site in Devanahalli, associated with the region's changing rulers and the birthplace of Tipu Sultan.",
      location: "Devanahalli",
      period: "Historic fort",
      language: ["Kannada", "English"],
      source: {
        name: "Wikipedia: Devanahalli Fort",
        url: "https://en.wikipedia.org/wiki/Devanahalli_Fort",
      },
    },
    {
      id: "bengaluru-rural-ghati-subramanya",
      title: "Ghati Subramanya Temple",
      category: "Religious heritage",
      description:
        "A well-known temple near Doddaballapura, visited by devotees of Subramanya and Narasimha.",
      location: "Doddaballapura taluk",
      period: "Continuing tradition",
      language: ["Kannada", "English"],
      source: {
        name: "Wikipedia: Ghati Subramanya",
        url: "https://en.wikipedia.org/wiki/Ghati_Subramanya_Temple",
      },
    },
    {
      id: "bengaluru-rural-makalidurga",
      title: "Makalidurga Hill Fort",
      category: "Historic landscape",
      description:
        "A hill fort and trekking destination near Doddaballapura, known for its rocky summit and surrounding landscape.",
      location: "Near Doddaballapura",
      period: "Historic fort",
      language: ["Kannada", "English"],
      source: {
        name: "Wikipedia: Makalidurga",
        url: "https://en.wikipedia.org/wiki/Makalidurga",
      },
    },
  ],
  "Bengaluru Urban": [
    {
      id: "bengaluru-urban-cubbon-park",
      title: "Cubbon Park",
      category: "Historic park",
      description:
        "The historic Sri Chamarajendra Park is a large green space in the city's central administrative area.",
      location: "Central Bengaluru",
      period: "Established in 1870",
      language: ["Kannada", "English"],
      source: {
        name: "Bengaluru Urban District Administration",
        url: "https://bengaluruurban.nic.in/en/tourist-place/cubbon-park/",
      },
    },
    {
      id: "bengaluru-urban-tipu-palace",
      title: "Tipu Sultan's Summer Palace",
      category: "Historic architecture",
      description:
        "An Indo-Islamic palace within the old Bengaluru fort, completed during Tipu Sultan's reign.",
      location: "Old Bengaluru",
      period: "Completed in 1791",
      language: ["Kannada", "English"],
      source: {
        name: "Bengaluru Urban District Administration",
        url: "https://bengaluruurban.nic.in/en/tourist-place/tipu-sultans-summer-palace/",
      },
    },
    {
      id: "bengaluru-urban-bannerghatta",
      title: "Bannerghatta Biological Park",
      category: "Nature and conservation",
      description:
        "A conservation and eco-tourism destination with a zoo, safari, butterfly park, and rescue centre.",
      location: "Bannerghatta, south Bengaluru",
      period: "Biological park established in 2002",
      language: ["Kannada", "English"],
      source: {
        name: "Bengaluru Urban District Administration",
        url: "https://bengaluruurban.nic.in/en/tourist-place/bannerghatta-biological-park/",
      },
    },
  ],
  Chikkaballapur: [
    {
      id: "chikkaballapur-nandi-hills",
      title: "Nandi Hills",
      category: "Historic landscape",
      description:
        "A hill station with fortifications, temples, and views over the surrounding countryside; it was a summer retreat of Tipu Sultan.",
      location: "Nandi Hills",
      period: "Historic hill station",
      language: ["Kannada", "English"],
      source: {
        name: "Chikkaballapur District Administration",
        url: "https://chikkaballapur.nic.in/en/tourist-place/nandi-hills/",
      },
    },
    {
      id: "chikkaballapur-muddenahalli",
      title: "Muddenahalli",
      category: "People and heritage",
      description:
        "The birthplace of engineer Sir M. Visvesvaraya, with a museum and memorial sites.",
      location: "Muddenahalli",
      period: "Modern heritage",
      language: ["Kannada", "English"],
      source: {
        name: "Chikkaballapur District Administration",
        url: "https://chikkaballapur.nic.in/en/tourist-place/muddenahalli/",
      },
    },
    {
      id: "chikkaballapur-kaivara",
      title: "Kaivara",
      category: "Cultural and religious heritage",
      description:
        "A town associated with Mahabharata traditions and known for its temples and Yogi Narayana ashram.",
      location: "Kaivara",
      period: "Continuing tradition",
      language: ["Kannada", "English"],
      source: {
        name: "Chikkaballapur District Administration",
        url: "https://chikkaballapur.nic.in/en/tourist-place/kaivara/",
      },
    },
  ],
  Chitradurga: [
    {
      id: "chitradurga-fort",
      title: "Fort of Chitradurga",
      category: "Historic architecture",
      description:
        "A hill fort renowned for its seven concentric ramparts and extensive stone fortifications.",
      location: "Chitradurga",
      period: "Historic fort",
      language: ["Kannada", "English"],
      source: {
        name: "Chitradurga District Administration",
        url: "https://chitradurga.nic.in/en/tourist-place/fort-of-chitradurga/",
      },
    },
    {
      id: "chitradurga-onake-obavva-kindi",
      title: "Onake Obavva Kindi",
      category: "Local history",
      description:
        "A narrow passage in the Chitradurga fort remembered through the story of Onake Obavva.",
      location: "Chitradurga Fort",
      period: "Historic fort tradition",
      language: ["Kannada", "English"],
      source: {
        name: "Chitradurga District Administration",
        url: "https://chitradurga.nic.in/en/tourist-place/fort-of-chitradurga/",
      },
    },
    {
      id: "chitradurga-vani-vilasa-sagara",
      title: "Vani Vilasa Sagara",
      category: "Engineering and landscape",
      description:
        "A dam built across the Vedavathi River near Marikanive, known for its striking setting and reservoir.",
      location: "Marikanive, Hiriyur taluk",
      period: "Built before Indian independence",
      language: ["Kannada", "English"],
      source: {
        name: "Chitradurga District Administration",
        url: "https://chitradurga.nic.in/en/tourist-place/vani-vilasa-sagara/",
      },
    },
  ],
  Davanagere: [
    {
      id: "davanagere-santhebennur-pushkarani",
      title: "Santhebennur Pushkarani",
      category: "Water heritage",
      description:
        "A historic stepped water tank, locally known as a honda, and one of the district's noted landmarks.",
      location: "Santhebennur",
      period: "Historic water structure",
      language: ["Kannada", "English"],
      source: {
        name: "Davanagere District Administration",
        url: "https://davanagere.nic.in/en/tourist-place/santhebennur-pushkarani/",
      },
    },
    {
      id: "davanagere-shanthi-sagara",
      title: "Shanthi Sagara Lake",
      category: "Water and landscape",
      description:
        "A large lake near Channagiri, valued for its scenic setting and regional importance.",
      location: "Channagiri taluk",
      period: "Historic reservoir",
      language: ["Kannada", "English"],
      source: {
        name: "Davanagere District Administration",
        url: "https://davanagere.nic.in/en/tourist-place/shanthi-sagara-lake/",
      },
    },
    {
      id: "davanagere-kalleshvara-bagali",
      title: "Kalleshvara Temple, Bagali",
      category: "Temple architecture",
      description:
        "A historic temple in Bagali, noted for its architecture and stone sculpture.",
      location: "Bagali",
      period: "Historic temple",
      language: ["Kannada", "English"],
      source: {
        name: "Davanagere District Administration",
        url: "https://davanagere.nic.in/en/tourist-place/kalleshvara-temple-bagali/",
      },
    },
  ],
  Kolar: [
    {
      id: "kolar-virupakshi-temple",
      title: "Virupakshi Temple, Mulbagal",
      category: "Temple architecture",
      description:
        "An ancient temple dedicated to Virupaksha, set in Mulbagal and known for its history and architecture.",
      location: "Mulbagal",
      period: "Historic temple",
      language: ["Kannada", "English"],
      source: {
        name: "Kolar District Administration",
        url: "https://kolar.nic.in/en/tourist-place/virupakshi-temple-mulbagal/",
      },
    },
    {
      id: "kolar-kotilingeshwar",
      title: "Kotilingeshwar Temple",
      category: "Religious heritage",
      description:
        "A temple complex in Kammasandra, distinguished by its large Shiva lingam and many smaller lingams.",
      location: "Kammasandra, KGF taluk",
      period: "Continuing tradition",
      language: ["Kannada", "English"],
      source: {
        name: "Kolar District Administration",
        url: "https://kolar.nic.in/en/tourist-place/kotilingeshwar-temple-kgf-kolar/",
      },
    },
    {
      id: "kolar-gold-fields",
      title: "Kolar Gold Fields",
      category: "Industrial history",
      description:
        "A historic mining settlement whose gold mines shaped the region's industry, communities, and built landscape.",
      location: "Kolar Gold Fields",
      period: "Mining heritage",
      language: ["Kannada", "English"],
      source: {
        name: "Wikipedia: Kolar Gold Fields",
        url: "https://en.wikipedia.org/wiki/Kolar_Gold_Fields",
      },
    },
  ],
  Ramanagara: [
    {
      id: "ramanagara-ramadevara-betta",
      title: "Ramadevara Betta",
      category: "Natural and religious heritage",
      description:
        "A rocky hill near Ramanagara with a temple and a landscape popular with visitors and trekkers.",
      location: "Ramanagara",
      period: "Continuing tradition",
      language: ["Kannada", "English"],
      source: {
        name: "Bengaluru South District Administration",
        url: "https://bengalurusouth.nic.in/en/tourist-place/vulture-sanctuary/",
      },
    },
    {
      id: "ramanagara-janapada-loka",
      title: "Janapada Loka",
      category: "Folk culture",
      description:
        "A folk culture museum presenting Karnataka's village arts, artifacts, and traditions.",
      location: "Near Ramanagara",
      period: "Living folk heritage",
      language: ["Kannada", "English"],
      source: {
        name: "Bengaluru South District Administration",
        url: "https://bengalurusouth.nic.in/en/tourist-place/janapada-loka/",
      },
    },
    {
      id: "ramanagara-sangama-mekedatu",
      title: "Sangama and Mekedatu",
      category: "River landscape",
      description:
        "Sangama is the meeting point of the Arkavathi and Kaveri rivers; Mekedatu lies downstream in the river gorge.",
      location: "Kanakapura taluk",
      period: "Natural landmark",
      language: ["Kannada", "English"],
      source: {
        name: "Bengaluru South District Administration",
        url: "https://bengalurusouth.nic.in/en/tourist-place/sangama-and-mekedatu/",
      },
    },
  ],
  Shivamogga: [
    {
      id: "shivamogga-balligavi",
      title: "Balligavi",
      category: "Temple and cultural heritage",
      description:
        "A historic temple destination in Shivamogga district, highlighted in the district's tourism guide.",
      location: "Balligavi",
      period: "Historic heritage",
      language: ["Kannada", "English"],
      source: {
        name: "Shivamogga District Administration",
        url: "https://shivamogga.nic.in/en/tourist-place/namma-shivamogga/",
      },
    },
    {
      id: "shivamogga-kodachadri",
      title: "Kodachadri Hill",
      category: "Natural heritage",
      description:
        "A prominent Western Ghats hill featured among the district's forest and hill destinations.",
      location: "Kodachadri",
      period: "Natural landmark",
      language: ["Kannada", "English"],
      source: {
        name: "Shivamogga District Administration",
        url: "https://shivamogga.nic.in/en/tourist-place/namma-shivamogga/",
      },
    },
    {
      id: "shivamogga-gajanur-dam",
      title: "Gajanur Dam",
      category: "Water and landscape",
      description:
        "A dam near Shivamogga included among the region's riverside and landscape attractions.",
      location: "Gajanur",
      period: "Modern landmark",
      language: ["Kannada", "English"],
      source: {
        name: "Shivamogga District Administration",
        url: "https://shivamogga.nic.in/en/tourist-place/namma-shivamogga/",
      },
    },
  ],
  Tumakuru: [
    {
      id: "tumakuru-hutridurga",
      title: "Hutridurga",
      category: "Historic hill fort",
      description:
        "A hilltop fort in Tumakuru district with stone remains and panoramic views of the surrounding countryside.",
      location: "Hutridurga",
      period: "Historic fort",
      language: ["Kannada", "English"],
      source: {
        name: "Tumakuru District Administration",
        url: "https://tumkur.nic.in/en/tourist-place/hutridurga/",
      },
    },
    {
      id: "tumakuru-devarayana-durga",
      title: "Devarayana Durga",
      category: "Hill and temple heritage",
      description:
        "A hill station known for its temples, natural setting, and views across the Tumakuru countryside.",
      location: "Devarayana Durga",
      period: "Historic landscape",
      language: ["Kannada", "English"],
      source: {
        name: "Tumakuru District Administration",
        url: "https://tumkur.nic.in/en/tourist-place/devarayana-durga/",
      },
    },
    {
      id: "tumakuru-araluguppe-temple",
      title: "Chennakesava Temple, Araluguppe",
      category: "Temple architecture",
      description:
        "A historic temple in Araluguppe, noted by the district tourism guide for its heritage and architecture.",
      location: "Araluguppe",
      period: "Historic temple",
      language: ["Kannada", "English"],
      source: {
        name: "Tumakuru District Administration",
        url: "https://tumkur.nic.in/en/tourist-place/araluguppe-chennakesava-temple/",
      },
    },
  ],
};
