import type { RegionDetail } from "./regions";

export const regionCategories = [
  { id: "geography", title: "Geography & Natural Heritage", icon: "land", image: "/images/karnataka-customs-map.png" },
  { id: "history", title: "History & Historical Events", icon: "history", image: "/images/hampi-ruins.svg" },
  { id: "communities", title: "Communities & Cultural Identity", icon: "community", image: "/images/karnataka-heritage.svg" },
  { id: "languages", title: "Languages & Dialects", icon: "language", image: "/images/karnataka-customs-map.png" },
  { id: "festivals", title: "Festivals & Celebrations", icon: "festival", image: "/images/yakshagana-stage.svg" },
  { id: "performing-arts", title: "Traditional Art & Performing Arts", icon: "performance", image: "/images/yakshagana-stage.svg" },
  { id: "food", title: "Food & Culinary Heritage", icon: "food", image: "/images/karnataka-heritage.svg" },
  { id: "architecture", title: "Architecture & Traditional Lifestyle", icon: "home", image: "/images/mysore-palace.svg" },
  { id: "agriculture", title: "Agriculture & Traditional Practices", icon: "harvest", image: "/images/karnataka-customs-map.png" },
  { id: "oral-history", title: "Folk Stories, Legends & Oral History", icon: "oral", image: "/images/yakshagana-stage.svg" },
  { id: "knowledge", title: "Traditional Knowledge & Skills", icon: "craft", image: "/images/karnataka-heritage.svg" },
  { id: "personalities", title: "Important Personalities & Contributions", icon: "people", image: "/images/mysore-palace.svg" },
  { id: "iconic-places", title: "Iconic Places & Landmarks", icon: "land", image: "/images/karavali/st-marys-islands.svg" },
  { id: "ancient-history", title: "Ancient & Historical Places", icon: "history", image: "/images/karavali/mirjan-fort.svg" },
  { id: "maritime-ports", title: "Maritime Heritage & Historical Ports", icon: "craft", image: "/images/karavali/malpe-beach.svg" },
  { id: "biodiversity", title: "Biodiversity & Wildlife", icon: "harvest", image: "/images/karavali/yana-caves.svg" },
  { id: "rivers-estuaries", title: "Rivers, Estuaries & Islands", icon: "land", image: "/images/karavali/st-marys-islands.svg" },
  { id: "tourism-experiences", title: "Tourism & Travel Experiences", icon: "festival", image: "/images/karavali/gokarna.svg" },
  { id: "education-reformers", title: "Education, Literature & Social Reformers", icon: "people", image: "/images/karavali/st-aloysius-chapel.svg" },
] as const;

export const sharedRegionCategories = regionCategories.slice(0, 12);

export type RegionCategoryId = (typeof regionCategories)[number]["id"];
export type RegionSlug =
  | "old-mysuru"
  | "uttara-karnataka"
  | "karavali"
  | "malenadu-kodagu";

export interface ImageAttribution {
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
}

export interface RegionCategoryContent {
  overview: string;
  details: string[];
  highlights: string[];
  verificationNote?: string;
  sources?: { label: string; url: string }[];
  image?: string;
  imageAlt?: string;
  imageAttribution?: ImageAttribution;
}

export interface RegionCategoryItem {
  id: string;
  title: string;
  icon: string;
  image: string;
}

export interface RegionPageContent {
  introduction: string;
  heroImage: string;
  heroImageAlt: string;
  heroImageAttribution?: ImageAttribution;
  categories: Partial<Record<string, RegionCategoryContent>>;
}

const category = (
  overview: string,
  details: string[],
  highlights: string[],
  verificationNote?: string,
  sources?: { label: string; url: string }[],
  image?: string,
  imageAttribution?: ImageAttribution,
  imageAlt?: string,
): RegionCategoryContent => ({
  overview,
  details,
  highlights,
  verificationNote,
  sources,
  image,
  imageAlt,
  imageAttribution,
});

const malenaduPhotos = {
  highlands: {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Ye_Haseen_Vadiyan_%28145070917%29.jpeg/1280px-Ye_Haseen_Vadiyan_%28145070917%29.jpeg",
    author: "Sanjeet Singh",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Ye_Haseen_Vadiyan_(145070917).jpeg",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  },
  iruppuFalls: {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Iruppu_Waterfalls.jpg/1280px-Iruppu_Waterfalls.jpg",
    author: "Csheik",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Iruppu_Waterfalls.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  coffeeFields: {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Coffee_Shade_Trees_Paddy_Fields_Coorg_Feb24_R16_07670.jpg/1280px-Coffee_Shade_Trees_Paddy_Fields_Coorg_Feb24_R16_07670.jpg",
    author: "Timothy A. Gonsalves",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Coffee_Shade_Trees_Paddy_Fields_Coorg_Feb24_R16_07670.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  pandiCurry: {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Pandi_Curry.jpg/1280px-Pandi_Curry.jpg",
    author: "Rupak76",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Pandi_Curry.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  kappekali: {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Kappekali_by_Kodava_Youth-26-10-2013-P_M_Muthanna_%282%29.jpg/1280px-Kappekali_by_Kodava_Youth-26-10-2013-P_M_Muthanna_%282%29.jpg",
    author: "P. M. Muthanna",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kappekali_by_Kodava_Youth-26-10-2013-P_M_Muthanna_(2).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  kathiyath: {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Kathiyath_by_Kodava_Youth-26-10-2013-P_M_Muthanna_%281%29.jpg/1280px-Kathiyath_by_Kodava_Youth-26-10-2013-P_M_Muthanna_%281%29.jpg",
    author: "P. M. Muthanna",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kathiyath_by_Kodava_Youth-26-10-2013-P_M_Muthanna_(1).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  kodavaScript: {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Kod_thakk.svg/1280px-Kod_thakk.svg.png",
    author: "Symphonicallyu",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kod_thakk.svg",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  ummathaat: {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Kodava_Women_Performing_%22Ummathaat%22.jpg/1280px-Kodava_Women_Performing_%22Ummathaat%22.jpg",
    author: "Jagath Ponnanna PM",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kodava_Women_Performing_%22Ummathaat%22.jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  deshakattPaat: {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Deshakatt_Paat.png/1280px-Deshakatt_Paat.png",
    author: "RaithaPade",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Deshakatt_Paat.png",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  madikeriFort: {
    src: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Madikeri_Fort_%2821%29.jpg/1280px-Madikeri_Fort_%2821%29.jpg",
    author: "Vinayaraj",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Madikeri_Fort_(21).jpg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  kuvempu: {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/be/Kuvempu.jpg",
    author: "Unknown author",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kuvempu.jpg",
    license: "Public domain",
    licenseUrl: "https://commons.wikimedia.org/wiki/Commons:Licensing",
  },
};

export const regionalContent = {
  "old-mysuru": {
    introduction: "A broad southern Karnataka cultural landscape shaped by the Kaveri basin, the former Mysore kingdom and long-standing agrarian and craft traditions.",
    heroImage: "/images/mysore-palace.svg",
    heroImageAlt: "Illustration of Mysore Palace at dusk",
    categories: {
      geography: category(
        "The region spans the southern Deccan plateau, from irrigated Kaveri plains to rocky hills and forested southern uplands.",
        ["The Kaveri and its tributaries have supported settlement, irrigation and pilgrimage for centuries. Chamundi Hill overlooks Mysuru, while the southern districts meet the Nilgiri and Eastern Ghats landscapes."],
        ["Kaveri river and canal landscapes", "Mysuru and Mandya plains", "B.R. Hills and southern forest corridors"],
      ),
      history: category(
        "The region's political history includes Vijayanagara-era rule, the Mysore Wodeyar dynasty and the modern princely state.",
        ["Mysuru became a major court and administrative centre under the Wodeyars. The eighteenth-century Mysore state under Haidar Ali and Tipu Sultan was central to conflicts with the East India Company; the Wodeyar kingdom was restored in 1799."],
        ["Mysore courtly patronage", "Tipu Sultan and the late-eighteenth-century wars", "Princely-state institutions and public works"],
      ),
      communities: category(
        "Many communities shape the region's identities; rural, urban and district traditions differ and continue to evolve.",
        ["Kannada-speaking communities include Vokkaliga, Kuruba, Lingayat, Dalit and other groups, alongside Muslim, Jain, Tamil, Telugu and Urdu-speaking communities. These names describe only part of a diverse population and should not be treated as a complete account."],
        ["Agrarian, artisan and urban identities", "Distinct local and community traditions", "Living cultural practices across generations"],
        "Community names and regional boundaries vary by locality; consult district-level and community-led sources for a fuller account.",
      ),
      languages: category(
        "Kannada is widely spoken, with local speech shaped by movement between Mysuru, Bengaluru and neighbouring states.",
        ["Mysuru Kannada is associated with this part of the state, but speech changes between towns and villages. Urdu, Tamil and Telugu are also spoken in many localities, reflecting long-standing communities and migration."],
        ["Kannada and local varieties", "Urdu, Tamil and Telugu in many communities", "Multilingual urban neighbourhoods"],
      ),
      festivals: category(
        "Mysuru Dasara is the best-known public celebration, alongside seasonal, temple and community festivals throughout the region.",
        ["Mysuru Dasara combines royal-era ceremony with public cultural programmes. Ugadi and Sankranti mark seasonal and calendrical transitions; local temple jatre and village observances have their own distinct calendars."],
        ["Mysuru Dasara", "Ugadi and Sankranti", "Local temple jatres and Chamundeshwari observances"],
        "Festival dates, rituals and participation vary between communities and locations.",
      ),
      "performing-arts": category(
        "Music, dance, ritual performance and courtly craft traditions meet in a varied regional arts landscape.",
        ["Dollu Kunitha and Veeragase are energetic group performance traditions found in parts of southern Karnataka. Mysore painting, classical music patronage and the Mysore style of veena playing are also associated with the region."],
        ["Dollu Kunitha and Veeragase", "Mysore painting tradition", "Classical music and veena patronage"],
      ),
      food: category(
        "The table ranges from millet-based rural meals to dishes shaped by Mysuru's court, market and urban kitchens.",
        ["Ragi mudde with saaru is a familiar meal in many areas. Mysore pak and Mysore masala dosa are widely associated with the city; ingredients and everyday meals vary with season, community and district."],
        ["Ragi mudde and saaru", "Mysore pak", "Mysore masala dosa"],
        "Dish origins and claims of a single definitive recipe are often contested; local food histories deserve further documentation.",
      ),
      architecture: category(
        "Palaces and public buildings sit alongside temple streets, older market quarters and vernacular homes.",
        ["Mysore Palace is a prominent twentieth-century royal landmark. Hoysala temples in Hassan district, including Belur and Halebidu, preserve earlier stone-carving traditions; their histories span multiple dynasties and should not be conflated with Mysore palace architecture."],
        ["Mysore Palace and royal precincts", "Hoysala temples at Belur and Halebidu", "Courtyard homes, agraharas and market streets"],
      ),
      agriculture: category(
        "Irrigated paddy and sugarcane, dryland millets and horticulture reflect the region's varied rainfall and water access.",
        ["Canal irrigation from the Kaveri supports intensive cultivation in parts of Mandya and neighbouring districts. Ragi and pulses remain important in drier areas; silk rearing, horticulture and dairy also contribute to local livelihoods."],
        ["Paddy and sugarcane in irrigated belts", "Ragi, pulses and dryland farming", "Sericulture, horticulture and dairy"],
        "Crop mix and water practices differ substantially between districts and seasons.",
      ),
      "oral-history": category(
        "Devotional poetry, village performance and family memory carry stories across generations.",
        ["The oral traditions around Manteswamy and Siddappaji are important in parts of southern Karnataka, often carried through sung narrative and performance. The Chamundi–Mahishasura story is a sacred legend associated with Mysuru, not a verifiable historical event."],
        ["Manteswamy and Siddappaji oral traditions", "Chamundi Hill legends", "Songs and stories tied to village deities"],
        "Narratives have different versions; record them with the storyteller's community, place and consent.",
      ),
      knowledge: category(
        "Specialist craft and farming knowledge connect the region's materials, skills and livelihoods.",
        ["Mysuru is associated with sandalwood carving, silk weaving and traditional painting. Channapatna lacquerware is made in Ramanagara district; these living crafts depend on skilled makers, changing markets and access to materials."],
        ["Mysore silk and sandalwood craft", "Channapatna lacquerware", "Irrigation, seed and livestock knowledge"],
      ),
      personalities: category(
        "Rulers, reformers, writers, scientists and artists have contributed to the region's public and cultural life.",
        ["Tipu Sultan and the Wodeyar rulers shaped the region's political history. Kuvempu, born in Shivamogga district, is a major Kannada writer whose work is deeply connected with the wider Malenadu landscape; his inclusion here reflects shared regional connections, not an Old Mysuru birthplace."],
        ["Tipu Sultan and the Mysore Wodeyars", "Kuvempu and modern Kannada literature", "Artists and public figures from district histories"],
        "Personalities are included for documented regional connections; birthplace and contribution should be checked against authoritative biographies.",
      ),
    },
  },
  "uttara-karnataka": {
    introduction: "Northern Karnataka's Deccan plateau brings together historic temple towns, medieval capitals, dryland farming and distinctive Kannada literary and performance traditions.",
    heroImage: "/images/hampi-ruins.svg",
    heroImageAlt: "Illustration of Hampi's stone monuments and boulder landscape",
    categories: {
      geography: category(
        "The northern Deccan includes broad plateaus, black-soil tracts and river valleys shaped by the Krishna and Tungabhadra systems.",
        ["The Bhima, Krishna, Malaprabha and Tungabhadra watersheds cross the region. Rainfall and access to irrigation vary considerably, creating a patchwork of dryland fields, reservoirs and river-fed agriculture."],
        ["Krishna and Tungabhadra river basins", "Black-soil and dry plateau landscapes", "Badami's sandstone outcrops and northern scrublands"],
      ),
      history: category(
        "This region contains major centres of early Chalukya, Kalyana Chalukya, Vijayanagara and Deccan Sultanate histories.",
        ["Badami, Aihole and Pattadakal preserve important early Chalukya-era monuments. Basavakalyana is associated with the twelfth-century social and devotional movement around Basavanna; Hampi was the capital of the Vijayanagara empire, while Bijapur (Vijayapura) flourished under the Adil Shahi sultans."],
        ["Badami, Aihole and Pattadakal", "Basavakalyana and the Lingayat movement", "Vijayanagara and Adil Shahi heritage"],
      ),
      communities: category(
        "The region is home to diverse Kannada-speaking communities and layered Lingayat, Jain, Muslim, pastoral and artisan histories.",
        ["Community life differs between the northern districts, towns and rural taluks. Lingayat traditions have a strong historical presence; Kuruba, Jain, Muslim, Dalit, Lambani and many other communities contribute to local identities."],
        ["Lingayat and vachana traditions", "Pastoral, farming and artisan communities", "Lambani settlements and cultural practices"],
        "This overview is not exhaustive; avoid assigning one community identity to an entire district.",
      ),
      languages: category(
        "North Karnataka Kannada varieties are widely spoken, with linguistic borders and multilingual communities across districts.",
        ["Dharwad and other northern speech varieties are known for distinctive pronunciation and vocabulary. Urdu, Marathi, Lambani and other languages are part of local life, especially in border districts and towns."],
        ["Regional Kannada varieties", "Urdu and Marathi in multilingual districts", "Lambani and other community languages"],
        "Dialect names and boundaries are fluid; community-preferred terms should be confirmed locally.",
      ),
      festivals: category(
        "Temple jatres, seasonal celebrations and regional fairs bring together local devotion and public life.",
        ["The Saundatti Yellamma fair is a major pilgrimage gathering in Belagavi district. Banashankari at Badami and village jatres are important in their local settings; Kittur Utsav commemorates Kittur's history."],
        ["Saundatti Yellamma jatre", "Banashankari festival at Badami", "Kittur Utsav and village jatres"],
        "Festival practices and dates can change; confirm current details with local organisers.",
      ),
      "performing-arts": category(
        "Folk theatre, devotional song and musical performance form a strong part of northern Karnataka's cultural life.",
        ["Bayalata is a broad term for open-air folk theatre traditions found in Karnataka, with local forms in the north. The region is also known for Hindustani classical music lineages and devotional vachana singing."],
        ["Bayalata and village theatre", "Hindustani music traditions of Dharwad", "Vachana recitation and devotional song"],
      ),
      food: category(
        "Jowar-based meals, richly spiced curries and regional sweets reflect dryland crops and local foodways.",
        ["Jolada rotti with ennegayi or shenga chutney is widely associated with parts of northern Karnataka. Dharwad peda is a well-known regional sweet; recipes differ across households and towns."],
        ["Jolada rotti and ennegayi", "Shenga chutney and seasonal pulses", "Dharwad peda"],
        "Dish names and recipes vary locally; avoid treating any single preparation as universal.",
      ),
      architecture: category(
        "Rock-cut caves, temple complexes, fortified cities and domed monuments chart centuries of changing architectural styles.",
        ["Badami's cave temples, the Chalukya-era monuments at Aihole and Pattadakal, and the Vijayanagara remains at Hampi are significant heritage sites. Vijayapura's Gol Gumbaz is a landmark of Adil Shahi architecture; each site belongs to a distinct period and tradition."],
        ["Badami cave temples and Pattadakal", "Hampi's Vijayanagara urban remains", "Gol Gumbaz and Vijayapura's Deccan architecture"],
      ),
      agriculture: category(
        "Dryland farming remains central, alongside irrigated crops and commercial agriculture where water is available.",
        ["Jowar, pulses and oilseeds are common dryland crops; cotton and sugarcane are important in several districts. Irrigation from river projects has changed cropping in some places, with implications for water use and farm livelihoods."],
        ["Jowar and pulse cultivation", "Cotton and oilseeds", "Irrigated sugarcane and horticulture"],
        "Crop patterns are district- and season-specific and are changing with irrigation and climate conditions.",
      ),
      "oral-history": category(
        "Vachanas, devotional epics, folk theatre and local hero stories preserve histories beyond written chronicles.",
        ["Basavanna's vachanas are a major body of twelfth-century Kannada devotional and social writing associated with Kalyana (Basavakalyana). Kittur Rani Chennamma's resistance to British annexation is remembered in regional history and popular retellings."],
        ["Basavanna's vachanas", "Stories of Kittur Rani Chennamma", "Local deity and village performance narratives"],
        "Oral retellings may differ from archival histories; keep both forms and identify their sources.",
      ),
      knowledge: category(
        "Weaving, metalwork, embroidery and craft knowledge are closely linked to local materials and specialist communities.",
        ["Ilkal saree weaving, Kinnal wood craft and Lambani embroidery are associated with parts of northern Karnataka. Bidriware is specifically linked to Bidar and has a long Deccan metal-inlay tradition."],
        ["Ilkal saree weaving", "Kinnal toys and wood craft", "Bidriware and Lambani embroidery"],
        "Craft histories and current practitioner locations should be verified with maker groups and local institutions.",
      ),
      personalities: category(
        "Social reformers, rulers, musicians and artists from the north have shaped Karnataka's political and cultural history.",
        ["Basavanna and other vachana poets are central to Kannada devotional literature. Kittur Rani Chennamma is remembered for resisting British expansion; Dharwad-born Gangubai Hangal became one of India's leading Hindustani classical vocalists."],
        ["Basavanna and the vachana poets", "Kittur Rani Chennamma", "Gangubai Hangal and Hindustani music"],
        "Biographical details and regional affiliations should be checked against reliable biographies.",
      ),
    },
  },
  karavali: {
    introduction: "Along Karnataka's Arabian Sea coast, Karavali's estuaries, ports and monsoon landscape sustain a rich mix of Tulu, Kannada, Konkani and other cultural traditions.",
    heroImage: "/images/karavali/yakshagana-performance.jpg",
    heroImageAlt: "Yakshagana performers on stage in coastal Karnataka",
    categories: {
      geography: category(
        "A narrow coastal plain meets the Arabian Sea on one side and the steep, rain-fed Western Ghats on the other.",
        ["Rivers such as the Netravati, Sharavathi, Kali and Aghanashini flow westward into estuaries and the sea. Beaches, laterite plateaus, mangroves and hill forests create varied habitats along the districts."],
        ["Arabian Sea coastline and estuaries", "Western Ghats foothills", "Monsoon rivers, laterite and coastal wetlands"],
        undefined,
        undefined,
        "/images/karavali/st-marys-islands.jpg",
      ),
      history: category(
        "Coastal Karnataka's history has been shaped by maritime trade, local dynasties, pilgrimage centres and colonial-era encounters.",
        ["The Alupa dynasty is associated with early medieval rule in parts of the southern coast. Ports and river routes connected the coast to Indian Ocean trade; later histories include Vijayanagara influence, local chiefs and Portuguese and British presence."],
        ["Alupa-era coastal history", "Port towns and Indian Ocean trade", "Layered local and colonial histories"],
        "Dynastic influence and port histories differ along the coast; precise site-level timelines need local historical sources.",
        undefined,
        "/images/karavali/mirjan-fort.jpg",
      ),
      communities: category(
        "Tulu, Kannada, Konkani and Beary-speaking communities, among many others, shape the coast's plural identities.",
        ["Bunts, Billava, Mogaveera, Beary, Konkani-speaking, Havyaka and many other communities have distinct histories and practices. Coastal identity is not singular: language, livelihood and ritual traditions vary from taluk to taluk."],
        ["Fishing, farming and trading communities", "Tulu, Konkani and Beary cultural traditions", "Plural religious and linguistic life"],
        "Community names are examples, not a complete list; seek community-led accounts and avoid flattening distinct identities.",
        undefined,
        "/images/karavali/kambala-race.jpg",
      ),
      languages: category(
        "Tulu, Kannada, Konkani and Beary are among the languages heard across the coast, alongside many local varieties.",
        ["Language use changes along the coastline and inland foothills. Tulu is widely spoken in Dakshina Kannada and Udupi; Konkani has multiple local varieties, and Beary is a distinct language with a strong coastal presence."],
        ["Tulu and regional Kannada", "Konkani varieties", "Beary and multilingual coastal towns"],
        "The number and naming of Konkani and other speech varieties should be confirmed with language communities.",
        undefined,
        "/images/karavali/yakshagana-performance.jpg",
      ),
      festivals: category(
        "Temple festivals, seasonal rituals, pilgrimage and community celebrations follow both regional and local calendars.",
        ["Bhuta Kola/Tambila traditions are important in parts of Tulu Nadu. Udupi's Krishna Matha Paryaya is a major institutional festival cycle; Kambala buffalo races are held at seasonal venues, and Aati Kalenja is associated with the monsoon season."],
        ["Bhuta Kola and related spirit worship traditions", "Udupi Paryaya", "Kambala and Aati Kalenja"],
        "Ritual names, meanings and participation differ among communities; document them with local practitioners.",
        undefined,
        "/images/karavali/kambala-race.jpg",
      ),
      "performing-arts": category(
        "Elaborate folk theatre, ritual performance and music are central to the coast's cultural memory.",
        ["Yakshagana combines singing, percussion, dialogue and stylised costume in performances drawing on epic narratives. Other traditions include Tulu theatre and ritual forms such as Pili Vesha, which is performed during some local celebrations."],
        ["Yakshagana and its regional styles", "Tulu theatre traditions", "Pili Vesha and community performance"],
        "Performance forms evolve and differ between troupes; credit performers and record local terminology.",
        undefined,
        "/images/karavali/yakshagana-performance.jpg",
      ),
      food: category(
        "Rice, coconut, seafood and locally grown spices anchor a cuisine with distinct Tulu, Konkani and other community traditions.",
        ["Neer dosa, kori rotti and a range of fish curries are associated with parts of the coast. Coconut-based preparations and seasonal ingredients are common, while vegetarian and festival foods vary by community."],
        ["Neer dosa and kori rotti", "Fish and coconut-based curries", "Distinct Konkani and vegetarian festival foods"],
        "Food traditions are community-specific; recipes and dish origins should be credited to their cooks and local sources.",
        undefined,
        "/images/karavali/neer-dosa.jpg",
      ),
      architecture: category(
        "Coastal homes and sacred buildings respond to heavy monsoon rain, timber availability and local ritual practice.",
        ["Traditional houses often use steep tiled roofs, shaded verandas and internal courtyards. Temple architecture and older port-town buildings reflect distinct periods and communities; surviving examples should be documented locally rather than treated as one uniform coastal style."],
        ["Deep eaves and tiled roofs", "Courtyard homes and laterite construction", "Temple and port-town architecture"],
        "Architectural forms vary across the coast and have changed over time; site-specific documentation is needed.",
        undefined,
        "/images/karavali/coastal-home.jpg",
      ),
      agriculture: category(
        "Paddy, arecanut, coconut, cashew and fishing livelihoods reflect the coastal climate and its riverine landscapes.",
        ["Rice paddies occupy low-lying fields; arecanut and coconut gardens are common inland from the shore. Fishing and small-scale processing support many coastal livelihoods, while cashew and horticulture are important in some areas."],
        ["Paddy cultivation in lowlands", "Arecanut, coconut and cashew", "Marine and estuarine fishing knowledge"],
        "Livelihoods differ by coast, estuary and upland; avoid assuming the same crop or fishing practice across districts.",
        undefined,
        "/images/karavali/kambala-race.jpg",
      ),
      "oral-history": category(
        "Epic ballads, ritual narratives and community histories keep coastal stories in circulation.",
        ["The Siri epic is an important Tulu oral narrative carried through recitation and performance. Koti and Chennaya are remembered as heroic figures in Tulu ballad traditions; local versions and interpretations differ."],
        ["The Siri epic", "Koti and Chennaya ballads", "Bhuta narratives and family histories"],
        "These traditions have multiple versions and meanings; preserve narrators' own framing and permissions.",
        undefined,
        "/images/karavali/yakshagana-performance.jpg",
      ),
      knowledge: category(
        "Fishing, boatbuilding, food preservation and craft skills reflect generations of adaptation to sea and monsoon.",
        ["Traditional knowledge includes reading tides and seasonal fish movements, maintaining nets and boats, and processing arecanut and coconut. Yakshagana costume and instrument-making skills are also sustained by specialist practitioners."],
        ["Boat, net and navigation skills", "Coconut, arecanut and food processing", "Yakshagana costume and instrument craft"],
        undefined,
        undefined,
        "/images/karavali/malpe-harbour.jpg",
      ),
      personalities: category(
        "Coastal Karnataka has produced writers, reformers, artists and leaders whose influence extends well beyond the shoreline.",
        ["Kota Shivarama Karanth, born in Kota in present-day Udupi district, was a major Kannada writer and cultural figure. Rani Abbakka of Ullal is remembered for resisting Portuguese power; accounts of her life combine historical record and later popular memory."],
        ["Kota Shivarama Karanth and Kannada letters", "Rani Abbakka and the history of Ullal", "Writers and performers from coastal districts"],
        "Some celebrated historical biographies blend archival evidence and oral tradition; consult both and distinguish them.",
        undefined,
        "/images/karavali/yakshagana-performance.jpg",
      ),
      "iconic-places": category(
        "Karavali's landmarks connect sacred towns, working harbours, laterite forts, islands and forested rock formations.",
        ["Explore a district-scoped selection of places across Dakshina Kannada, Udupi and Uttara Kannada. Each place page distinguishes documented information from oral tradition and links to the source material used."],
        ["St. Mary's Islands and Udupi Sri Krishna Matha", "Kadri and Mangaluru's coastal heritage", "Mirjan Fort, Gokarna and Yana"],
        undefined,
        [
          { label: "Karnataka Tourism - Udupi", url: "https://karnatakatourism.org/en/destinations/udupi/" },
          { label: "Uttara Kannada District Portal - Mirjan Fort", url: "https://uttarakannada.nic.in/en/tourist-place/mirjan-fort-kumta/" },
        ],
        "/images/karavali/st-marys-islands.jpg",
      ),
      "ancient-history": category(
        "Coastal history is layered: living sacred sites, regional polities, port networks and laterite fortifications all have distinct chronologies.",
        ["Udupi Sri Krishna Matha is dated to the 13th century by Karnataka Tourism. Mirjan Fort is associated with regional coastal history and is built with local laterite; the Uttara Kannada district portal does not establish a definitive construction date. The page timelines therefore avoid treating traditional accounts as settled dates."],
        ["Udupi's 13th-century Matha tradition", "Mirjan Fort's laterite construction", "Site histories with dates and traditions separated"],
        undefined,
        [
          { label: "Karnataka Tourism - Udupi Sri Krishna Temple", url: "https://karnatakatourism.org/en/attractions/udupi-sri-krishna-temple/" },
          { label: "Uttara Kannada District Portal - Mirjan Fort", url: "https://uttarakannada.nic.in/en/tourist-place/mirjan-fort-kumta/" },
        ],
        "/images/karavali/mirjan-fort.jpg",
      ),
      "maritime-ports": category(
        "Ports, fishing harbours and ferry routes make the sea a lived landscape as well as a historic trade corridor.",
        ["Mangaluru is a coastal port city; Malpe serves as a harbour and a departure point for St. Mary's Islands. New Mangalore Port Authority publishes current port operations and notices. This guide does not infer a single uninterrupted trade history from the presence of today's port."],
        ["Mangaluru's port-city setting", "Malpe harbour and island ferry access", "New Mangalore Port Authority"],
        "Historical claims about individual ports require period-specific archival or gazetteer evidence.",
        [
          { label: "Karnataka Tourism - Mangaluru", url: "https://karnatakatourism.org/en/destinations/mangaluru/" },
          { label: "New Mangalore Port Authority", url: "https://newmangaloreport.gov.in/" },
        ],
        "/images/karavali/malpe-harbour.jpg",
      ),
      biodiversity: category(
        "The coast-to-Ghat transition brings together beaches, estuaries, river mouths and Western Ghats forests.",
        ["The three districts include varied coastal and upland habitats. Aghanashini, Sharavathi, Kali, Netravati and Gurupura river systems meet the sea along this landscape. This overview avoids naming species or conservation status without a site-specific source."],
        ["Western Ghats forest edge", "Estuary and mangrove habitats", "Coastal and river-mouth ecosystems"],
        "Species lists and protected-area boundaries should be checked against current Forest Department records.",
        [
          { label: "Uttara Kannada District Portal", url: "https://uttarakannada.nic.in/en/" },
          { label: "Dakshina Kannada District Portal", url: "https://dk.nic.in/en/" },
        ],
        "/images/karavali/yana-caves.jpg",
      ),
      "rivers-estuaries": category(
        "Short west-flowing rivers shape Karavali's estuaries, islands, fishing grounds and settlements.",
        ["The regional overview records rivers including Netravati, Gurupura, Swarna, Sita, Sharavathi, Aghanashini, Gangavali and Kali. Their estuaries create changing brackish-water landscapes; local conditions vary by season and site."],
        ["Netravati and Gurupura estuaries", "Swarna and Sita river mouths", "Sharavathi, Aghanashini and Kali systems"],
        undefined,
        [
          { label: "Karnataka Tourism - St. Mary's Island", url: "https://karnatakatourism.org/en/attractions/st-marys-island/" },
          { label: "Uttara Kannada District Portal", url: "https://uttarakannada.nic.in/en/" },
        ],
        "/images/karavali/st-marys-islands.jpg",
      ),
      "tourism-experiences": category(
        "Visitors can move between pilgrimage towns, beaches, islands, forts and forest landscapes across the three districts.",
        ["The place explorer groups destinations by district and category. Ferry access, temple entry, weather and public facilities can change; consult current official guidance before travelling and follow local safety and conservation rules."],
        ["Udupi's temple and island routes", "Mangaluru's city and beach visits", "Uttara Kannada's forts, pilgrimage sites and forest landscapes"],
        "Travel information is descriptive, not a live schedule or safety advisory.",
        [
          { label: "Karnataka Tourism - Udupi", url: "https://karnatakatourism.org/en/destinations/udupi/" },
          { label: "Karnataka Tourism - Mangaluru", url: "https://karnatakatourism.org/en/destinations/mangaluru/" },
        ],
        "/images/karavali/gokarna-kotiteertha.jpg",
      ),
      "education-reformers": category(
        "Schools, colleges, writers and public figures are part of Karavali's modern cultural history.",
        ["St. Aloysius in Mangaluru is a long-standing educational institution. The coast is also associated with writers and artists, including Kota Shivarama Karanth of Udupi district. Biographical details on this page are kept brief where a dedicated institutional source is not available."],
        ["St. Aloysius and Mangaluru's education history", "Kota Shivarama Karanth and Kannada letters", "District-level literary and reform traditions"],
        "This category is a starting point; biographies should be expanded with institution and archive citations.",
        [
          { label: "St. Aloysius (Deemed to be University)", url: "https://staloysius.edu.in/" },
          { label: "Karnataka Tourism - Udupi", url: "https://karnatakatourism.org/en/destinations/udupi/" },
        ],
        "/images/karavali/st-aloysius-chapel.jpg",
      ),
    },
  },
  "malenadu-kodagu": {
    introduction: "The rain-rich Malenadu highlands and Kodagu's coffee-growing hills are connected by forested slopes, river headwaters and distinctive agrarian and community traditions.",
    heroImage: malenaduPhotos.highlands.src,
    heroImageAlt: "Green highland slopes in Kudremukh, Karnataka",
    heroImageAttribution: malenaduPhotos.highlands,
    categories: {
      geography: category(
        "The Western Ghats rise into cloud forests, plantations and river headwaters across Malenadu and Kodagu.",
        [
          "Chikkamagaluru's district profile places the district in the Western Ghats and names Mullayanagiri as its highest point. It also identifies the Tunga and Bhadra among rivers sourced in the district's mountains.",
          "Kodagu's Talacauvery is a sacred landscape associated with the Kaveri's origin. The sacred-origin account records religious tradition and is not a hydrological assessment.",
          "Jog Falls is often approached from Shivamogga, but the falls themselves are in Siddapura taluk, Uttara Kannada district. The district tourism page distinguishes the Shivamogga viewpoint from the waterfall's location.",
        ],
        ["Mullayanagiri and the Chikkamagaluru highlands", "Tunga and Bhadra source landscapes", "Talacauvery's religious significance and the Jog Falls viewpoint"],
        "A comprehensive list of peaks, protected-area boundaries, species, river courses and waterfall locations needs current site-specific sources. Candidate records include Baba Budangiri, Kudremukha, Tadiandamol, Pushpagiri, Brahmagiri, Kodachadri, Agumbe, Abbey, Iruppu, Hebbe, Kalhatti and Unchalli Falls; Hemavathi, Sharavathi, Harangi and Lakshmanatirtha; and Nagarahole, Kudremukh, Bhadra, Pushpagiri, Brahmagiri and Sharavathi Valley protected landscapes. Verify each location, district boundary and current protection status before presenting it as regional fact.",
        [
          { label: "About District — Chikkamagaluru District Administration", url: "https://chikkamagaluru.nic.in/en/about-district/" },
          { label: "Talacauvery — Kodagu District Administration", url: "https://kodagu.nic.in/en/tourist-place/talacauvery/" },
          { label: "Jog Falls Viewpoint — Shivamogga District Administration", url: "https://shivamogga.nic.in/en/tourist-place/jogfalls/" },
        ],
        malenaduPhotos.iruppuFalls.src,
        malenaduPhotos.iruppuFalls,
        "Iruppu Falls flowing through a forested landscape in Kodagu, Karnataka",
      ),
      history: category(
        "Hill polities, local chieftaincies, princely-era rule and plantation economies have shaped this diverse upland region.",
        ["The Keladi Nayakas were influential in parts of the Malenadu. Kodagu was governed by the Haleri dynasty before its annexation by the British in 1834; later plantation development transformed land use and labour across the hills."],
        ["Keladi Nayaka histories", "Haleri dynasty and Kodagu", "Colonial-era coffee and plantation change"],
        "The histories of Malenadu and Kodagu are related but distinct; period-specific claims and local freedom-movement accounts need further archival verification.",
        [
          { label: "About District — Kodagu District Administration", url: "https://kodagu.nic.in/en/about-district/" },
          { label: "About District — Shivamogga District Administration", url: "https://shivamogga.nic.in/en/about-district/" },
          { label: "About District — Chikkamagaluru District Administration", url: "https://chikkamagaluru.nic.in/en/about-district/" },
        ],
        malenaduPhotos.madikeriFort.src,
        malenaduPhotos.madikeriFort,
        "Madikeri Fort in Kodagu, Karnataka",
      ),
      communities: category(
        "Kodava, Arebhashe, Havyaka, Kannada-speaking and many other communities sustain distinct identities across the hills.",
        ["Kodagu is home to Kodava communities as well as Arebhashe-speaking Gowdas, Havyakas, Yeravas, Jenu Kurubas and others. Malenadu districts are similarly diverse; community-specific customs and histories should be described on their own terms."],
        ["Kodava cultural traditions", "Arebhashe, Havyaka and other local identities", "Forest, farming and plantation communities"],
        "This is not a complete community list. Language groups, caste identities and Indigenous communities are distinct; further community-led documentation is essential.",
        [
          { label: "Arebhashe Academy — Government of Karnataka", url: "https://arebhasheacademy.karnataka.gov.in/11/academy/en" },
          { label: "Coorg — Karnataka Tourism", url: "https://karnatakatourism.org/en/destinations/coorg/" },
        ],
        malenaduPhotos.kappekali.src,
        malenaduPhotos.kappekali,
        "Kodava youths performing Kappekali, a traditional competitive folk dance",
      ),
      languages: category(
        "Kodava takk, Kannada varieties and Arebhashe are among the languages and speech forms of the uplands.",
        ["Kodava takk is spoken in Kodagu and has a rich oral tradition. Kannada varieties are widespread; Tulu, Malayalam and other languages are also present in border and plantation communities."],
        ["Kodava takk", "Malenadu and Kodagu Kannada varieties", "Arebhashe and neighbouring languages"],
        "Do not infer vocabulary, pronunciation or language vitality from this overview. Verified recordings and community-reviewed linguistic references are still needed.",
        [
          { label: "Arebhashe language — Karnataka Arebhashe Samskruthi and Sahitya Academy", url: "https://arebhasheacademy.karnataka.gov.in/12/arebashe/kn" },
        ],
        malenaduPhotos.kodavaScript.src,
        malenaduPhotos.kodavaScript,
        "Kodava takk written in Kodava lipi",
      ),
      festivals: category(
        "Harvest, ancestor remembrance and seasonal river observances are central to many highland celebrations.",
        ["Kodagu District Administration describes Huthri as a Kodava harvest observance associated with the new paddy crop. Karnataka Tourism documents Kaveri Sankramana at Talakaveri and Bhagamandala. Kailpodh is described in the tourism account as a Kodava practice; none of these records should be generalized to all communities in the region."],
        ["Huthri and the paddy harvest", "Kaveri Sankramana at Talakaveri", "Kailpodh and community-specific observances"],
        "Sources use Huthri; whether and where Puthari is used as an alternative name needs confirmation. Ritual details and dates differ between families and localities.",
        [
          { label: "Fairs & Festivals — Kodagu District Administration", url: "https://kodagu.nic.in/en/tourism/culture-heritage/" },
          { label: "Kaveri Sankramana — Karnataka Tourism", url: "https://karnatakatourism.org/en/events/kaveri-sankramana/" },
          { label: "Coorg — Karnataka Tourism", url: "https://karnatakatourism.org/en/destinations/coorg/" },
        ],
        malenaduPhotos.ummathaat.src,
        malenaduPhotos.ummathaat,
        "Kodava women performing Ummathaat after the Puthari harvest festival",
      ),
      "performing-arts": category(
        "Dance, song and ritual performance express community histories and seasonal celebration in the highlands.",
        ["Candidate practitioner-led records include Kodava Ummathaat, Bolakaat and Kolaat, Hase Chittara, folk music and Yakshagana where locally practised. Record local names and performance contexts with the practitioners rather than assuming a single regional form."],
        ["Ummathaat and Bolakaat — practitioner verification needed", "Kolaat and Hase Chittara — locality-specific records needed", "Yakshagana only where documented locally"],
        "Names, costume, community associations and performance contexts require practitioner-led verification. No recordings are presented as authentic community testimony without consent.",
        undefined,
        malenaduPhotos.kathiyath.src,
        malenaduPhotos.kathiyath,
        "Kodava men performing Kathiyath, a traditional sword dance",
      ),
      food: category(
        "Rice, forest and garden produce, pork and coffee are prominent in many—but not all—highland food traditions.",
        ["Potential community recipe records include names such as pandi curry, kadambuttu, noolputtu, bamboo-shoot preparations, akki rotti, pathrode and tambuli. This archive does not yet verify individual recipes, ingredients, or which communities and localities identify with them; those details should be collected with cooks."],
        ["Kodava pork-food traditions (broad source association)", "Rice-based meals and seasonal produce", "Recipes awaiting cook-led documentation"],
        "The cited tourism overview supports only a broad Kodava pork-food association; specific recipes, ingredients and community ownership need cook-led documentation and verification.",
        [
          { label: "Food & Culinary — Karnataka Tourism", url: "https://karnatakatourism.org/en/experiences/food-culinary/" },
        ],
        malenaduPhotos.pandiCurry.src,
        malenaduPhotos.pandiCurry,
        "Pandi curry, a pork dish associated with Kodagu cuisine",
      ),
      architecture: category(
        "Large family homes, sloping roofs and plantation-era buildings respond to steep terrain and intense rainfall.",
        ["The Kodava ainmane is a traditional ancestral home with particular social significance. In Malenadu, timber structures, deep verandas and steep tiled roofs are adapted to monsoon conditions; styles vary by community, period and wealth."],
        ["Kodava ainmane houses", "Steep roofs and sheltered verandas", "Plantation bungalows and village homes"],
        "Architectural terms and house customs are community-specific and should be confirmed with local families and historians.",
        undefined,
        "/images/kodava-ainmane.svg",
        undefined,
        "Illustration of a Kodava ainmane ancestral home",
      ),
      agriculture: category(
        "Coffee, pepper, cardamom and paddy are cultivated across a landscape of forest edges and rain-fed slopes.",
        ["Coffee and pepper are major plantation crops in Kodagu and parts of Chikkamagaluru. Paddy is grown in valley fields, while arecanut, cardamom and other crops vary by elevation and locality; farming systems are affected by changing rainfall and land use."],
        ["Coffee and pepper", "Paddy in valley fields", "Cardamom, arecanut and mixed gardens"],
        "Crop descriptions come from undated district pages and should not be read as current production statistics. Traditional observations are not presented as scientific recommendations.",
        [
          { label: "About District — Kodagu District Administration", url: "https://kodagu.nic.in/en/about-district/" },
          { label: "About District — Chikkamagaluru District Administration", url: "https://chikkamagaluru.nic.in/en/about-district/" },
          { label: "Horticulture Department — Shivamogga District Administration", url: "https://shivamogga.nic.in/en/horticulture-department/" },
          { label: "Coffee in India — Coffee Board of India", url: "https://coffeeboard.gov.in/IndexContent.html" },
        ],
        malenaduPhotos.coffeeFields.src,
        malenaduPhotos.coffeeFields,
        "Coffee shade trees and paddy fields in Balamuri, Coorg",
      ),
      "oral-history": category(
        "Ancestral narratives, place-based legends and songs carry memory through family and community gatherings.",
        ["Kodava oral narratives often connect families to landscapes, ancestors and the Kaveri. Malenadu storytelling also includes forest and river legends; versions are local and should be recorded with the storyteller's own context."],
        ["Kodava family and ancestral narratives", "Kaveri and Talakaveri legends", "Malenadu forest and river stories"],
        "These are living traditions, not a single canonical text; record locality, storyteller and version.",
        undefined,
        malenaduPhotos.deshakattPaat.src,
        malenaduPhotos.deshakattPaat,
        "Deshakatt Paat, a Kodava folk verse in Kodava script about Kodagu and its provinces",
      ),
      knowledge: category(
        "Highland skills include coffee cultivation, forest stewardship, spice processing and construction suited to heavy rain.",
        ["Farmers maintain practical knowledge of shade-grown coffee, pepper vines and mixed gardens. Local expertise also includes managing monsoon water, building and repairing steep-roofed houses, and gathering forest products where permitted."],
        ["Coffee and mixed-garden cultivation", "Monsoon water and hillside management", "Timber, roof and spice-processing skills"],
        "Traditional ecological knowledge belongs to its communities; document it with consent and alongside current conservation guidance.",
        undefined,
        "/images/malenadu-coffee-estate.svg",
        undefined,
        "Illustration of a coffee estate in the Malenadu highlands",
      ),
      personalities: category(
        "Military leaders, writers and public figures from the hills have contributed to India's civic, literary and cultural history.",
        ["Field Marshal K. M. Cariappa and General K. S. Thimayya were born in Kodagu and became prominent leaders of the Indian Army. Kuvempu, born in Shivamogga district, is a major Kannada literary figure associated with the Malenadu landscape."],
        ["Field Marshal K. M. Cariappa", "General K. S. Thimayya", "Kuvempu and Malenadu's literary legacy"],
        "Confirm biographical details and distinguish birthplace, upbringing and later regional association.",
        undefined,
        malenaduPhotos.kuvempu.src,
        malenaduPhotos.kuvempu,
        "Portrait of Kannada poet Kuvempu",
      ),
    },
  },
} satisfies Record<RegionSlug, RegionPageContent>;

export function isRegionSlug(slug: string): slug is RegionSlug {
  return Object.prototype.hasOwnProperty.call(regionalContent, slug);
}
