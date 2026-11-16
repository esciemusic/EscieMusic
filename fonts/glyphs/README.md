# ESCIE Glyph System

The ESCIE Glyph System is the non-verbal layer of the ESCIE visual language.

It is a companion to the ESCIE, ESCIE SIGNAL, and ESCIE SCRIPT typefaces. It carries portals, relationships, recurring motifs, and structural marks.

Core rule:

**historical source → faithful reference → ESCIE interpretation → navigation purpose**

A historical source is never presented as though the ESCIE derivative were the original cultural glyph.

## Two symbol classes

### ESCIE GLYPHS

Original ESCIE-derived marks may live in the private-use area of the ESCIE GLYPH font.

Primary portal glyphs:

| Glyph | Code point | Meaning | Source relationship |
| --- | --- | --- | --- |
| OJÚ | U+E100 | SEE | Derived from Yorùbá ojú òde / ojú inú concepts |
| MAYA SPEECH | U+E101 | HEAR | Derived from the Maya/Mesoamerican speech-scroll convention |
| THOTH | U+E102 | READ | Derived from Ancient Egyptian scribal / Thoth associations |
| STARGATE | U+E104 | GO | Original ESCIE interpretation of celestial threshold / passage |
| ORION | U+E105 | CONNECT | Derived from the actual Orion constellation geometry |

Structural glyphs:
- HOME — U+E110
- NOW — U+E111
- PATH — U+E112
- GRAVITY — U+E113
- UNKNOWN — U+E114

Recurring motifs occupy U+E120 onward.

### SOURCE ARTWORK MARKS

Some references are artworks rather than glyph traditions.

**VITRUVIAN MAN is intentionally not redrawn into a fake historical glyph.**

The Leonardo artwork remains an artwork asset/mark. ESCIE can reference it, position it, animate its container, and use it as a portal, but the production system must not claim a newly drawn approximation is Leonardo's work.

Its production gate therefore requires a provenance-cleared source artwork before promotion into a font or reusable binary asset.

## Design rules

1. Symbols are verbs, not labels:
   OJÚ = SEE; MAYA SPEECH = HEAR; THOTH = READ; VITRUVIAN MAN = MEET; STARGATE = GO; ORION = CONNECT.
2. Meaning remains stable; destination is contextual.
3. A symbol may recur. Repetition creates language; indiscriminate repetition creates decoration.
4. The same glyph can appear as portal, contextual mark, trail node, metadata mark, or transition.
5. Symbols must work without color. Color, glow, distortion, and motion are secondary states.
6. Never use a culturally borrowed sign as though ESCIE invented its historical meaning.
7. Never fabricate an authentic historical glyph when the design is actually an ESCIE derivative.
8. The font is a delivery system, not the meaning. Registry metadata remains authoritative.

## Visual grammar

Every glyph has three states:

- DORMANT — quiet, thin, low contrast
- ACTIVE — clear enough to invite interaction
- CONNECTED — responds to a relationship, route, or discovered trace

Do not add permanent glow to every symbol.

## Font architecture

ESCIE GLYPH uses private-use codepoints so the symbol language cannot replace normal letters or punctuation.

- U+E100–U+E105 — six experiential portal channels
- U+E110–U+E114 — structural World concepts
- U+E120–U+E126 — recurring motifs

The codepoint is an implementation address. The semantic symbol-id in data/symbols.js remains canonical.

## Production boundary

The existing SVG symbols remain the rendering fallback.

The font becomes production-ready only when every glyph has a provenance classification, every derived glyph is self-authored, source artwork is separated from derivatives, PUA mappings are stable, 16px–128px rendering is clean, phone/desktop specimens pass, accessibility labels remain text-based, and no external font service is required.

The public site must continue to function if the glyph font fails to load.
