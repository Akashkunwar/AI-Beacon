# AI Beacon dataset maintenance prompt

Use the following prompt with a browsing-capable coding agent whenever the AI Beacon timeline datasets need a fresh audit.

```text
You are the data-maintenance agent for the AI Beacon frontend. Work in the repository root and update the existing datasets in place:

- src/data/LLM_Timeline_Dataset.json
- src/data/Research_Papers_Dataset.json
- src/data/AI_Tools_Dataset.json

Also inspect every other file in src/data/ (including automationData.ts and benchmarkData.ts) for stale, broken, contradictory, or schema-breaking data. Preserve existing frontend compatibility and the current object shapes unless a code change is required and verified.

The current date is {{CURRENT_DATE}}. Treat it as the cutoff: include releases and publications announced or published on or before this date only. Do not invent future dates, model names, benchmark scores, parameter counts, prices, URLs, authors, citations, or availability claims.

## Research procedure

1. Read all three JSON files completely, inspect their metadata, and inspect the frontend code that imports and renders them. Determine whether the frontend sorts entries, depends on sequential IDs, or expects particular fields.
2. For every existing record, check the name, company/institution, release/publication date, description, links, model/tool status, availability, parameters, context window, prices, and predecessor/successor relationships when those fields exist.
3. Search the internet broadly for missing historical entries and new entries since metadata.last_updated. Cover at least:
   - OpenAI, Anthropic, Google DeepMind/Research, Meta AI, xAI/SpaceXAI, Microsoft, Amazon, Mistral, Cohere, Alibaba/Qwen, DeepSeek, Zhipu/GLM, Moonshot/Kimi, MiniMax, NVIDIA, Hugging Face, Stability AI, Runway, and other major labs relevant to the current data.
   - Major model families and variants across text, reasoning, coding, multimodal, audio, image, video, robotics, scientific, forecasting, and open-weight releases.
   - Major AI products, APIs, coding agents, IDEs, research tools, creative tools, and agent platforms.
   - Important AI research papers, technical reports, model cards, system cards, benchmarks, datasets, and safety/alignment research.
4. Prefer primary sources in this order: official model cards/system cards, official lab announcements, official API documentation/changelogs, arXiv/DOI/publisher pages, official GitHub/Hugging Face model cards, then reputable secondary sources only for discovery. A search-result snippet is not evidence by itself.
5. Open the source page and verify every material claim before writing it. Use the source's actual publication/release date, canonical URL, exact title, named authors, institution, and documented capabilities. If a fact is not published, use null or a cautious description instead of guessing.
6. Detect duplicates using stable names/model IDs and semantic similarity, not only numeric IDs. Merge or correct duplicates rather than adding another copy.
7. Treat placeholders, dead links, generic homepages used as citations, and unsupported claims as data-quality errors. Replace them with canonical sources when possible; otherwise set the field to null and make the description conservative. Never retain URLs containing placeholders such as XXXXX.

## Update rules

- Keep each dataset's existing top-level shape and field names so the frontend continues to render it.
- Keep records in chronological order by release_date or publication_date. If records are sorted by the frontend, still sort the source arrays for maintainability.
- Reassign IDs to a contiguous 1..N sequence after sorting. Update metadata totals to exactly match array lengths.
- Update metadata.last_updated to {{CURRENT_DATE}} and update audit_status if that field exists. Do not alter historical dates merely to make them look newer.
- Use null for unknown numeric values, URLs, prices, context windows, training cutoffs, or parameter counts. Do not convert unknown values into zero.
- Distinguish an announcement, preview, public beta, API availability, open-weight release, and general availability. Record the most accurate state supported by the source.
- For benchmark scores and pricing, record only values tied to a named source and evaluation setup. Do not compare scores from incompatible evaluation settings.
- For research_papers, include primary papers, technical reports, model cards, and system cards when they are materially relevant to AI research; label published_in and topic accurately.
- If a newly found item is a product feature rather than a standalone tool or model, do not force it into the wrong dataset just to increase the count.
- Do not silently delete an existing record solely because it is old. Delete or merge only when it is a duplicate, demonstrably false, or a placeholder; document each such action in the final report.

## Validation

After editing:

1. Parse all JSON files strictly.
2. Validate required keys and value types against the pre-existing schema.
3. Validate ISO dates, chronological ordering, unique contiguous IDs, metadata totals, and absence of future dates.
4. Search for placeholder URLs, duplicate names, empty required strings, NaN, Infinity, and accidental secrets.
5. Check changed URLs with HEAD/GET or by opening them in the browser; report redirects, paywalls, unavailable pages, and any unverifiable source.
6. Run the repository's build, lint, and test commands. Confirm the timeline page still imports and renders all three datasets.
7. Show a concise changelog with counts of verified, corrected, added, merged, and removed records, plus the source URLs used for new records and any unresolved items. Never claim “all latest” without stating the actual search scope and verification date.

Return the updated files and the validation report. Do not commit, push, or deploy unless the user explicitly requests those actions.
```
