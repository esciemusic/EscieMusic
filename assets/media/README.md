# ESCIE Media Library

Put reusable photographs and visual assets in this folder.

For each asset:
1. Add the image/video file under `assets/media/`.
2. Add a matching record to `data/media.js`.
3. Give it a unique `id`.
4. Set `location.coordinates.lat/lng` only when verified.
5. Use `placement.publicSections`, `placement.worldDistricts`, and/or `placement.worldBuildings` to control where the asset may appear.
6. Use `game` flags to distinguish reference material from textures, billboards, or evidence.

The registry is the source of truth for media metadata. The image file itself is only the asset.

Example asset path:
`assets/media/my-photo-001.jpg`

Example reference:
`{ mediaId: "my-photo-001" }`

Coordinates do not automatically establish a real-world claim. Keep the coordinate source/accuracy metadata with the record and verify before publishing.
