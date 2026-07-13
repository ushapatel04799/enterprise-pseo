# Engine

## Purpose

Provide the domain and orchestration layer for the Enterprise PSEO generation framework.

## Responsibilities

Coordinate reusable core capabilities, generation, SEO, schema, validation, rendering, and build workflows through explicit contracts.

## What Belongs Here

- `core/` — shared engine contracts, errors, events, and utilities.
- `generators/` — page-model generation orchestration.
- `seo/` — SEO metadata, linking, and indexability logic.
- `schema/` — engine-facing schema contracts and adapters.
- `validation/` — data, content, and artifact validation.
- `render/` — conversion of approved page models into artifacts.
- `build/` — build selection, orchestration, manifests, and reports.

## What Must Never Be Placed Here

Presentation templates, raw source datasets, secrets, provider credentials, manually edited build output, or unrelated application code.
