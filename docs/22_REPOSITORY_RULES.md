# Repository Rules

## Purpose

This document establishes repository-wide rules for organizing, changing, and maintaining Enterprise PSEO artifacts. It applies to people, automation, and AI agents. User instructions and approved security, legal, and compliance requirements take precedence.

## Folder Structure

The repository uses a clear separation between product code, project data, generated output, automation, configuration, and documentation. Create a directory only when an approved implementation need exists.

| Location | Intended contents | Ownership |
|---|---|---|
| Repository root | Project-level configuration and concise entry-point documents. | Architecture owner |
| `docs/` | Governed product, technical, operational, and process documentation. | Documentation owner |
| `src/` | Application source code, when approved. | Engineering owner |
| `data/` | Approved source datasets and schemas, when approved. | Data owner |
| `config/` | Non-secret, versioned configuration, when approved. | Engineering and operations owners |
| `scripts/` | Repeatable project automation, when approved. | Engineering owner |
| `tests/` | Automated tests and fixtures, when approved. | Quality owner |
| `public/` | Static public assets, when approved. | Engineering owner |
| `generated/` | Reproducible build output; do not hand-edit. | Build system |

The current repository may not yet contain every listed directory. The table defines intended placement, not authorization to create missing folders.

## Naming Conventions

- Use lowercase kebab-case for code directories and ordinary code files unless an approved language/tool convention requires otherwise.
- Use lowercase snake_case for dataset files when their data contract specifies it.
- Use uppercase, descriptive Markdown filenames for governed documents in `docs/`, prefixed with a two-digit order number where they belong to the documentation sequence (for example, `22_REPOSITORY_RULES.md`).
- Use clear, stable names; avoid vague names such as `misc`, `new`, `final`, or `temp`.
- Preserve public API, schema, and documented filenames unless an approved compatibility or migration plan exists.
- Keep generated files distinguishable through their approved directory or a documented generation process.

## File Ownership

Every material file must have one accountable owner role. Contributors may propose changes, but owners approve changes within their domain.

| File domain | Accountable owner | Required reviewers for material change |
|---|---|---|
| Charter, PRD, roadmap, and priorities | Product owner | Architecture owner |
| Architecture and interfaces | Architecture owner | Engineering and security owners |
| Data contracts and source datasets | Data owner | Architecture and quality owners |
| Application code | Engineering owner | Relevant code owner and quality owner |
| Tests and quality gates | Quality owner | Engineering owner |
| Security policy and controls | Security owner | Architecture and operations owners |
| Deployment and operations | Operations owner | Security and engineering owners |
| AI governance and AI workflow | AI governance owner | Security and product owners |
| Documentation index and cross references | Documentation owner | Affected domain owner |

Until named people are assigned, the user is the final accountable owner for all domains.

## Documentation Standards

- Write in UTF-8, valid Markdown, with meaningful headings and concise prose.
- State the document purpose, owner, status, and last-reviewed date for substantive documents.
- Link to canonical sources instead of copying policies or contracts into multiple files.
- Record assumptions, decisions, constraints, and unresolved issues where they affect implementation.
- Use examples, diagrams, tables, and checklists only when they make a requirement clearer.
- Keep references accurate. A document must not require a file that does not exist.
- Update `00_DOCUMENT_INDEX.md` when a documentation file is added, removed, renamed, reprioritized, or materially changes dependency relationships.
- Review documentation for encoding corruption, stale status labels, and duplicate guidance before approval.

## Versioning

- Use Git history as the primary record of file revisions once source control is initialized.
- Use semantic versioning for released software and versioned external/API/schema contracts: `MAJOR.MINOR.PATCH`.
- Increment a schema or public API major version only for a breaking change; provide migration and deprecation guidance before release.
- Include a dated revision history in long-lived governing documents when a change materially affects behavior or policy.
- Do not label a document “Approved,” “Frozen,” or “Production Ready” without an approver, date, and supporting evidence.
- Generated outputs are versioned by their input data/configuration and build identifier; they are not manually versioned.

## Dependency Policy

- Prefer the smallest justified dependency set.
- Before introducing a dependency, evaluate maintenance activity, license, security posture, size/performance impact, compatibility, and viable alternatives.
- Pin dependencies through the approved package manager and commit the lockfile when package installation is approved.
- Do not add duplicate libraries with overlapping responsibilities without documented justification.
- Do not add dependencies solely to perform a small utility task that can be safely implemented with the approved platform capabilities.
- Review and update dependencies on a defined security-maintenance cadence once a stack is approved.

## Import Policy

- Respect the dependency direction defined by the approved architecture; higher-level presentation and orchestration modules must not become dependencies of foundational modules.
- Use explicit imports and public module interfaces. Avoid hidden global state, circular imports, and deep imports into another module’s internals.
- Import from the owning module’s documented public entry point where one exists.
- Keep third-party imports isolated behind adapters when they affect provider, infrastructure, or business-critical integrations.
- Do not import raw datasets directly into AI or presentation layers; pass validated, scoped contracts instead.
- Remove unused imports and do not suppress import, type, or lint errors without a documented, approved exception.

## AI Editing Policy

- AI may inspect, summarize, propose, and make explicitly requested, scoped edits.
- AI must read the relevant product, architecture, data, security, and quality guidance before material implementation work.
- AI must preserve unrelated work, minimize diffs, and state assumptions that could affect scope or behavior.
- AI must not invent business facts, modify source data without approval, expose secrets, disable safeguards, or claim verification it did not perform.
- AI must request approval according to `23_DECISION_MATRIX.md` before executing an approval-required action.
- AI must update relevant tests and documentation when an approved change alters behavior, contracts, or operations.
- AI must stop and escalate when documentation conflicts, requirements are materially ambiguous, a security concern is found, or the required authority is absent.
