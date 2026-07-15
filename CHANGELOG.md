# Changelog

## [2026-07-14] - Release 0.2.0: Core Engine Milestone Complete

### Summary
- Completed all core Programmatic SEO Engine phases (Shared Foundation, Knowledge Graph, Context Compression, Gemini AI Writer, Quality Reviewer, SEO Schema Builders, Static Page Renderer, Dashboard Reports, and Cloudflare Deployments).

### Added
- **[DASHBOARD_ENGINE]** Created `dashboard-engine.js` compiling interactive HTML execution charts and cost estimations.
- **[CLOUDFLARE_ADAPTER]** Created `cloudflare-adapter.js` managing edge deployment manifestations and transactional rollbacks.
- **[INTEGRATION_TESTS]** Integrated 36 unit tests covering foundation mechanics, database sweeps, generation checks, and rollback functions.
- **[WIDGET_ADAPTERS]** Created `weather-adapter.js` and `maps-adapter.js` to isolate climate zone lookups and map iframe generations.
- **[ASYNC_CONTEXT]** Refactored `context-engine.js` to asynchronously query geographic widgets from external API adapters.
- **[REPOSITORY_VALIDATOR]** Created `scripts/validate-data.js` verifying repository configurations, Nunjucks templates, and raw JSON locations.
- **[GRAPH_CACHE]** Implemented pre-compiled JSON derived index serialization and circular pointer re-linking inside `knowledge-engine.js` with automatic master registry MD5 checksum validation.
- **[INCREMENTAL_BUILD]** Created `build-cache.js` managing target checksum calculations and incremental build caches to optimize build times.
- **[CONCURRENT_QUEUE]** Replaced sequential generation loops in `build-orchestrator.js` with parallel worker task pools.
- **[RESUME_CAPABILITY]** Integrated progress serialization markers in `build-state.json` facilitating resume recovery if a run is aborted.
- **[RETRY_RECOVERY]** Implemented backoff retries and job registry failures in `failed-jobs.json` to handle transient network errors.
- **[AI_INTERFACE]** Created `ai-provider.js` base class defining standardized inputs, outputs, token metrics, and cost estimators for all models.
- **[PROVIDER_REGISTRY]** Implemented `provider-registry.js` dynamically registering Gemini, OpenAI, and Claude adapters for provider-independent model swapping.
- **[RATE_LIMITER]** Created `queue-manager.js` regulating active AI completions to enforce rate spacing.
- **[METRIC_TRACKER]** Configured dynamic pricing lookup tables matching specific model weights and parsing metadata headers.
- **[SEO_INTELLIGENCE]** Created `seo-intelligence-engine.js` implementing NLP intent, thin content limits, keyword density checking, and EEAT trust signals validation.
- **[GATE_INTEGRATION]** Integrated the SEO Intelligence Engine directly into `reviewer-engine.js` to fact-check AI outputs.
- **[NICHE_PLUGIN]** Created `plugin-engine.js` implementing a Plugin Loader, Validator, and Registry to support hot-swappable local niches.
- **[DECOUPLED_LOGIC]** Refactored `dataset-engine.js`, `prompt-builder.js`, and `schema-engine.js` to dynamically override services, system prompts, and Schema.org types based on active niche plugins.
- **[TEMPLATE_COMPONENTS]** Separated landing page rendering sections into reusable Nunjucks components under `_includes/` (`hero`, `localIntro`, `serviceDetails`, `nearbyExclusion`, `faqs`, `widgets`).
- **[HTML_MINIFICATION]** Integrated a zero-dependency HTML space-compression transform filter in `eleventy.config.js` to compress static output.

### Cleaned
- **[LEGACY_PROMPTS]** Removed consolidated legacy instruction files (`01_MASTER_PROMPT.md`, `15_AI_AGENT_PLAYBOOK.md`, `20_SYSTEM_PROMPT.md`, `21_AI_EXECUTION_PROTOCOL.md`) under `docs/` folder to clean up repository layout.

## [2026-07-14] - Data Integrity Audit & Auto-Fixes

### Summary
- **Errors Encountered:** 50
- **Corrections Applied:** 1

### Log of Modifications
- **[DELETE_DUPLICATE_FILE]** Removed duplicate file: `il1.json` (identical to `il.json`).

