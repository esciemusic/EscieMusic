# ESCIE Optimization Pass Gate Standard

This is the acceptance standard for every ESCIE optimization pass.

A pass is **100% complete only when all seven gates are green**. Percent estimates are planning signals only; they are never completion evidence.

## The seven gates

| Gate | Purpose | Required evidence |
|---|---|---|
| 1. Definition | The problem and desired outcome are explicit | Scope, success criteria, and non-goals are clear |
| 2. Architecture | The change belongs in the correct ESCIE layer | No boundary, hierarchy, or system contradiction |
| 3. Implementation | The intended behavior actually exists | Production code/data/UI implements the approved design |
| 4. Contract | The behavior is mechanically protected | Relevant automated contract/syntax/regression tests pass |
| 5. Experience | A visitor can use it correctly | Real interaction path works on mobile/desktop; accessibility and reduced-motion behavior hold |
| 6. Release | The change is safe to expose | Release firewall, privacy, unreleased-content, and Public/Central/Game boundaries pass |
| 7. Live | The deployed result matches the approved result | Build, deployment, and live-browser audit pass |

## Gate rules

1. **No silent skipping.** If a gate is not applicable, record why rather than silently treating it as passed.
2. **No percentage inflation.** A feature at 99% with one failed gate remains incomplete.
3. **Tests do not prove experience by themselves.** Gate 5 requires actual interaction evidence where interaction is part of the pass.
4. **Deployment does not prove live health.** Gate 7 requires the deployed live audit.
5. **A transient failure may be retried, not ignored.** Persistent failures remain red.
6. **Smallest demonstrated fix first.** Do not add architecture unless a gate exposes a real architectural deficiency.
7. **No automatic release of private or unreleased material.** Agent suggestions, visitor contributions, Central state, and unreleased BAM material remain behind their approval boundaries.
8. **No automatic modification during audit.** Audit reports the failure and smallest fix; implementation requires an explicit continuation/approval step.
9. **A pass closes only at 7/7.** If any gate is red or unverified, the pass remains open.

## Pass lifecycle

**DEFINE → BUILD → VERIFY → EXPERIENCE → RELEASE → DEPLOY → PROVE**

The seven gates map to that lifecycle as follows:

- Definition
- Architecture + Implementation
- Contract
- Experience
- Release
- Live

Architecture and implementation are separate gates even when completed in the same development step.

## Pass status

- **🟢 7/7 — COMPLETE:** all gates passed with evidence.
- **🟡 6/7 or fewer with no failure:** work remains unverified.
- **🔴 Any failed gate:** pass is blocked until the demonstrated failure is resolved.
- **⚪ Not applicable:** only allowed with an explicit recorded reason.

## ESCIE master rule

> **Nothing is 100% because we think it is finished.  
> It is 100% because all seven gates have passed.**

This standard applies to World, World Elements, Navigation, Glass Eye, Web, Language, Accessibility, Mobile, Visual, Content Readiness, Deployment, Central boundaries, and future optimization passes.
