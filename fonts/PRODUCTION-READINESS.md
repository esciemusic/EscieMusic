# ESCIE Typography Production Gate

Status: **PROTOTYPE APPROVED FOR PRODUCTION PREPARATION — NOT YET PRODUCTION**

The current three-face letterform system has passed the prototype gates on the ESCIE font branch:

- ESCIE identity: PASS
- ESCIE SIGNAL family relationship: PASS
- ESCIE SCRIPT human/intimate direction: PASS
- desktop specimen: PASS
- phone specimen: PASS
- French/English glyph coverage: PASS
- self-authored construction: PASS
- production isolation: PASS
- repository contracts: PASS

## Three faces

### ESCIE
Primary identity/display face. Narrow architectural proportions, controlled damage, strong vertical authority, and human asymmetry.

### ESCIE SIGNAL
Operational face for navigation, metadata, evidence, and interface text. It shares the family construction while remaining cleaner and more functional.

### ESCIE SCRIPT
Intimate visitor-facing handwriting face. The lowercase skeletons are self-authored and deliberately human rather than decorative or runic.

## Provenance rule

All final font binaries must be generated from the self-authored source in this repository or from later self-authored source committed to this repository.

No reference font may be copied, traced, embedded, subsetted, modified, or distributed as part of the final ESCIE family.

Reference fonts may inform broad design direction only. The final letterforms must remain independently authored.

## Production binary gate

Before production binaries can replace the existing fallbacks:

1. Freeze the approved letterform source.
2. Generate clean release binaries from the source.
3. Verify glyph coverage, including French diacritics and punctuation.
4. Verify naming, version metadata, metrics, ascent/descent, and file integrity.
5. Render desktop and 390px phone specimens from the release binaries.
6. Compare the release specimens against the approved prototype identity.
7. Run repository contracts and site-load tests.
8. Confirm no external font service or third-party font asset is introduced.
9. Review licensing/provenance metadata.
10. Require explicit approval before merging the production font binaries.

## Current boundary

The public site still uses the existing safe fallback stack. The prototype binaries are not loaded by production pages.

**Do not merge production binaries automatically.**
