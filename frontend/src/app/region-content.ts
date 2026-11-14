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
] as const;

export type RegionCategoryId = (typeof regionCategories)[number]["id"];
export type RegionSlug =
  | "old-mysuru"
  | "uttara-karnataka"
  | "karavali"
  | "malenadu-kodagu";

export interface RegionCategoryContent {
  overview: string;
  details: string[];
  highlights: string[];
  verificationNote?: string;
}

export interface RegionPageContent {
  introduction: string;
  heroImage: string;
  heroImageAlt: string;
  categories: Record<RegionCategoryId, RegionCategoryContent>;
}

const category = (
  overview: string,
  details: string[],
  highlights: string[],
  verificationNote?: string,
): RegionCategoryContent => ({ overview, details, highlights, verificationNote });

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
    heroImage: "/images/yakshagana-stage.svg",
    heroImageAlt: "Illustration of a Yakshagana stage, a celebrated coastal performance tradition",
    categories: {
      geography: category(
        "A narrow coastal plain meets the Arabian Sea on one side and the steep, rain-fed Western Ghats on the other.",
        ["Rivers such as the Netravati, Sharavathi, Kali and Aghanashini flow westward into estuaries and the sea. Beaches, laterite plateaus, mangroves and hill forests create varied habitats along the districts."],
        ["Arabian Sea coastline and estuaries", "Western Ghats foothills", "Monsoon rivers, laterite and coastal wetlands"],
      ),
      history: category(
        "Coastal Karnataka's history has been shaped by maritime trade, local dynasties, pilgrimage centres and colonial-era encounters.",
        ["The Alupa dynasty is associated with early medieval rule in parts of the southern coast. Ports and river routes connected the coast to Indian Ocean trade; later histories include Vijayanagara influence, local chiefs and Portuguese and British presence."],
        ["Alupa-era coastal history", "Port towns and Indian Ocean trade", "Layered local and colonial histories"],
        "Dynastic influence and port histories differ along the coast; precise site-level timelines need local historical sources.",
      ),
      communities: category(
        "Tulu, Kannada, Konkani and Beary-speaking communities, among many others, shape the coast's plural identities.",
        ["Bunts, Billava, Mogaveera, Beary, Konkani-speaking, Havyaka and many other communities have distinct histories and practices. Coastal identity is not singular: language, livelihood and ritual traditions vary from taluk to taluk."],
        ["Fishing, farming and trading communities", "Tulu, Konkani and Beary cultural traditions", "Plural religious and linguistic life"],
        "Community names are examples, not a complete list; seek community-led accounts and avoid flattening distinct identities.",
      ),
      languages: category(
        "Tulu, Kannada, Konkani and Beary are among the languages heard across the coast, alongside many local varieties.",
        ["Language use changes along the coastline and inland foothills. Tulu is widely spoken in Dakshina Kannada and Udupi; Konkani has multiple local varieties, and Beary is a distinct language with a strong coastal presence."],
        ["Tulu and regional Kannada", "Konkani varieties", "Beary and multilingual coastal towns"],
        "The number and naming of Konkani and other speech varieties should be confirmed with language communities.",
      ),
      festivals: category(
        "Temple festivals, seasonal rituals, pilgrimage and community celebrations follow both regional and local calendars.",
        ["Bhuta Kola/Tambila traditions are important in parts of Tulu Nadu. Udupi's Krishna Matha Paryaya is a major institutional festival cycle; Kambala buffalo races are held at seasonal venues, and Aati Kalenja is associated with the monsoon season."],
        ["Bhuta Kola and related spirit worship traditions", "Udupi Paryaya", "Kambala and Aati Kalenja"],
        "Ritual names, meanings and participation differ among communities; document them with local practitioners.",
      ),
      "performing-arts": category(
        "Elaborate folk theatre, ritual performance and music are central to the coast's cultural memory.",
        ["Yakshagana combines singing, percussion, dialogue and stylised costume in performances drawing on epic narratives. Other traditions include Tulu theatre and ritual forms such as Pili Vesha, which is performed during some local celebrations."],
        ["Yakshagana and its regional styles", "Tulu theatre traditions", "Pili Vesha and community performance"],
        "Performance forms evolve and differ between troupes; credit performers and record local terminology.",
      ),
      food: category(
        "Rice, coconut, seafood and locally grown spices anchor a cuisine with distinct Tulu, Konkani and other community traditions.",
        ["Neer dosa, kori rotti and a range of fish curries are associated with parts of the coast. Coconut-based preparations and seasonal ingredients are common, while vegetarian and festival foods vary by community."],
        ["Neer dosa and kori rotti", "Fish and coconut-based curries", "Distinct Konkani and vegetarian festival foods"],
        "Food traditions are community-specific; recipes and dish origins should be credited to their cooks and local sources.",
      ),
      architecture: category(
        "Coastal homes and sacred buildings respond to heavy monsoon rain, timber availability and local ritual practice.",
        ["Traditional houses often use steep tiled roofs, shaded verandas and internal courtyards. Temple architecture and older port-town buildings reflect distinct periods and communities; surviving examples should be documented locally rather than treated as one uniform coastal style."],
        ["Deep eaves and tiled roofs", "Courtyard homes and laterite construction", "Temple and port-town architecture"],
        "Architectural forms vary across the coast and have changed over time; site-specific documentation is needed.",
      ),
      agriculture: category(
        "Paddy, arecanut, coconut, cashew and fishing livelihoods reflect the coastal climate and its riverine landscapes.",
        ["Rice paddies occupy low-lying fields; arecanut and coconut gardens are common inland from the shore. Fishing and small-scale processing support many coastal livelihoods, while cashew and horticulture are important in some areas."],
        ["Paddy cultivation in lowlands", "Arecanut, coconut and cashew", "Marine and estuarine fishing knowledge"],
        "Livelihoods differ by coast, estuary and upland; avoid assuming the same crop or fishing practice across districts.",
      ),
      "oral-history": category(
        "Epic ballads, ritual narratives and community histories keep coastal stories in circulation.",
        ["The Siri epic is an important Tulu oral narrative carried through recitation and performance. Koti and Chennaya are remembered as heroic figures in Tulu ballad traditions; local versions and interpretations differ."],
        ["The Siri epic", "Koti and Chennaya ballads", "Bhuta narratives and family histories"],
        "These traditions have multiple versions and meanings; preserve narrators' own framing and permissions.",
      ),
      knowledge: category(
        "Fishing, boatbuilding, food preservation and craft skills reflect generations of adaptation to sea and monsoon.",
        ["Traditional knowledge includes reading tides and seasonal fish movements, maintaining nets and boats, and processing arecanut and coconut. Yakshagana costume and instrument-making skills are also sustained by specialist practitioners."],
        ["Boat, net and navigation skills", "Coconut, arecanut and food processing", "Yakshagana costume and instrument craft"],
      ),
      personalities: category(
        "Coastal Karnataka has produced writers, reformers, artists and leaders whose influence extends well beyond the shoreline.",
        ["Kota Shivarama Karanth, born in Kota in present-day Udupi district, was a major Kannada writer and cultural figure. Rani Abbakka of Ullal is remembered for resisting Portuguese power; accounts of her life combine historical record and later popular memory."],
        ["Kota Shivarama Karanth and Kannada letters", "Rani Abbakka and the history of Ullal", "Writers and performers from coastal districts"],
        "Some celebrated historical biographies blend archival evidence and oral tradition; consult both and distinguish them.",
      ),
    },
  },
  "malenadu-kodagu": {
    introduction: "The rain-rich Malenadu highlands and Kodagu's coffee-growing hills are connected by forested slopes, river headwaters and distinctive agrarian and community traditions.",
    heroImage: "/images/karnataka-heritage.svg",
    heroImageAlt: "Illustration celebrating Karnataka's highland heritage",
    categories: {
      geography: category(
        "The Western Ghats rise into cloud forests, plantations and river headwaters across Malenadu and Kodagu.",
        ["Heavy monsoon rain feeds the Tunga, Bhadra, Hemavati and Kaveri river systems. The region includes evergreen forests, shola-grassland landscapes and cultivated slopes; Kodagu's Talakaveri is traditionally identified as the Kaveri's source."],
        ["Western Ghats forests and high-rainfall slopes", "Tunga, Bhadra, Hemavati and Kaveri headwaters", "Talakaveri and Kodagu's uplands"],
        "Ecological boundaries and river-source descriptions should be checked against current conservation and hydrological sources.",
      ),
      history: category(
        "Hill polities, local chieftaincies, princely-era rule and plantation economies have shaped this diverse upland region.",
        ["The Keladi Nayakas were influential in parts of the Malenadu. Kodagu was governed by the Haleri dynasty before its annexation by the British in 1834; later plantation development transformed land use and labour across the hills."],
        ["Keladi Nayaka histories", "Haleri dynasty and Kodagu", "Colonial-era coffee and plantation change"],
        "The histories of Malenadu and Kodagu are related but distinct; avoid treating them as one political unit.",
      ),
      communities: category(
        "Kodava, Arebhashe, Havyaka, Kannada-speaking and many other communities sustain distinct identities across the hills.",
        ["Kodagu is home to Kodava communities as well as Arebhashe-speaking Gowdas, Havyakas, Yeravas, Jenu Kurubas and others. Malenadu districts are similarly diverse; community-specific customs and histories should be described on their own terms."],
        ["Kodava cultural traditions", "Arebhashe, Havyaka and other local identities", "Forest, farming and plantation communities"],
        "Community categories and self-identification vary; further community-led documentation is essential.",
      ),
      languages: category(
        "Kodava takk, Kannada varieties and Arebhashe are among the languages and speech forms of the uplands.",
        ["Kodava takk is spoken in Kodagu and has a rich oral tradition. Kannada varieties are widespread; Tulu, Malayalam and other languages are also present in border and plantation communities."],
        ["Kodava takk", "Malenadu and Kodagu Kannada varieties", "Arebhashe and neighbouring languages"],
        "Language vitality and preferred names vary by community; this overview is not a complete language survey.",
      ),
      festivals: category(
        "Harvest, ancestor remembrance and seasonal river observances are central to many highland celebrations.",
        ["Kodava festivals include Kailpodh, Kaveri Sankramana and Puthari, each with distinctive local practices. Harvest celebrations and temple jatres across Malenadu follow their own community calendars."],
        ["Kailpodh and Puthari", "Kaveri Sankramana", "Local harvest and temple celebrations"],
        "Ritual details and dates differ between families and localities; seek community guidance before describing ceremonies.",
      ),
      "performing-arts": category(
        "Dance, song and ritual performance express community histories and seasonal celebration in the highlands.",
        ["Kodava performance traditions include Ummathat, Bolakat and Kolat, performed in particular social and ceremonial contexts. Yakshagana is also popular in some Malenadu areas, especially toward the coastal-facing districts."],
        ["Ummathat and Bolakat", "Kolat and community dance", "Yakshagana in western Malenadu"],
        "Names, costume and performance contexts should be verified with practitioners from the specific locality.",
      ),
      food: category(
        "Rice, forest and garden produce, pork and coffee are prominent in many—but not all—highland food traditions.",
        ["Kodava cuisine is known for pandi curry and kadambuttu; akki rotti and seasonal greens are also common in the broader highlands. Coffee is a major crop and social presence, while meals vary across communities and households."],
        ["Pandi curry and kadambuttu", "Rice-based meals and seasonal produce", "Coffee-growing and coffee-drinking traditions"],
        "Foodways are not uniform across Kodagu and Malenadu; document recipes with the people who make them.",
      ),
      architecture: category(
        "Large family homes, sloping roofs and plantation-era buildings respond to steep terrain and intense rainfall.",
        ["The Kodava ainmane is a traditional ancestral home with particular social significance. In Malenadu, timber structures, deep verandas and steep tiled roofs are adapted to monsoon conditions; styles vary by community, period and wealth."],
        ["Kodava ainmane houses", "Steep roofs and sheltered verandas", "Plantation bungalows and village homes"],
        "Architectural terms and house customs are community-specific and should be confirmed with local families and historians.",
      ),
      agriculture: category(
        "Coffee, pepper, cardamom and paddy are cultivated across a landscape of forest edges and rain-fed slopes.",
        ["Coffee and pepper are major plantation crops in Kodagu and parts of Chikkamagaluru. Paddy is grown in valley fields, while arecanut, cardamom and other crops vary by elevation and locality; farming systems are affected by changing rainfall and land use."],
        ["Coffee and pepper", "Paddy in valley fields", "Cardamom, arecanut and mixed gardens"],
        "Crop practices and ecological effects are changing; district-level agricultural sources are needed for current details.",
      ),
      "oral-history": category(
        "Ancestral narratives, place-based legends and songs carry memory through family and community gatherings.",
        ["Kodava oral narratives often connect families to landscapes, ancestors and the Kaveri. Malenadu storytelling also includes forest and river legends; versions are local and should be recorded with the storyteller's own context."],
        ["Kodava family and ancestral narratives", "Kaveri and Talakaveri legends", "Malenadu forest and river stories"],
        "These are living traditions, not a single canonical text; record locality, storyteller and version.",
      ),
      knowledge: category(
        "Highland skills include coffee cultivation, forest stewardship, spice processing and construction suited to heavy rain.",
        ["Farmers maintain practical knowledge of shade-grown coffee, pepper vines and mixed gardens. Local expertise also includes managing monsoon water, building and repairing steep-roofed houses, and gathering forest products where permitted."],
        ["Coffee and mixed-garden cultivation", "Monsoon water and hillside management", "Timber, roof and spice-processing skills"],
        "Traditional ecological knowledge belongs to its communities; document it with consent and alongside current conservation guidance.",
      ),
      personalities: category(
        "Military leaders, writers and public figures from the hills have contributed to India's civic, literary and cultural history.",
        ["Field Marshal K. M. Cariappa and General K. S. Thimayya were born in Kodagu and became prominent leaders of the Indian Army. Kuvempu, born in Shivamogga district, is a major Kannada literary figure associated with the Malenadu landscape."],
        ["Field Marshal K. M. Cariappa", "General K. S. Thimayya", "Kuvempu and Malenadu's literary legacy"],
        "Confirm biographical details and distinguish birthplace, upbringing and later regional association.",
      ),
    },
  },
} satisfies Record<RegionSlug, RegionPageContent>;

export function isRegionSlug(slug: string): slug is RegionSlug {
  return Object.prototype.hasOwnProperty.call(regionalContent, slug);
}
