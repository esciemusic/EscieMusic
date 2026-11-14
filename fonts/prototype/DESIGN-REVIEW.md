# ESCIE Font Prototype Review

## Pass 1 result

The first binary prototype proves that the family can be generated from original vector primitives and that the required French glyphs can be covered without an external font service.

It **does not yet pass the ESCIE identity test**.

The current geometry reads too much like a technical/pixel display. That is useful as a construction test, but it is not yet the intended damaged-gothic / industrial / intimate ESCIE language.

## Do not merge to production

Keep the prototype source isolated.

The next letterform pass must change the visual construction itself:

- ESCIE: architectural gothic tension, narrower authority, interrupted terminals, controlled damage, stronger organic rhythm.
- ESCIE SIGNAL: retain the family DNA but remove the pixel/grid feeling; cleaner operational geometry.
- ESCIE SCRIPT: retain the family DNA while becoming genuinely human and handwritten rather than a slanted display face.
- Shared DNA: proportions, terminal logic, contrast and spacing should make the three faces feel related.

## Pass 4 result

Pass 4 introduced explicit signature construction for **A, C, E, G, M, O, R, S, T**.

The prototype remains intentionally isolated from production. The signature test is now concrete: remove the word ESCIE and judge the individual anchor silhouettes on their own.

Pass 4 exposed two family-level issues that must be corrected before promotion:

- SIGNAL must share the DNA without simply duplicating the damaged identity face.
- Lowercase construction must be real and usable rather than falling through to incomplete display geometry.

## Pass 5 result

Pass 5 adds the family-level correction layer:

- **ESCIE:** retains the stronger Pass 4 signature anchors.
- **ESCIE SIGNAL:** uses the same structural DNA with reduced asymmetry and cleaner operational proportions.
- **Lowercase:** receives a controlled x-height construction derived from the authored uppercase geometry so navigation/metadata can be evaluated at realistic sizes.
- **French accents:** now inherit the corrected lowercase/uppercase base construction rather than relying on missing lowercase display geometry.
- **Production:** unchanged; Pass 5 remains prototype-only.

This is a construction correction, not a CSS workaround.

## Current acceptance gate

Production typography remains on the safe fallback stack until all of these pass:

1. ESCIE identity test.
2. Three-face family test.
3. Phone readability.
4. French/English glyph coverage.
5. Lowercase and accented lowercase coverage.
6. Provenance/licensing review.
7. Public-site specimen review.
8. Production font-load and metadata tests.

The goal is not to ship a font because it exists. The goal is to ship a typeface that could only belong to ESCIE.
