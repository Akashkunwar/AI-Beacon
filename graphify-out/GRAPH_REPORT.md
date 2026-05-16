# Graph Report - AiViz  (2026-05-16)

## Corpus Check
- 132 files · ~170,354 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 971 nodes · 1476 edges · 61 communities (55 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `34a8014e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]

## God Nodes (most connected - your core abstractions)
1. `Tensor` - 41 edges
2. `useSimulatorStore` - 27 edges
3. `useReducedMotion()` - 21 edges
4. `ErrorBoundary` - 19 edges
5. `PipelineStep` - 19 edges
6. `compilerOptions` - 18 edges
7. `executeStep()` - 16 edges
8. `devDependencies` - 13 edges
9. `ConceptCard()` - 13 edges
10. `AI Beacon — LLM Visualizer` - 13 edges

## Surprising Connections (you probably didn't know these)
- `SoftmaxStep()` --calls--> `useSimulatorStore`  [EXTRACTED]
  src/components/pipeline/SoftmaxStep.tsx → src/lib/store/simulatorStore.ts
- `TokenizationStep()` --calls--> `useSimulatorStore`  [EXTRACTED]
  src/components/pipeline/TokenizationStep.tsx → src/lib/store/simulatorStore.ts
- `LMHeadStep()` --calls--> `useSimulatorStore`  [EXTRACTED]
  src/components/pipeline/LMHeadStep.tsx → src/lib/store/simulatorStore.ts
- `TokenIDStep()` --calls--> `useSimulatorStore`  [EXTRACTED]
  src/components/pipeline/TokenIDStep.tsx → src/lib/store/simulatorStore.ts
- `Step10Deployment()` --calls--> `useReducedMotion()`  [INFERRED]
  src/components/training/Step10Deployment.tsx → src/hooks/useReducedMotion.ts

## Communities (61 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (55): gelu(), geluScalar(), relu(), applyMask(), causalMask(), qkvProjections(), scaledDotProductAttention(), id (+47 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (28): embeddingLookup(), embeddingLookupWithWeights(), matmul(), A, B, C, I, ids (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (36): papersData, timelineData, toolsData, TimelineCanvas(), TimelineCanvasProps, dropdownStyle, filterGroupStyle, TabType (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (24): BenchmarkGlossary(), GLOSSARY, BenchmarkLeaderboard(), SortKey, BenchmarkSources(), SOURCES, KEY_MODELS, PAD (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (28): ControlPanel(), ControlPanelProps, ModelConfigForm(), ModelConfigFormProps, ModeToggle(), ModeToggleProps, ControlButtonProps, PlaybackControls() (+20 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (23): ACT_OPTIONS, Activation, ArchConfig, AttentionType, ConfiguratorSection(), D_MODEL_OPTIONS, fmtParams(), KV_HEAD_OPTIONS (+15 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (23): TooltipEngine(), TooltipEngineProps, EmbeddingWeightInfo, sectionLabel, stepDescStyle, stepNumberStyle, stepTitleStyle, sectionLabel (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (29): afterTokenize, anyDifferent, { currentStep }, { currentStep, isPlaying }, { currentStep, isPlaying, tensors, stepHistory }, { currentStep, tensors }, { currentStep, tensors, inputText }, { currentStep, tensors, stepHistory } (+21 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (30): dependencies, framer-motion, react, react-dom, react-helmet-async, react-router-dom, zustand, devDependencies (+22 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (26): LCG, A, AT, ATT, B, C, first1, first2 (+18 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (19): ANNOTATIONS, fmtCompute(), fmtGpuDays(), fmtParams(), fmtTokens(), LABEL_MONO, OPT_TABS, OptTab (+11 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (11): HeroVisual(), OpenSourceVisual(), ScaleVisual(), BENCHMARK_STATS, fadeUp, MODULES, PIPELINE_PILLS, SCALE_CHIPS (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (23): 10. Responsive Design, 11. Link Between Routing and Pages, 1. Tech Stack, 2. Design Aesthetic — Minimal Monochrome Light, 3. Component Architecture, 4. State Management, 5. Math Engine Rules, 6. Performance (+15 more)

### Community 13 - "Community 13"
Cohesion: 0.1
Nodes (20): fadeUp, MilestoneTimeline(), CORE_SOURCES, fadeUp, SourcesPanel(), accenture, AUTOMATION_DATA, AUTOMATION_YEARS (+12 more)

### Community 14 - "Community 14"
Cohesion: 0.1
Nodes (16): A_PAD, AnomalyChart(), BTN_BASE, buildTrajectories(), FailureData, FailureMode, FAILURES, LABEL_MONO (+8 more)

### Community 15 - "Community 15"
Cohesion: 0.1
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleDetection (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (12): bodyTextStyle, CONCEPT_CONTENT, ConceptCard(), ConceptCardProps, ConceptContent, sectionLabelStyle, FFNStep, LayerNormStep (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (18): AI Beacon — LLM Visualizer, code:bash (git clone https://github.com/Akashkunwar/AI-Beacon.git), code:text (AI-Beacon/), Contributing, Documentation (for contributors), Features, Getting Started, Install and run (+10 more)

### Community 18 - "Community 18"
Cohesion: 0.11
Nodes (15): ALGORITHM_CARDS, AlgorithmCard, AlgorithmSection, approximateTokenize(), BPEVisualizerProps, INITIAL_TOKENS, MERGE_SEQUENCE, MergeStep (+7 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (15): AttentionStep, EmbeddingStep, FFNStep, getStepComponent(), LayerNormStep, LMHeadStep, PositionalEncodingStep, RawInputStep (+7 more)

### Community 20 - "Community 20"
Cohesion: 0.15
Nodes (12): formatNumber(), ImpactMetric(), ImpactMetricProps, formatJobs(), SectorCard(), SectorCardProps, TIMELINE_TICKS, YearSlider() (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (12): CAIPanel(), DPOPanel(), RLAIFPanel(), RLHFPanel(), useReducedMotion(), AutomationClockPage(), BenchmarksPage(), Reveal() (+4 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (14): DATA_SOURCES, DataMixBar, DataSource, DEDUPED_LINES, DedupState, LineItem, QUALITY_CARDS, QualityCard (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (13): AttnTensors, emptyStateStyle, equationBoxStyle, sectionLabel, stepDescStyle, stepNumberStyle, stepTitleStyle, SUB_VIEWS (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.13
Nodes (14): 1. Project Structure, 2. Design System Tokens, 3. Core Type Definitions, 4. Tensor and Math Engine, 5. Routing, 6. Error Handling and Accessibility, 7. Build and Test, 8. References (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.15
Nodes (11): ScrollToTop(), About, App(), AutomationClockPage, BenchmarksPage, Home, NotFound, SimulatorPage (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (6): ISEOProps, SEO(), SITE_CONFIG, fadeUp, Footer(), Nav()

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (13): 1.1 Vision, 1.2 Target Users, 1.3 Key Differentiators, 1.4 Competitive Landscape, 1. Product Overview, 2. Tech Stack, 3. Platform Modules and Routes, 4. Transformer Simulator — Pipeline Steps (+5 more)

### Community 29 - "Community 29"
Cohesion: 0.16
Nodes (12): AllTokensView, eqChip(), eqOpStyle, PEFormulaBox, PositionalEncodingStep(), sectionLabel, SinusoidalWaveVis, stepDescStyle (+4 more)

### Community 30 - "Community 30"
Cohesion: 0.17
Nodes (7): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState, LORA_RANKS, SFT_DATASET, Step06SFT(), Step06SFTProps

### Community 31 - "Community 31"
Cohesion: 0.2
Nodes (10): AttentionStep(), EmbeddingStep(), RawInputStep(), SAMPLE_SENTENCES, sectionLabel, stepDescStyle, stepNumberStyle, stepTitleStyle (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.17
Nodes (7): MobilePillNavProps, SidebarProps, StepContentProps, StepPlaceholderProps, STEPS, Step02Tokenizer(), Step03Architecture()

### Community 33 - "Community 33"
Cohesion: 0.2
Nodes (9): metadata, audit_status, description, fields, last_updated, logo_source, title, total_models (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.2
Nodes (9): DRAFT_TOKENS, DraftToken, MODE_STEPS, QUANT_DATA, QuantMode, QuantStats, Step09Inference(), StepProps (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.2
Nodes (9): 0. Read the Docs First, 1. Understand the Math (if applicable), 2. Define State Dependencies, 3. Build the UI, 4. Add Animations, 5. Add Educational Content, 6. Add Error Handling, 7. Test & Verify (+1 more)

### Community 36 - "Community 36"
Cohesion: 0.22
Nodes (8): config, different, err, PE, tensors, X, X_pos, TensorRegistry

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (7): YearSnapshot, formatPct(), getBoundingYears(), getInterpolatedData(), InterpolatedSnapshot, lerp(), parsePct()

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (7): metadata, description, fields, last_updated, title, total_tools, tools

### Community 39 - "Community 39"
Cohesion: 0.25
Nodes (7): metadata, description, fields, last_updated, title, total_papers, papers

### Community 40 - "Community 40"
Cohesion: 0.29
Nodes (4): OnboardingTour(), OnboardingTourProps, TOUR_STEPS, TourStep

### Community 41 - "Community 41"
Cohesion: 0.33
Nodes (4): BadgeProps, BadgeSize, BadgeVariant, SIZE_CLASSES

### Community 42 - "Community 42"
Cohesion: 0.4
Nodes (4): AttentionHeatmap, AttentionHeatmapProps, lerpChannel(), weightToBackground()

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (4): historicalModels, newModels, newPapers, newTools

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (5): BENCHMARKS, BenchmarkTab, SCORES_DATA, Step08Benchmarking(), Step08BenchmarkingProps

### Community 45 - "Community 45"
Cohesion: 0.33
Nodes (5): KEY_CONCEPTS, PIPELINE_NODES, STAGES, Step10Deployment(), StepProps

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (4): fadeUp, formatJobs(), JobImpactChart(), JobImpactChartProps

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (3): SkipToMain(), NAV_LINKS, NavProps

## Knowledge Gaps
- **510 isolated node(s):** `rewrites`, `headers`, `name`, `private`, `version` (+505 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Tensor` connect `Community 1` to `Community 0`, `Community 9`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `ErrorBoundary` connect `Community 30` to `Community 32`, `Community 34`, `Community 5`, `Community 10`, `Community 44`, `Community 45`, `Community 14`, `Community 18`, `Community 19`, `Community 21`, `Community 22`, `Community 25`, `Community 27`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `PipelineStep` connect `Community 16` to `Community 0`, `Community 4`, `Community 36`, `Community 6`, `Community 7`, `Community 19`, `Community 23`, `Community 29`, `Community 31`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `useReducedMotion()` (e.g. with `Step07Alignment()` and `Step10Deployment()`) actually correct?**
  _`useReducedMotion()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **What connects `rewrites`, `headers`, `name` to the rest of the system?**
  _510 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._