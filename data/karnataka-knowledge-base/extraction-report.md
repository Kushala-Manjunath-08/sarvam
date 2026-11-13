# Karnataka Knowledge Base: Research and Extraction Report

**Extraction date:** 2026-11-14  
**Corpus:** [`documents.jsonl`](./documents.jsonl)  
**Region mapping:** [`regions.json`](./regions.json)  
**Generated source index:** [`source-registry.json`](./source-registry.json)

## Coverage

| Region | Districts | Records | Searchable | Needs review |
|---|---:|---:|---:|---:|
| Old Mysuru | 10 | 21 | 21 | 0 |
| Uttara Karnataka | 15 | 43 | 43 | 0 |
| Karavali | 3 | 18 | 16 | 2 |
| Malenadu & Kodagu | 3 | 16 | 16 | 0 |
| **Total** | **31** | **98** | **96** | **2** |

The corpus contains 72 distinct primary-source URLs. The generated registry
contains 76 unique source URLs after adding references to related sources; 74
sources support searchable records and 2 are associated with records retained
for review. Search uses verified records only. Current retrieval is keyword
based; semantic embeddings and generated answers are optional backend
configurations.

The corpus includes 40 agriculture records, including 2022–23 crop estimates
and five Government of Karnataka proposed crop-target records for 2025–26.
The targets for Belagavi, Bidar, Yadgir, Raichur, and Koppal are explicitly
described as targets, not observed outcomes. The 2022–23 Mysuru and
Chikkaballapura estimates come from the [Directorate of Economics and
Statistics crop report](https://des.karnataka.gov.in/storage/pdf-files/AGS/FRE2022-23Final.pdf);
the northern targets come from the [Department of Agriculture's 2025–26
proposal](https://raitamitra.karnataka.gov.in/storage/pdf-files/Final2025-26Target.pdf).

## Source and extraction method

- Prefer government district and state portals, government tourism and
  cultural institutions, and university or institutional publications.
- Retain claims only when the linked source supports the wording. Preserve
  source wording, district-name variants, reporting years, and known
  uncertainty in each record.
- Mark a record `verified` only when its source and claim were checked.
  Records marked `needs_review` remain documented but are excluded from
  retrieval and chat answers.
- Do not infer publication dates for undated pages. Numeric crop data is
  qualified with its reporting year or identified as a proposed target.
- The source registry is regenerated from the corpus during indexing and
  records source URLs, linked records, regions, districts, dates, and review
  status.

## Review items and limitations

The two records excluded from search are:

- `dakshina-kannada-mangaluru-trading-history`: the district portal provides
  no citations for the historical outline.
- `uttara-kannada-kadamba-banavasi-history`: the district portal provides no
  citations for the chronology; it needs comparison with inscriptions or
  archaeological publications.

Other evidence limits are preserved in individual records:

- Some district portals and agriculture/fisheries pages were unavailable,
  moved, or returned errors during collection. Where possible, accessible
  state or alternate district pages were used; their scope is not treated as
  equivalent to a district-specific statistical source.
- The Karavali collection has limited independently sourced fisheries and
  agriculture detail because several relevant district and institutional
  pages were unavailable.
- A directly verifiable source for Kodava Takk was not found. The Kodava
  harvest and food records are limited to what the [Kodagu District
  Administration](https://kodagu.nic.in/en/tourism/culture-heritage/) and
  [Karnataka Tourism](https://karnatakatourism.org/en/experiences/food-culinary/)
  pages support; no specific recipe or universal community practice is
  inferred.
- The Arebhashe language record describes Arebhashe specifically, based on
  the [Karnataka Arebhashe Academy](https://arebhasheacademy.karnataka.gov.in/12/arebashe/kn);
  it is not used as evidence for Kodava Takk or all Malenadu communities.
- Some sources use variants such as Mysore, Chickballapur, Yadgiri, and
  Raichuru. The records retain the source's spelling in context while mapping
  to the user's district names.

This is a source-grounded starting corpus, not an exhaustive district
encyclopedia. A district's presence in the corpus does not imply equal depth
across agriculture, language, food, history, and living cultural practice.
