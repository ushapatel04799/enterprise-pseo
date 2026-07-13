# Architecture Alignment Report

## Purpose

Record the verified status of repository architecture and data-path alignment after the
`DataLoader` dataset path correction. This is a status report only — no source code was
modified to produce it.

> Scope: read-only verification. Source files were intentionally left untouched.

---

## Repository Architecture Status

- **Repository**: Enterprise-PSEO, branch `main`.
- **Source state**: Implementation is complete. The working tree contains exactly one
  uncommitted change — `engine/data/loader.js` — which corrects dataset path mapping. No
  other source files were modified.
- **Engine layer** (`engine/`): Domain and orchestration surface defined per
  `docs/04_ENGINE_ARCHITECTURE.md` (core, generators, seo, schema, validation, render,
  build). Loader/validator/cache live under `engine/data/`.
- **Data layer** (`data/`): Governed source-data home per `data/README.md`. Top-level
  directories present on disk: `faqs/`, `locations/`, `niches/`, `services/`, `templates/`.
- **Specified org-shell contract** (`data/README.md`): `niches/`, `locations/`,
  `services/`, `faqs/`, `templates/`. The geospatial detail layout under `locations/` and
  the `business/` dataset root are defined by the loader contract, not by the README.
- **Legacy spec paths**: `docs/02_DATA_SPECIFICATION.md` and the repository data layout
  described in `docs/04_ENGINE_ARCHITECTURE.md` (lines 501–525) reference `src/data/`
  (`states/`, `cities/`, `services/`, `keywords/`, `faqs/`, `templates/`, `shared/`).
  These documents pre-date the established `data/` organization and have not been updated
  to match it. They are documentation drift, not implementation defects.

---

## Data Path Alignment Summary

`engine/data/loader.js` resolves datasets relative to `DEFAULT_DATA_DIRECTORY`
(`engine/data/../../data/` → `<repo>/data/`) using `dataDirectory` segments per dataset
type. The corrected `DEFAULT_DATASET_PATHS` mapping (`loader.js:17-24`) is:

| Dataset   | Loader path segments                         | Resolved path                         | On-disk status |
|-----------|----------------------------------------------|---------------------------------------|----------------|
| state     | `['locations', 'usa', 'states']`            | `data/locations/usa/states/<id>.json` | Pending scaffold |
| city      | `['locations', 'usa', 'cities']`            | `data/locations/usa/cities/<id>.json` | Pending scaffold |
| county    | `['locations', 'usa', 'counties']`          | `data/locations/usa/counties/<id>.json` | Pending scaffold |
| business  | `['business']`                              | `data/business/<id>.json`             | Pending scaffold |
| service   | `['services']`                              | `data/services/<id>.json`             | Dir exists (empty) |
| template  | `['templates']`                             | `data/templates/<id>.json`            | Dir exists (empty) |

### What the correction achieved

The previous mapping was internally inconsistent with the established repository layout:
`state`/`city`/`county` pointed at `data/locations/{states,cities,counties}/` (a flat
layout that was never materialized), and `business` pointed at the `data/` root
(`segments: []`). The corrected mapping:

1. Introduces a scoped `locations/usa/` namespace for the three geographic dataset types,
   isolating USA geospatial data from future multi-country expansion (consistent with the
   multi-country guidance in `docs/02_DATA_SPECIFICATION.md`).
2. Gives `business` its own `business/` root instead of dumping files directly into `data/`,
   matching the per-dataset-directory convention used by `services/` and `templates/`.
3. Keeps `services/` and `templates/` unchanged — they were already correct.

### Path resolution safety

`#resolveDatasetPath` (`loader.js:166-188`) enforces:

- Identifier format via `assertDatasetIdentifier` (`/^[a-z0-9][a-z0-9-]*$/`).
- Segment format via `isSafePathSegment` (same regex) on every configured segment.
- Directory-escape prevention: resolved path must remain inside `dataDirectory`
  (`pathFromRoot` must not start with `..${sep}`).

The new `usa` segment and `business` segment both pass `isSafePathSegment`, so the
resolution contract is preserved. Identifiers continue to require lowercase
alphanumeric-with-hyphen form (e.g. `ca`, `tx`), matching the state-code naming rules in
`docs/02_DATA_SPECIFICATION.md`.

---

## Files Updated

Only one file is changed in the working tree (uncommitted, per `git status` / `git diff`):

- `engine/data/loader.js` — Updated `DEFAULT_DATASET_PATHS` (`loader.js:17-24`):
  - `state`: `['locations', 'states']` → `['locations', 'usa', 'states']`
  - `city`: `['locations', 'cities']` → `['locations', 'usa', 'cities']`
  - `county`: `['locations', 'counties']` → `['locations', 'usa', 'counties']`
  - `business`: `[]` → `['business']`

No other files were created, modified, or deleted. No source code changes were made for
this report.

---

## Remaining Issues

1. **Geospatial directory tree not materialized.**
   `data/locations/usa/{states,cities,counties}/` and `data/business/` do not exist on
   disk. The loader will raise `DataLoadError` on first `loadState`/`loadCity`/
   `loadCounty`/`loadBusiness` calls until these directories and their JSON files are
   scaffolded. `services/` and `templates/` exist but are empty, so `loadService`/
   `loadTemplate` will fail for the same reason (missing file) on any concrete identifier.
   This is a content-provisioning gap, not a code defect.

2. **Documentation drift in legacy spec documents.** `docs/02_DATA_SPECIFICATION.md` and
   `docs/04_ENGINE_ARCHITECTURE.md` (lines 501–525) describe `src/data/` with
   `states/`, `cities/`, `keywords/`, `shared/`, etc. The implemented repo uses `data/`
   with a different directory vocabulary (`niches/`, `locations/`, `services/`, `faqs/`,
   `templates/`, plus the loader-defined `locations/usa/` and `business/`). These docs do
   not match the resolved loader contract or the on-disk `data/` layout. They should be
   reconciled in a separate documentation pass.

3. **Memory/context artefacts are placeholders.** `.ai/memory/ARCHITECTURE_MEMORY.md`,
   `.ai/memory/KNOWN_ISSUES.md`, and `.ai/memory/DECISION_LOG.md` contain only template
   scaffolding (no concrete decisions or verified issue entries). `ACTIVE_TASK.md`
   reports no active task. These are informational gaps; they do not affect runtime
   alignment.

4. **Identifier rule vs. state-code spec.** `assertDatasetIdentifier` allows ≥1-char
   lowercase alphanumeric with hyphens. USPS state codes (`ca`, `tx`) satisfy this. State
   files are loaded by lowercase `stateCode`, which is consistent with the spec's `ca.json`
   naming rule. No conflict.

---

## Risk Assessment

- **Runtime risk — LOW.** The path correction does not weaken the directory-escape guard
  or identifier validation; both still reject unsafe input. Risk is confined to datasets
  not yet existing on disk (issue #1), which surfaces as a clean `DataLoadError` rather
  than silent failure.
- **Forward-compatibility — POSITIVE.** The `locations/usa/` scope gives a clean seam for
  future country expansion (Canada, UK, etc. referenced in the spec) without touching
  loader code — only new directory segments/files. This is a structural improvement over
  the flat `locations/{states,cities,counties}/` layout.
- **Consistency risk — LOW.** All six dataset types now follow the same convention
  (one configured directory path per type). No mixed root-vs-subdir special cases remain.
- **Documentation risk — MEDIUM (non-runtime).** New readers relying on the legacy
  `src/data/` spec documents will be misled. This affects onboarding and AI execution
  fidelity, not the running engine. Isolated to docs; tracked as issue #2.
- **Data-governance risk — NONE.** No raw dataset was renamed, moved, or overwritten. The
  correction changes only where the loader looks; it does not mutate user data, consistent
  with the immutability directives in `docs/02_DATA_SPECIFICATION.md`.

---

## Final Verification Summary

- `git status`: exactly one modified file (`engine/data/loader.js`). Confirmed.
- `git diff engine/data/loader.js`: change confined to `DEFAULT_DATASET_PATHS`
  (`loader.js:17-24`); no other lines touched. Confirmed.
- Loader path resolution logic (`#resolveDatasetPath`, `assertDatasetIdentifier`,
  `isSafePathSegment`, directory-escape guard) is unchanged and remains sound under the
  new segments. Confirmed.
- Corrected paths resolve under `<repo>/data/` and stay inside `dataDirectory` for all
  six dataset types. Confirmed.
- On-disk `data/` layout matches the corrected `services/` and `templates/` contracts;
  `locations/usa/{states,cities,counties}/` and `business/` are pending scaffold. Confirmed.
- No source code was modified for this report. No file other than this report was created.

The implementation is complete. The loader's dataset path contract is internally
consistent with the established `data/` organization, the path-safety guards are intact,
and no code-level misalignment remains. Open items are limited to dataset scaffolding and
legacy-document reconciliation, neither of which is a code defect.

ARCHITECTURE ALIGNMENT VERIFIED
