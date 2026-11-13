export type KaravaliPhotoCreditRecord = {
  title: string;
  creator: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
};

export const karavaliPhotoCredits: Record<string, KaravaliPhotoCreditRecord> = {
  "/images/karavali/st-marys-islands.jpg": {
    title: "St. Mary's Islands",
    creator: "Nativeplants garden",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:St._Mary%27s_Islands_3.jpg",
  },
  "/images/karavali/udupi-krishna-matha.jpg": {
    title: "Udupi Sri Krishna Matha",
    creator: "Ashok Prabhakaran",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Udupi_Sri_Krishna_Matha_Temple.jpg",
  },
  "/images/karavali/malpe-harbour.jpg": {
    title: "Malpe Beach and Harbour",
    creator: "Raghavan2010",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Malpe_Beach,Udupi_01.jpg",
  },
  "/images/karavali/kadri-manjunatha.jpg": {
    title: "Kadri Manjunatha Temple",
    creator: "Ssriram mt",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kadri_Manjunatha_temple_Mangalore.jpg",
  },
  "/images/karavali/st-aloysius-chapel.jpg": {
    title: "St. Aloysius Chapel",
    creator: "Disha Gangadhara",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:St._Aloysius_Chapel_(60864).jpg",
  },
  "/images/karavali/panambur-beach.jpg": {
    title: "Panambur Beach",
    creator: "Lpp3535",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Panambur_Beach.jpg",
  },
  "/images/karavali/gokarna-kotiteertha.jpg": {
    title: "Kotiteertha, Gokarna",
    creator: "Miran Rijavec",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:India_Karnataka_Gokarna_Kotiteertha_(1481547363).jpg",
  },
  "/images/karavali/murudeshwar.jpg": {
    title: "Murudeshwar Temple and Shiva statue",
    creator: "Venkatakrishna.K",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Murudeshwar_temple,_Karnataka,_Lord_Shiva.jpg",
  },
  "/images/karavali/mirjan-fort.jpg": {
    title: "Mirjan Fort",
    creator: "Vu2sga",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Mirjan_Fort,_Kumta,_Karnataka..JPG",
  },
  "/images/karavali/yana-caves.jpg": {
    title: "Yana rock formations",
    creator: "Ranjeeth07",
    license: "CC0 1.0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Yana_Caves,_located_in_the_Uttara_Kannada_district_of_Karnataka.jpg",
  },
  "/images/karavali/kambala-race.jpg": {
    title: "Kambala buffalo race at Vandar village",
    creator: "Rayabhari",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kambala,_he-buffalo_race_at_Vandar_village,_Udupi_Dist.,_Kar._India.jpg",
  },
  "/images/karavali/neer-dosa.jpg": {
    title: "Neer dosa",
    creator: "Hebbar.sudarshan",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Neer-dosa-.jpg",
  },
  "/images/karavali/coastal-home.jpg": {
    title: "Guthumane traditional home",
    creator: "Hari Prasad Nadig",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Guthumane.jpg",
  },
  "/images/karavali/yakshagana-performance.jpg": {
    title: "Yakshagana performance",
    creator: "Vinay.hegde2",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Yakshagana_Performance.jpg",
  },
};

export function getKaravaliPhotoCredit(
  image: string,
): KaravaliPhotoCreditRecord | undefined {
  return karavaliPhotoCredits[image];
}
