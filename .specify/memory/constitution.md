<!--
Sync Impact Report
Version change: unversioned template -> 1.0.0
Modified principles:
- Template Principle 1 -> I. Code Quality Is Mandatory
- Template Principle 2 -> II. Tests Prove Behavior
- Template Principle 3 -> III. User Experience Is Consistent
- Template Principle 4 -> IV. Performance Budgets Are Requirements
Added sections:
- Quality Gates
- Delivery Workflow
Removed sections:
- Placeholder Principle 5
Templates requiring updates:
- ✅ updated .specify/templates/plan-template.md
- ✅ updated .specify/templates/spec-template.md
- ✅ updated .specify/templates/tasks-template.md
- ✅ updated .specify/templates/checklist-template.md
- ✅ updated AGENTS.md
- ✅ verified .specify/templates/commands/*.md absent
Follow-up TODOs:
- None
-->
# Pingpong Constitution

## Core Principles

### I. Code Quality Is Mandatory
All production code MUST be readable, cohesive, and aligned with the existing
project structure. Every change MUST use the smallest clear design that solves
the stated requirement, avoid unrelated refactors, and remove duplication when
it creates maintenance risk. Linting, formatting, static checks, and code review
MUST pass before delivery. Public interfaces, complex logic, and non-obvious
tradeoffs MUST be documented close to the code.

Rationale: predictable code is easier to review, test, extend, and recover when
requirements change.

### II. Tests Prove Behavior
Every executable behavior change MUST include automated tests that verify the
user-visible outcome or system contract. Unit tests MUST cover isolated rules
and edge cases; integration, contract, or end-to-end tests MUST cover cross
module behavior, persistence, external interfaces, and critical user journeys.
Tests MUST be written or updated before implementation whenever the intended
behavior is known, and they MUST fail for the missing or broken behavior before
the fix is completed.

Rationale: tests are the repeatable evidence that a feature works and that
future changes have not broken existing behavior.

### III. User Experience Is Consistent
User-facing changes MUST follow established product patterns for layout,
terminology, interaction states, accessibility, and visual hierarchy. New UI
elements MUST include loading, empty, error, disabled, and success states when
those states can occur. Workflows MUST preserve clear navigation and feedback,
and accessibility requirements such as keyboard access, focus order, semantic
labels, and sufficient contrast MUST be verified before release.

Rationale: consistent interfaces reduce user effort and prevent quality drift
across features.

### IV. Performance Budgets Are Requirements
Each feature MUST define measurable performance expectations in the specification
or implementation plan before build work begins. The implementation MUST avoid
unbounded work on user paths, unnecessary network or storage calls, avoidable
large payloads, and layout or rendering work that threatens responsiveness.
Performance-sensitive changes MUST include measurement, regression checks, or a
documented benchmark showing the budget is met.

Rationale: performance failures are product failures when they block users from
completing their work.

## Quality Gates

Every plan and review MUST explicitly verify these gates:

- Code Quality: linting, formatting, type or static checks, and review criteria
  are defined for the affected stack.
- Testing Standards: required unit, integration, contract, end-to-end, or manual
  checks are identified with a reason for any automated test gap.
- User Experience Consistency: user-facing behavior follows existing patterns
  and includes required accessibility and state coverage.
- Performance Requirements: measurable budgets or justified non-applicability
  are recorded before implementation.

A gate violation MUST be documented in the implementation plan with the reason,
the rejected simpler alternative, and the mitigation that will be completed
before release.

## Delivery Workflow

Specifications MUST describe independently testable user outcomes, edge cases,
UX requirements for user-facing work, and measurable performance requirements.
Plans MUST select the project structure, testing approach, quality tooling, UX
validation approach, and performance budget before task generation. Tasks MUST
include quality, test, UX, and performance work in the relevant phase rather
than leaving those concerns to final cleanup.

Implementation MUST proceed in small, reviewable increments. Each completed
increment MUST pass the planned quality gates and preserve previously delivered
behavior before the next increment is accepted.

## Governance

This constitution supersedes conflicting workflow guidance for specifications,
plans, tasks, reviews, and implementation. Amendments MUST include the reason
for change, the affected principles or sections, any migration impact for active
features, and updates to dependent templates or runtime guidance.

Versioning follows semantic versioning:

- MAJOR: backward-incompatible governance changes or removal/redefinition of a
  core principle.
- MINOR: new principles or sections, or materially expanded governance.
- PATCH: clarifications, wording updates, or non-semantic refinements.

All feature plans and reviews MUST include a Constitution Check. A reviewer or
implementer MUST block delivery when a required gate lacks evidence or an
approved mitigation. Compliance is reviewed at plan creation, after design, and
before implementation is considered complete.

**Version**: 1.0.0 | **Ratified**: 2026-05-30 | **Last Amended**: 2026-05-30
