# ESCIE — THE WEB ARCHITECTURE & CONNECTION MODEL

Status: Pass 3 — architecture hardening
Version: 1.2.0

## Purpose

THE WEB is ESCIE's relationship layer: the connective tissue between public records.

It is not a truth engine, a social graph, a generic recommendation system, or a second canon database.

Core rule:

SOURCE → RELATIONSHIP → TARGET

A connection is a recorded relationship. A connection is not automatically truth.

## Canonical node vocabulary

THE WEB operates on the shared public record registry. Its canonical node families are:

- PERSON
- PLACE
- MOMENT
- ART
- RECORD
- ARCHIVE
- CASE FILE
- FRAGMENT
- SIGNAL
- SYMBOL
- OBJECT
- EVENT

The registry remains the source of node identity. THE WEB must not create a second identity store.

## Connection object

Every relationship has:

- id
- from
- type
- to
- status
- confidence
- canonical_status
- basis
- source
- evidence
- date
- context
- note
- visibility
- public_disclosure
- created_at
- updated_at
- history

The relationship contract owns connection semantics. Record contracts own node structure.

## Status layers

Three questions must never be collapsed:

1. Lifecycle: is this connection active, proposed, disputed, withheld, or archived?
2. Canonical status: has ESCIE established this connection?
3. Confidence: how strongly supported is the connection?

Therefore:

connection ≠ truth
connection ≠ confidence
connection ≠ canon

A suggested connection can exist without becoming canon.

## Public disclosure

The public graph consumes only the public-safe projection.

Public visibility does not automatically mean canonical.

Publicly disclosed provisional/proposed/disputed connections may be shown only when explicitly marked for public disclosure. Their presentation must preserve their state rather than implying certainty.

Unresolved and unknown states are legitimate public states:

- THREAD UNRESOLVED
- UNKNOWN CONNECTION

Contradictions remain visible as:

- CONFLICTING RECORDS

The interface must never silently resolve, promote, downgrade, or rewrite these states.

## Direction

Relationships are directional unless the relationship type is explicitly symmetric.

The stored relationship is always:

FROM → TYPE → TO

Inverse traversal is a view operation. It must not silently create a second canonical relationship.

If an inverse semantic is not registered as a valid relationship type, the inverse operation returns no canonical inverse rather than manufacturing an unsupported type.

## Traversal

THE WEB supports:

- direct traversal: A → B
- reverse traversal: B ← A
- path traversal: A → B → C
- filtered traversal by type/category/status/visibility
- node-centric discovery
- relationship-aware search

Traversal never changes canonical data.

Public traversal must resolve node visibility through the same public projection boundary used by the rest of the site.

The public projection pipeline is fail-closed:

REGISTRY → RELATIONSHIP CONTRACT → RELATIONSHIP DISCLOSURE → ENDPOINT PUBLIC RECORD → RELEASE FIREWALL → PUBLIC RELATIONSHIP VIEW → RENDERER

A relationship is never sufficient by itself. Both endpoints must resolve to released, published, public records before the connection can become traversable. Private editorial fields such as evidence provenance, source references, history and internal metadata are stripped before public rendering.

## Discovery

Discovery may rank existing public nodes for navigation.

Discovery must not:

- create relationships
- imply canon
- expose private evidence
- expose Central state
- bypass release gates
- turn audience interpretation into canon

A recommendation is navigation, not a relationship.

## Evidence

Evidence supports a relationship but does not become the relationship itself.

Evidence identifiers and private provenance remain outside the public-safe projection unless explicitly released.

## Central boundary

Central remains the private control plane.

Flow:

CENTRAL SOURCE/RESEARCH
→ CANDIDATE RELATIONSHIP
→ REVIEW
→ HUMAN APPROVAL
→ PUBLIC-SAFE RELATIONSHIP
→ THE WEB

The public site does not automatically ingest Central state.

Audience participation does not automatically become Central canon.

## Release firewall

Unreleased BAM/Dallas '63, private case files, credentials, private media, and operational Central state must never enter THE WEB public projection.

A locked record resolves to no public node.

A relationship pointing to a non-public node is not publicly traversable.

## Connection categories

The controlled vocabulary remains intentionally small:

- STRUCTURAL
- CREATIVE
- PEOPLE
- PLACE
- TIME_EVENT
- PROOF_INVESTIGATION
- INTERPRETIVE

There is no generic `related_to`.

If the system cannot name the relationship, it should remain unresolved rather than inventing a generic edge.

## Public experience model

THE WEB should feel like discovering connections in ESCIE's world, not operating a database.

Primary experience:

1. enter from a public node
2. see its explicit connections
3. understand what kind of connection it is
4. notice confidence/state when relevant
5. follow another node
6. build a personal trail

The visitor's trail is local viewer memory and is not canon.

## Pass 3 hardening invariants

- one node identity source
- one relationship contract
- no duplicate graph database
- no generic relationship type
- no silent canonization
- no silent truth claims
- no private-to-public leakage
- no unreleased BAM exposure
- reverse traversal without mutation
- public projection before public rendering
- relationship state remains visible when intentionally disclosed
- audience navigation never mutates canon
