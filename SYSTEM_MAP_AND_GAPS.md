# ESCIE SYSTEM MAP + GAPS

Date: 2026-11-05
Status: PASS 1 — structural optimization

## What exists

### Public ESCIE / EscieMusic
- Canonical public doorway and ESCIE universe presentation.
- Eight-section public order: NOW → ART → THE WORLD → THE WEB → THE ARCHIVES → THE CASE FILES → GLASS EYE → ESCIE.
- Canonical identity: ESCIE THE ARTIST. THE ART SPEAKS FOR ITSELF. / THE FATHER · THE MAN · THE MONSTER.
- Montréal-first THE WORLD with the physical clothing layer inside it.
- Glass Eye as the audience-eye layer with approved media, local non-canonical viewer memory and EN/FR/ES support.
- Controlled public Case Files bridge.
- Release firewall keeping unreleased BAM/Dallas '63 and private Central material out of the public layer.
- Separate, hidden game boundary.
- Runtime contracts, A–Z audits, Pages build and deployment gates.

### EscieCentral
- Separate private control-room repository.
- Auth/session boundary and private workspace.
- Canonical record model with provenance, evidence, relationships, visibility, workflow and release state.
- Command workflow: capture/upload → organize → ask/analyze → review → approve/decline → stage → distribute.
- Brain/agent suggestions with human authority over canon.
- Tasks, questions, investigations, archive and audit history.
- Supabase persistence, RLS, media intake, connector/OAuth foundations and distribution-job foundation.
- Case Files/D01–D12 operational source material remains private.

## What is missing

These are real capability gaps, not UI gaps:

1. Production-grade multi-artist/workspace administration is intentionally NOT enabled. Central is currently single-artist ESCIE.
2. Durable member/role administration is not exposed as a collaboration product.
3. Production connector authorization and platform publishing are not complete.
4. Durable server-side Brain jobs are not the complete production orchestration layer yet.
5. The public website bridge is controlled conceptually but is not an automatic Central-to-public publishing pipeline.
6. Durable production audit/event infrastructure needs to be treated as its own backend capability rather than only record-embedded history.
7. Production object/media lifecycle policy needs to be completed beyond the current private-storage foundation.
8. The game has no approved production hosting/platform and therefore remains deliberately hidden.

## What is needed next

The order is important:

AUTHORIZATION → DURABLE WORKSPACE OWNERSHIP → MEDIA STORAGE → CANONICAL RECORDS → BRAIN JOBS → APPROVAL/RELEASE → CONNECTORS → DISTRIBUTION → CONTROLLED PUBLIC BRIDGE → AUDIT/OBSERVABILITY

No layer should silently bypass the layer before it.

## How everything works together

ESCIE is the artist and source of canon.

EscieCentral is the private brain/control room. Raw material, private media, questions, evidence, relationships, tasks and agent suggestions live there.

Central converts sources into canonical records. The Brain may suggest classifications and relationships but cannot silently make canon.

ESCIE approves what becomes publishable. Approval and release are separate gates.

Approved outputs are transformed into destination-specific derivatives. External platforms are destinations, not sources of truth.

The public ESCIE site receives only finished, approved public material. It remains independently deployable and does not depend on Central credentials or private state.

Glass Eye is the audience-facing participation/viewer layer. Viewer memory is local and non-canonical. Public participation cannot silently become Central canon.

The game is a separate future experience. It is not a dependency of the public site or Central.

## Protected boundaries

- Public → Central: no private state import.
- Central → Public: approved-output-only bridge.
- Agent → Canon: never automatic.
- Source → Release: never automatic.
- Viewer participation → Canon: never automatic.
- Game → Public navigation: deliberately hidden until hosting is approved.
- Unreleased BAM/Dallas '63 → Public: sealed.

## Three-pass rule

Pass 1: structure/function.
Pass 2: experience/presentation.
Pass 3: hardening/release.

Every pass ends with an A–Z audit. A later pass cannot erase a protected decision from an earlier pass.

## Master definition of green

PUBLIC CONTRACTS + PUBLIC A–Z + SYNTAX + RELEASE FIREWALL + PAGES BUILD + DEPLOY + CENTRAL CI + CENTRAL CONTRACTS + DATABASE SECURITY = PASS.

A green UI alone is not green.
