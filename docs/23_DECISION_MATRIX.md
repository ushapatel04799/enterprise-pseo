# Decision Matrix

## Purpose

This matrix defines the default authority for repository actions. It applies to people, automation, and AI agents. Explicit user direction may authorize an action within its stated scope, except that forbidden actions remain prohibited unless the user explicitly changes the governing rule and accepts the associated risk.

## Risk Levels

| Level | Meaning | Default handling |
|---|---|---|
| Low | Local, reversible change with no material effect on behavior, contracts, security, or data. | May proceed autonomously when in scope. |
| Medium | Change affects implementation, documentation, tests, dependencies, or operations but is reversible and contained. | Approval required unless the user explicitly requested that exact change. |
| High | Change affects public behavior, architecture, security, data integrity, deployment, cost, or compatibility. | Obtain explicit approval before execution. |
| Critical | Change can expose data, cause irreversible loss, create legal/compliance exposure, or materially impair production systems. | Stop, preserve evidence, and escalate immediately. |

## Action Matrix

| Action | Default decision | Risk | Required action |
|---|---|---:|---|
| Read repository files and documentation | Autonomous | Low | Inspect only what is relevant to the task. |
| Create an explicitly requested documentation file | Autonomous | Low | Create only the requested file; do not alter unrelated documents. |
| Correct a typo or formatting issue in a file explicitly named by the user | Autonomous | Low | Preserve meaning and verify the diff. |
| Summarize, audit, or review repository material | Autonomous | Low | Do not modify files unless asked. |
| Add or change internal implementation code explicitly requested by the user | Autonomous | Medium | Make scoped changes and run proportional validation. |
| Add/update tests for an approved behavior change | Autonomous | Medium | Keep tests aligned with documented contracts. |
| Update documentation required by an approved implementation change | Autonomous | Medium | Update only directly affected documentation. |
| Create folders, configuration, or build assets not explicitly requested | Approval required | Medium | Present purpose, affected paths, and alternatives. |
| Install, remove, or upgrade packages | Approval required | Medium to High | Identify package, version, license/security considerations, and lockfile impact. |
| Change internal module boundaries, shared contracts, or event shapes | Approval required | High | Provide architecture impact and migration plan. |
| Change a public API, plugin SDK, schema, or documented compatibility promise | Approval required | High | Provide versioning, compatibility, and migration plan. |
| Modify source datasets, business configuration, or generated-content inputs | Approval required | High | Identify exact records, rationale, validation, and rollback plan. |
| Change authentication, authorization, secrets, encryption, logging controls, or security policy | Approval required | High | Include threat/risk assessment and validation plan. |
| Deploy, publish, change production infrastructure, or trigger external side effects | Approval required | High | Confirm target environment, rollback, monitoring, and owner approval. |
| Delete files, data, environments, or releases | Approval required | High | Confirm exact targets, backups, impact, and recovery plan. |
| Reset history, force-push, rewrite shared branches, or bypass protection | Forbidden | Critical | Do not execute; escalate to the user/owner. |
| Expose, log, commit, or transmit secrets and personal/sensitive data without an approved control | Forbidden | Critical | Stop immediately; report the exposure safely. |
| Disable security controls, tests, validation, audit logging, or access checks to make work pass | Forbidden | Critical | Do not execute; diagnose and propose a safe solution. |
| Invent business facts, licenses, reviews, certifications, locations, metrics, or compliance claims | Forbidden | High | Request verified source material or clearly label an assumption. |
| Modify raw source data or generated output manually when a governed pipeline owns it | Forbidden | High | Use the approved source/pipeline or obtain a documented exception. |
| Make unrelated refactors, broad rewrites, or scope expansions while performing a scoped task | Forbidden | Medium to High | Report the opportunity separately and request direction. |

## Autonomous Actions

An action may proceed without further approval only when all of the following are true:

- It is explicitly requested or is a necessary, low-risk step within the requested task.
- It is reversible and confined to the approved scope.
- It does not alter public contracts, source data, security posture, deployment state, or external systems.
- It does not install dependencies or create unrequested project structure.
- It preserves existing unrelated work and can be validated proportionately.

## Approval Requests

Before an approval-required action, provide:

1. The exact action and affected files/systems.
2. The reason it is needed and expected benefit.
3. Risks, compatibility implications, and alternatives.
4. Validation and rollback approach.
5. The specific decision needed from the approver.

Approval is scoped: it authorizes only the described action and does not authorize adjacent changes.

## Escalation Rules

Escalate to the user or accountable owner before proceeding when:

- Requirements, architecture, or documentation provide materially conflicting direction.
- A task would change a public contract, data record, security control, infrastructure, or deployment state.
- A potential secret, privacy issue, vulnerability, or data-integrity concern is discovered.
- The required owner is unknown, the expected file/system is absent, or evidence is insufficient to make a safe decision.
- A validation failure indicates a possible regression outside the requested scope.

For High risk, pause before the change and obtain explicit approval. For Critical risk, stop immediately, avoid making the situation worse, preserve only safe diagnostic evidence, and notify the appropriate owner.

## Decision Record

For approval-required or escalated changes, record the decision in the relevant issue, pull request, change record, or approved decision log. Include the date, approver, scope, rationale, risks, validation evidence, and rollback outcome.
