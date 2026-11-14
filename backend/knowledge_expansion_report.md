# SARVAM Regional Knowledge Expansion Report

## Summary

The three regional JSONL batches contain 45 source-attributed records, extracted
from 33 distinct URLs:

| Corpus | Records | District coverage |
|---|---:|---:|
| Old Mysuru | 11 | 10 of 10 |
| Uttara Karnataka | 23 | 15 of 15 |
| Malenadu & Kodagu | 11 | 3 of 3 |
| **Total** | **45** | **28 of 28 target districts** |

Subject categories across the 45 records:

| Category | Records |
|---|---:|
| Agriculture | 14 |
| Geography | 10 |
| History | 11 |
| Heritage | 5 |
| Culture | 4 |
| Foodways | 1 |

The records cover agriculture, geography, history, heritage, culture, and
foodways. They are stored in:

- `data/old_mysuru_expansion.jsonl`
- `data/uttara_karnataka_expansion.jsonl`
- `data/malenadu_kodagu_expansion.jsonl`

## Index result

Before these batches, the index contained 96 documents. The initial 27-record
batch raised it to 123; this ingestion added 18 more records. Re-running all
three files skipped the 27 previously indexed records, with no failures.

| Region | Final documents |
|---|---:|
| Old Mysuru | 32 |
| Uttara Karnataka | 66 |
| Karavali | 16 |
| Malenadu & Kodagu | 27 |
| **Total** | **141** |

The full-text index has 141 entries, and all 31 districts represented in SARVAM
remain covered. No new Karavali records were ingested. Its 16-record count and
record-hash aggregate remain unchanged:
`0ef47e3c1e377f10a637735d2a92e52af080157e42fee02d3212db3a1f978903`.

## Source list

Source URLs are stored on each JSONL record and returned with chat citations.
The 33 distinct sources used for these batches are:

### Old Mysuru

- Mysuru District Administration — [Railway Museum](https://mysore.nic.in/en/tourist-place/railway-museum/)
- Bengaluru Urban District Administration — [Tipu Sultan's Summer Palace](https://bengaluruurban.nic.in/en/tourist-place/tipu-sultans-summer-palace/)
- Bengaluru Rural District Administration — [Department of Agriculture](https://bangalorerural.nic.in/en/agriculture/)
- Bengaluru South District Administration — [Agriculture Department](https://bengalurusouth.nic.in/en/agriculture-department/)
- Mandya District Administration — [Sangama](https://mandya.nic.in/en/tourist-place/sangama/)
- Mandya District Administration — [Karighatta](https://mandya.nic.in/en/tourist-place/karighatta/)
- Chamarajanagar District Administration — [About District](https://chamrajnagar.nic.in/en/about-district/)
- Chikkaballapura District Administration — [Nandi Hills](https://chikkaballapur.nic.in/en/tourist-place/nandi-hills/)
- Hassan District Administration — [Shetty Halli Church](https://hassan.nic.in/en/tourist-place/shetty-halli-church/)
- Tumakuru District Administration — [Araluguppe Chennakesava Temple](https://tumkur.nic.in/en/tourist-place/araluguppe-chennakesava-temple/)
- Kolar District Administration — [History](https://kolar.nic.in/en/history/)

### Uttara Karnataka

- Gadag District Administration — [Agriculture](https://gadag.nic.in/en/agriculture/)
- University of Agricultural and Horticultural Sciences, Shivamogga — [Research Stations](https://uahs.edu.in/research-stations/)
- University of Agricultural Sciences, Raichur — [Crop Varieties Released, 2009-10 to 2018-19](https://uasraichur.karnataka.gov.in/storage/pdf-files/1.Varieties%20Released%20(30)%20English-2009-10%20to%202018-19.pdf)
- Belagavi District Administration — [Gokak Falls](https://belagavi.nic.in/en/tourist-place/gokak-falls-gokak/)
- Vijayapura District Administration — [Almatti Dam](https://vijayapura.nic.in/en/tourist-place/almatti-dam/)
- Kalaburagi District Administration — [Agriculture](https://kalaburagi.nic.in/en/agriculture/)
- Bagalkot District Administration — [Badami Caves](https://bagalkot.nic.in/en/tourist-place/badami-caves/)
- Dharwad District Administration — [About District](https://dharwad.nic.in/en/about-district/)
- Gadag District Administration — [About District](https://gadag.nic.in/en/about-district/)
- Vijayapura District Administration — [Asar Mahal](https://vijayapura.nic.in/en/tourist-place/asar-mahal/)
- Haveri District Administration — [History](https://haveri.nic.in/en/history/)
- Davanagere District Administration — [Shanthi Sagara Lake](https://davanagere.nic.in/en/tourist-place/shanthi-sagara-lake/)
- Chitradurga District Administration — [About District](https://chitradurga.nic.in/en/about-district/)
- Bidar District Administration — [Places of Interest](https://bidar.nic.in/en/places-of-interest/)
- Yadgir District Administration — [Tourist Places](https://yadgir.nic.in/en/tourist-places/)
- Koppal District Administration — [District History](https://koppal.nic.in/en/history/)
- Ballari District Administration — [Kumaraswamy Temple, Sandur](https://ballari.nic.in/en/tourist-place/kumaraswamy-temple-sandur/)
- Vijayanagara District Administration — [Ankasamudra Bird Sanctuary](https://vijayanagara.nic.in/en/tourist-place/ankasamudra-bird-sanctuary-hagaribommanahalli-taluk/)
- Kalaburagi District Administration — [About District](https://kalaburagi.nic.in/en/about-district/)

### Malenadu & Kodagu

- Kodagu District Administration — [Nalknad Aramane (Palace)](https://kodagu.nic.in/en/tourist-place/nalknad-palace/)
- Chikkamagaluru District Administration — [Places of Interest](https://chikkamagaluru.nic.in/en/places-of-interest/)
- Shivamogga District Administration — [Culture & Heritage](https://shivamogga.nic.in/en/culture-heritage/)

## Validation and tests

- Parsed and validated all 45 JSONL records using the ingestion validator;
  record IDs were unique across the batches.
- Incremental ingestion reported 18 inserted, 27 duplicates, and 0 failed.
- `python -m pytest tests/test_chat_api.py -q`: **13 passed**.
- Full backend test suite, `python -m pytest -q`: **15 passed**.
- Sent each record title through the live FastAPI test client with its region and
  district scope: **45 of 45 expected records were returned as cited sources**.
- Confirmed 141 SQLite documents and 141 FTS entries, 31 distinct districts,
  and zero embedding rows.
- Confirmed the Karavali count and record-hash aggregate were unchanged.

The retrieval check exposed a category-filter gap for history questions about
heritage records. The filter now includes both `history` and `heritage`, with a
focused regression test.

## Provenance and limitations

Records retain a source URL, source title and organization, extraction date,
verification status, and an uncertainty note. Most district portal pages do
not state publication dates. Historical timelines and descriptive local
profiles are attributed to those portals rather than presented as
independently corroborated scholarship.

Undated production, acreage, population, and other numerical claims were not
added as current statistics. Explicitly dated source periods are retained where
available, including the Raichur crop-variety catalogue's 2009-10 to 2018-19
range and a Ramanagara agriculture record for 2019-20. The Shettihalli Church
page gives inconsistent construction-year detail, so its record uses the
broader 1860s date. The Haveri inscription count and undated Ankasamudra bird
counts and area figures were omitted. The Bidar Guru Nanak Jhira account is
identified as local legend; it is not asserted as independently verified
history.

## Retrieval and AI status

The chat reads the SQLite FTS5 index and retrieves keyword-matched records; it
does not use semantic/vector search because the index has no embeddings. The
backend currently operates in extractive mode when Groq credentials and model
configuration are absent. It returns cited source excerpts rather than
claiming a generated synthesis. The expansion does not change those runtime
limitations.
