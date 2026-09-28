# AI Beacon data guide

Everything AI Beacon shows comes from a handful of files in `src/data/`. This guide explains what each file holds, the rules every entry must follow, and how to propose a change. If you only want to report a problem, open a [data correction issue](https://github.com/Akashkunwar/AI-Beacon/issues/new?template=data_correction.md) with a link to the source — no code needed.

## Principles

1. **Primary sources only.** A number needs a link to where it was first published: the lab's paper, model card, system card, official announcement or API docs, or the benchmark's own leaderboard. News articles are useful for finding things, not as the citation.
2. **Unknown stays unknown.** If something is not published, use `null` (or leave a benchmark score out). Never estimate, average, convert between benchmark versions or write `0` for "unknown".
3. **Say what kind of claim it is.** Measured results, lab-reported results and editorial or illustrative content are labelled differently on the site. Keep it that way.
4. **Dates are first public availability.** For models, the first day the public could use it (preview, beta or general availability), not a leak or a teaser. Use `YYYY-MM-DD`.
5. **No future entries.** Nothing dated after the review date.

## Files at a glance

| File | Used by | Review date lives in |
|---|---|---|
| `LLM_Timeline_Dataset.json` | Timeline → Models, Home "latest releases" | `metadata.last_updated` |
| `Research_Papers_Dataset.json` | Timeline → Papers | `metadata.last_updated` |
| `AI_Tools_Dataset.json` | Timeline → Tools | `metadata.last_updated` |
| `datasetMeta.ts` | Homepage and About counters | `lastUpdated` (must equal the newest of the three above) |
| `benchmarkData.ts` | Benchmarks module, Training stage 8 | `LAST_UPDATED` |
| `impactData.ts` | AI & Jobs module | `IMPACT_LAST_UPDATED` |
| `tokenizerSamples.ts` | Training stage 2 | generated — see the file header |

## Timeline datasets

Each JSON file has a `metadata` object and one array (`models`, `papers` or `tools`). The arrays are **sorted by date** and **ids run 1..N with no gaps**; `metadata.total_*` must equal the array length. Type definitions are in `src/data/timeline.ts`.

### Models (`LLM_Timeline_Dataset.json`)

| Field | Rules |
|---|---|
| `model_name`, `company`, `model_family` | Official spelling. Use the lab's current name for its recent models (e.g. "Google DeepMind" for Gemini-era models). |
| `release_date` | `YYYY-MM-DD`, first public availability. |
| `category` | One of: Language, Reasoning, Multimodal, Small & fast, Coding, Image generation, Video generation, Audio & speech, Vision, Science, Robotics, World & 3D, Architecture. |
| `modalities` | Any of `text`, `code`, `image`, `audio`, `video`, `3d`, `science`. |
| `parameters` + `parameter_unit` | Both set (`"million"` or `"billion"`) or both `null`. Only if officially disclosed; for mixture-of-experts give the total and mention active parameters in `description`. |
| `training_tokens` | In **billions**, only if disclosed (e.g. `15000` for 15T). |
| `context_window_tokens` | Tokens, as documented for the API or model card. |
| `training_data_cutoff` | `YYYY-MM`, only if the lab states it; must not be after the release month. |
| `pricing_per_1m_tokens` | Standard API list price in USD per million tokens; both `input` and `output` set, or both `null`. |
| `open_source` / `license` | `true` only for downloadable weights; name the licence (e.g. "Apache 2.0", "Llama 3.1 Community License"). |
| links | `http(s)` URLs only, no placeholders. `official_model_link` should point to the announcement or model card, not a homepage, when one exists. |
| `predecessor` / `successor` | Exact `model_name` of another entry, or `null`. |

### Papers (`Research_Papers_Dataset.json`)

- Must have a `paper_url` (arXiv, DOI, publisher or the lab's research page). Blog posts about products, policy briefs and system cards are not papers.
- `category` is one of: Architecture, Training & scaling, Language & NLP, Vision & multimodal, Generative media, Reasoning, Reinforcement learning, Alignment & safety, Interpretability, Agents, Efficiency, Evaluation, Science, Models & reports.
- `publication_date` is the first public version (usually the arXiv v1 date).
- `citations` is a rough snapshot; it is fine to leave it `null`.

### Tools (`AI_Tools_Dataset.json`)

- Products and developer tools people use *with* models. Models and model APIs belong in the models file.
- `group` is one of: Coding, Agents & automation, Developer platforms, Assistants & research, Creative.
- If only the launch month is known, use the first of the month and set `"date_precision": "month"`.

## Benchmarks (`benchmarkData.ts`)

- `METRICS` defines each benchmark (what it measures, caveats, status). Add a new metric only if several current labs report it.
- Each `BENCHMARK_MODELS` entry needs a `source` that contains **every** score listed for that model. Record the evaluation setting in `notes` when the lab gives several (e.g. "with tools", "high reasoning effort").
- Scores are percentages as published. Do not mix benchmark versions (SWE-bench Verified ≠ SWE-bench Pro).
- `price` is the standard list price in USD per million input/output tokens at the review date.
- `NEWEST_MODELS` covers releases that mostly report newer benchmark suites; describe what they report rather than forcing them into the table.

## AI and jobs (`impactData.ts`)

- `EVIDENCE` cards quote figures exactly as the organisation published them, with the report URL and year. If a study is updated, update the card and say so in `detail`.
- `SECTORS` is an **editorial scenario index**, not data. Keep changes consistent with the published evidence, and never present index values as statistics.

## Making a change

```bash
npm install
npm run dev          # check the change in the browser
npm run check        # typecheck + lint + tests (includes dataset integrity tests)
```

`src/__tests__/data/datasets.test.ts` fails if counts, ids, dates, categories, links or review dates are inconsistent — run it before opening a pull request. In the pull request, list every changed value with its source link.

For a full audit of the timeline datasets, see [AI-Dataset-Maintenance-Prompt.md](./AI-Dataset-Maintenance-Prompt.md).
