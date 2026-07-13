# Enterprise PSEO Engine Specification

## 1. Purpose and Scope

This specification defines the implementation plan for an enterprise programmatic SEO (PSEO) engine that produces high-quality, localized service websites from approved structured data. The engine must support multiple businesses, niches, locations, and providers without duplicating core logic.

The engine is responsible for ingesting validated data, building contextual knowledge, generating pages, validating output, producing deployable static artifacts, and reporting results. It is not a CRM, general-purpose CMS, or an autonomous business-decision system.

## 2. Overall Architecture

The platform uses a layered, data-first architecture. Each layer exposes explicit contracts and may depend only on lower layers or shared utilities.

| Layer | Responsibilities | Primary outputs |
|---|---|---|
| Configuration | Resolve project, business, niche, provider, and build settings. | Validated runtime configuration |
| Data foundation | Discover, load, validate, normalize, and version source datasets. | Canonical data registry |
| Knowledge and context | Build location/service relationships and task-specific context packets. | Knowledge objects and context packets |
| Content intelligence | Plan, generate, review, and score content through provider adapters. | Approved content model |
| SEO and presentation | Produce metadata, schema, linking, page models, and rendered artifacts. | Page artifacts and SEO assets |
| Build and delivery | Incrementally build, package, publish, and report static output. | Build manifest and deployable site |
| Observability and governance | Record decisions, quality, performance, errors, and approval state. | Auditable reports and alerts |

**Architectural constraints**

- Raw source datasets are immutable at runtime; derived data is stored separately.
- AI receives validated, scoped context rather than raw datasets or secrets.
- Provider-specific behavior is isolated behind adapters.
- Every generated artifact is traceable to a build, data version, configuration version, template version, and generator version.
- A failed validation gate prevents publication of the affected artifact.

## 3. Engine Modules

| Module | Responsibility | Inputs | Outputs | Key dependencies |
|---|---|---|---|---|
| Configuration Manager | Load and validate project configuration. | Versioned config | Runtime config | Schema Validator |
| Dataset Registry | Discover registered data sources and versions. | Dataset files | Dataset inventory | Configuration Manager |
| Data Loader | Parse approved source datasets. | Dataset inventory | Raw data objects | Dataset Registry |
| Validation Engine | Enforce syntax, schema, relationships, uniqueness, and policy rules. | Raw data/config/content | Validation report | JSON Schema, policy rules |
| Normalization Engine | Create non-destructive canonical derived values. | Validated data | Normalized data | Validation Engine |
| Knowledge Graph | Connect business, niche, service, location, and supporting entities. | Normalized data | Knowledge objects | Normalization Engine |
| Context Builder | Assemble the minimum relevant information for one page/task. | Knowledge object | Context packet | Knowledge Graph |
| Research Adapter | Obtain approved supplemental facts where enabled. | Context request | Cited research facts | Provider Adapter, approval rules |
| AI Provider Adapter | Normalize model/provider requests and responses. | Prompt/request | Provider-neutral result | Configuration Manager |
| Content Planner | Choose a page blueprint and content requirements. | Context packet | Page plan | SEO Engine, templates |
| Content Generator | Create structured content from an approved plan. | Page plan/context | Content model | AI Provider Adapter |
| Content Reviewer | Detect unsupported claims, duplication, thin content, policy failures, and quality gaps. | Content model/context | Review report | Validation Engine |
| SEO Engine | Build metadata, canonicals, sitemap entries, internal links, and structured data. | Page plan/content/context | SEO model | Knowledge Graph |
| Template Renderer | Render validated page and asset models to static files. | Page/SEO model | HTML and assets | Templates |
| Asset Manager | Resolve reusable assets and optimized derivatives. | Asset references | Asset manifest | Configuration Manager |
| Build Orchestrator | Select work, run stages, cache results, and produce reports. | Build request | Build manifest | All build modules |
| Deployment Adapter | Publish an approved build and report outcome. | Build artifact | Deployment record | Operations configuration |
| Monitoring Adapter | Collect build, quality, performance, and search signals. | Reports/provider data | Monitoring events | Deployment/analytics providers |

## 4. Data Flow

```text
Approved source data + project configuration
  -> discovery and registry
  -> parsing and validation
  -> non-destructive normalization
  -> knowledge graph
  -> page-specific context packet
  -> plan and optional cited research
  -> structured content generation
  -> content, SEO, policy, and accessibility validation
  -> rendering and asset optimization
  -> final build validation
  -> artifact manifest and approved deployment
  -> monitoring, audit records, and incremental rebuild triggers
```

### Data Contracts

- Every source object has a stable identifier, version, provenance, and validation status.
- A context packet contains only the fields authorized for its page type and excludes secrets and irrelevant personal data.
- A page model is structured data, not directly generated HTML. Rendering occurs only after content validation.
- A build manifest records input versions, outputs, errors, quality scores, timestamps, and deployment status.
- A content claim must map to an approved source, cited research record, or human-approved business configuration.

## 5. Folder Responsibilities

The following is the target structure for an approved implementation. It describes responsibilities only; creation of these folders requires a separate approved implementation task.

| Path | Responsibility | Rules |
|---|---|---|
| `src/core/` | Shared errors, logging, configuration access, event contracts, and utilities. | Must not depend on feature engines. |
| `src/engines/` | Independent data, knowledge, context, content, SEO, generator, and build engines. | One clear responsibility per module. |
| `src/adapters/` | External AI, data, analytics, deployment, weather, and maps integrations. | Isolate third-party interfaces and retries. |
| `src/services/` | Cross-engine orchestration services. | Depend on public engine contracts only. |
| `src/templates/` | Page templates, components, and template contracts. | No direct raw-data access. |
| `src/schemas/` | Machine-readable validation schemas and contract definitions. | Version public/data contracts. |
| `data/source/` | Approved immutable source datasets. | No runtime mutation or manual generated derivatives. |
| `data/derived/` | Reproducible normalized, cached, or derived data. | Rebuildable from source and tracked by version. |
| `config/` | Versioned non-secret project and provider configuration. | Secrets are referenced, never stored. |
| `scripts/` | Approved repeatable build and maintenance commands. | No hidden side effects. |
| `tests/` | Unit, integration, contract, fixture, and end-to-end tests. | Fixtures contain no production secrets. |
| `public/` | Static public assets and generated site output inputs. | Optimize assets and preserve licenses. |
| `generated/` | Build artifacts and reports. | Do not hand-edit; exclude reproducible output from source control as appropriate. |
| `docs/` | Approved governance, technical, operational, and product documentation. | Keep index and cross-references current. |

## 6. Generator Pipeline

The generator produces one page model per approved `(project, niche, service, location, page-type, locale)` target.

1. Receive a build target from the Build Orchestrator.
2. Resolve project, business, niche, service, location, locale, and template configuration.
3. Build a validated context packet from the knowledge graph.
4. Select the page blueprint based on page type and search intent.
5. Produce a content plan with required sections, allowed claims, entities, links, CTA rules, and token budget.
6. Generate structured content using an approved provider adapter or deterministic template content where applicable.
7. Review the output for factual support, duplication, local relevance, readability, and policy compliance.
8. Generate SEO metadata, structured data, internal links, and asset requirements.
9. Render page and supporting assets only after all required gates pass.
10. Write an artifact record containing source versions, scores, and validation evidence.

**Generator requirements**

- Content generation must be idempotent for a fixed input set when deterministic mode is configured.
- A page cannot include claims absent from its allowed-claims inventory.
- Page sections must be independently addressable in the content model for review and regeneration.
- Regeneration must be targeted: do not rebuild unaffected pages unless a shared dependency changed.

## 7. SEO Pipeline

The SEO pipeline operates on validated page plans and content models, never on raw provider output alone.

1. Determine primary intent, page type, canonical URL, and indexability rules.
2. Generate title, description, headings, and visible content from approved entities and page plan.
3. Build contextual internal links from the knowledge graph with relevance, diversity, and crawl-depth limits.
4. Generate structured data only for facts supported by the page’s validated data sources.
5. Generate sitemap, robots, canonical, hreflang (where applicable), and breadcrumb entries.
6. Detect duplicate titles, duplicate content, orphan pages, broken links, invalid schema, and keyword abuse.
7. Score page-level SEO and block publication if mandatory policy, quality, or technical checks fail.

**SEO quality rules**

- Each indexable page must have a distinct purpose, primary intent, and materially useful local/service content.
- Canonical URLs must be deterministic and derived from configured routing rules.
- Internal links must be useful to users; no link may exist solely to manipulate ranking signals.
- Structured data must match visible content and validated source data.
- Location pages must not imply a physical presence, service availability, or credential that is not approved.

## 8. Build Pipeline

1. Accept an explicit build request: full, incremental, preview, or validation-only.
2. Resolve configuration and determine the immutable build identifier.
3. Compare current dependency versions with the prior successful manifest to calculate affected targets.
4. Run data validation; stop on critical data or configuration errors.
5. Build or load knowledge/context caches with version-aware invalidation.
6. Generate and validate affected page models in controlled parallel batches.
7. Render pages and assets; create site-level artifacts such as sitemap and robots directives.
8. Run final link, schema, accessibility, performance, and artifact-integrity checks.
9. Write build manifest, validation report, and quality summary.
10. Publish only after the requested environment and approval gate are satisfied.

**Build modes**

| Mode | Use | Deployment behavior |
|---|---|---|
| Validation-only | Validate data, config, contracts, and planned targets. | Never renders or deploys. |
| Preview | Produce a reviewable artifact for a bounded target set. | Deploy only to approved preview environment. |
| Incremental | Rebuild targets affected by known dependency changes. | Requires successful final gates. |
| Full | Rebuild all configured targets. | Requires explicit approval for production deployment. |

## 9. Validation Pipeline

Validation is a staged gate, with reports retained per build and per artifact.

| Gate | Checks | Failure behavior |
|---|---|---|
| Configuration | Required fields, provider settings, routing, environment references. | Stop build on error. |
| Source data | JSON syntax, schema, uniqueness, relationships, provenance, required approvals. | Stop affected build scope on error. |
| Knowledge/context | Completeness, allowed fields, relationship integrity, token budget, privacy filtering. | Block target generation. |
| Content | Unsupported claims, hallucinations, duplication, thin content, readability, local relevance, prohibited language. | Block page publication. |
| SEO | Canonical/indexability, metadata, headings, links, schema, sitemap consistency. | Block page publication for mandatory failures. |
| Accessibility | Semantic structure, labels, heading order, image text, keyboard and contrast checks where applicable. | Block release for critical failures. |
| Security | Secret scanning, unsafe output handling, dependency/adapter policy checks. | Stop build or release based on severity. |
| Performance | Asset budgets, render size, link count, configured Core Web Vitals evidence. | Block release when production budgets are exceeded. |
| Artifact | File paths, redirects, broken links, duplicate routes, manifest completeness. | Stop deployment on error. |

## 10. Multi-Niche Strategy

Multi-niche operation is configuration-driven. The core engine remains generic while each niche supplies approved domain-specific data and templates.

- Model a niche as a versioned configuration package containing service taxonomy, terminology, templates, prohibited claims, approved claim types, required disclosures, schema mappings, and quality rules.
- Separate universal page components from niche-specific content blocks and policies.
- Require a niche onboarding checklist: data contract review, legal/compliance review, content policy, templates, sample pages, validation rules, and acceptance sign-off.
- Use namespaced identifiers, routes, cache keys, and build manifests to prevent cross-niche leakage.
- Permit shared engines and adapters; prohibit business-specific branching in core modules when configuration or a niche plugin can express the variation.
- Version niche policies independently and trigger incremental rebuilds when a niche policy changes.

## 11. Multi-Location Strategy

Multi-location generation is driven by a normalized geographic hierarchy and explicit service-area policy.

- Represent country, region/state, county/district, city, postal area, neighborhood, coordinates, and parent/nearby relationships using stable identifiers.
- Define a location eligibility rule for every `(business, service, location)` combination before page generation.
- Distinguish physical office, verified service area, and informational location; never present one as another.
- Generate location pages from location-specific context: supported services, local conditions, approved landmarks, nearby locations, and localized intent.
- Apply route uniqueness and canonicalization rules to prevent duplicate city, ZIP, and alias pages.
- Cap and validate nearby-location links to maintain relevance and reasonable crawl depth.
- Support locale and country variants through explicit configuration, translated content policy, regional schema, and legal review.

## 12. Google Ads Compliance Strategy

The engine must produce pages suitable for paid-traffic landing-page use only when the configured business and page content meet applicable Google Ads policies. Compliance is a release gate, not a marketing claim.

- Require transparent business identity, contact details, privacy policy, and required disclosures before an Ads-eligible page can publish.
- Prohibit deceptive claims, false urgency, misleading pricing, unsupported guarantees, cloaking, malware, prohibited products/services, and data collection without required notice/consent.
- Ensure the destination URL, visible content, business identity, and offer are consistent with the associated advertising configuration.
- Validate mobile usability, page speed, accessible content, clear CTA behavior, and form disclosures for Ads-eligible templates.
- Store evidence for all factual claims, credentials, geographic/service assertions, promotions, and regulated-category disclosures.
- Provide a policy flag per page: `not-reviewed`, `eligible`, `blocked`, or `requires-human-review`.
- Require human approval for regulated industries, sensitive categories, policy exceptions, new claims, and production campaigns.

## 13. Performance Goals

Targets apply to production builds under a documented representative device/network test profile. Final thresholds must be confirmed in the performance architecture before release.

| Area | Initial target |
|---|---|
| Static HTML response | Cacheable at the edge; no runtime AI dependency for page rendering. |
| Largest Contentful Paint | At or below 2.5 seconds on the approved mobile test profile. |
| Interaction to Next Paint | At or below 200 milliseconds on the approved mobile test profile. |
| Cumulative Layout Shift | At or below 0.1. |
| JavaScript | Ship only what the rendered page requires; defer non-critical behavior. |
| Images | Responsive, dimensioned, compressed, and lazy-loaded when non-critical. |
| Build efficiency | Incremental builds rebuild only targets affected by versioned dependency changes. |
| Reliability | A failed target is isolated where safe, reported clearly, and never silently published. |
| Observability | Every build exposes duration, target counts, cache behavior, failures, and quality summaries. |

## 14. Risks and Mitigations

| Risk | Impact | Mitigation | Owner |
|---|---|---|---|
| Thin or duplicate programmatic content | Search quality loss and policy risk | Intent-based templates, duplicate detection, minimum usefulness gates, human sampling. | Product and QA |
| Unsupported AI claims | Brand, legal, and Ads risk | Allowed-claims inventory, citations, reviewer gate, human approval for sensitive content. | AI governance and product |
| Inaccurate location/service coverage | User harm and trust loss | Eligibility rules, approved source data, visible disclosures, route validation. | Data and product |
| Data quality failures | Incorrect or broken pages | Schema/relationship validation, provenance, immutable source policy, rollback manifests. | Data and QA |
| Provider failure or model drift | Build disruption or inconsistent quality | Adapter isolation, retries, provider fallbacks, deterministic templates, evaluation suites. | Engineering and AI governance |
| Uncontrolled page scale/cost | Budget and operational risk | Target quotas, incremental builds, cache keys, build budgets, approval-gated full builds. | Engineering and operations |
| Search or Ads policy changes | Compliance and traffic risk | Policy monitoring, rule versioning, review cadence, rapid blocklist/rebuild capability. | Product and compliance |
| Security/privacy exposure | Regulatory and customer risk | Least privilege, secret management, scoped context, logs redaction, security review. | Security |
| Broken deployment or rollback | Availability risk | Preview environments, artifact manifests, health checks, tested rollback procedures. | Operations |

## 15. Milestones

| Milestone | Deliverables | Exit evidence |
|---|---|---|
| M0 — Governance and contracts | Approved product scope, architecture decisions, repository rules, data policy, decision owners. | Signed-off documentation and resolved priority conflicts. |
| M1 — Data foundation | Configuration contract, schemas, dataset registry, loader, validation, fixtures. | Valid sample datasets load with complete validation reports. |
| M2 — Knowledge and context | Normalization, relationship builder, knowledge objects, context packets, cache design. | Reproducible context packet for approved service/location fixtures. |
| M3 — Content and SEO core | Provider adapter, planner, generator, reviewer, SEO model, templates. | Approved preview pages pass content, SEO, and policy gates. |
| M4 — Static generator | Renderer, routes, assets, sitemap, artifact manifest, incremental build selection. | Deterministic preview site generated from versioned inputs. |
| M5 — Quality and compliance | Automated validation suite, accessibility checks, Ads eligibility controls, release reports. | Representative build meets mandatory quality and compliance criteria. |
| M6 — Operations and deployment | Preview/production adapters, observability, runbooks, backup/rollback verification. | Approved deployment and rollback drill complete. |
| M7 — Multi-niche and multi-location rollout | Niche onboarding process, geographic eligibility, isolation tests, scale tests. | Two approved niches and representative location sets operate without core branching. |

## 16. Acceptance Criteria

The initial implementation is accepted only when all applicable criteria are demonstrated with reproducible evidence.

### Architecture and Data

- [ ] Module boundaries and dependency direction match this specification and approved architecture decisions.
- [ ] Source data is validated, versioned, traceable, and not mutated during build execution.
- [ ] Context packets contain only validated, authorized, target-relevant data.
- [ ] Every generated page can be traced to its input data, configuration, template, generator, and build versions.

### Generation and SEO

- [ ] An approved fixture set produces deterministic routes and complete page models.
- [ ] Pages with unsupported claims, invalid location eligibility, thin content, or duplicate content are blocked.
- [ ] Every indexable page has valid canonical, metadata, internal-link, structured-data, and sitemap treatment.
- [ ] Generated schema matches visible, validated page content.

### Quality, Compliance, and Performance

- [ ] Required configuration, data, content, SEO, accessibility, security, performance, and artifact gates run in the build pipeline.
- [ ] Google Ads-eligible pages meet the configured business transparency, disclosure, and claim-evidence controls.
- [ ] Representative production artifacts meet the approved Core Web Vitals and asset-budget targets.
- [ ] Failed validations produce actionable reports and prevent inappropriate publication.

### Operations and Scale

- [ ] Preview, incremental, full, and validation-only build modes are available and recorded in manifests.
- [ ] Incremental selection rebuilds only targets affected by a documented dependency change.
- [ ] Deployment requires explicit approval, produces a release record, and has a tested rollback path.
- [ ] The engine supports at least two approved niches and multiple location types through configuration, without duplicating core engine logic.

## 17. Implementation Decision Gates

Before implementation begins, obtain approval for the initial technology stack, deployment provider, source-data contracts, AI provider policy, target niches, target geography, legal/compliance review process, and production performance test profile. Record each decision in the project decision log and update related documentation indexes and cross-references.
