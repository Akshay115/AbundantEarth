# Content and asset provenance

## Non-blog migration update

The follow-up migration adds `legacy-projects.json`, `legacy-history.json`, `legacy-pages.json`, `source-pages.json`, and `legacy-partners.json`. Exact source URLs and 224 recovered image entries are recorded in `migration-manifest.json`. New image paths use `/images/legacy/*.webp`; `Photo.astro` supports these direct local paths alongside the original image-family system.

The old blog posts and long-form editorial pages were **not transferred**. The three original entries in `stories.json` are unchanged. See [MIGRATION.md](MIGRATION.md) for the inventory, exclusions, provider status, and missing source assets.

## Editorial model

Projects live in `src/data/projects.json`. Each contains a stable slug, title, location, country filters, theme, historical status, lead description, challenge, approach, AEF support, reported outcomes, reporting note, source, and image caption.

Stories live in `src/data/stories.json` and refer to a valid project slug. They are editorial retellings, not new interviews. No quotations or testimonials have been invented.

The headline impact data is in `src/data/site.json`. When updated, also review date-specific prose on the homepage and impact page. Financial records and the historical team are in their corresponding page templates. Build checks validate references and local links but cannot establish factual accuracy.

## Image provenance

Downloaded September 18, 2026. Exact URLs are maintained in `scripts/fetch-media.mjs`; output variants are committed to `public/images/` so normal builds do not depend on third-party availability.

| Family | Subject/source | Original source path |
|---|---|---|
| `food-forest` | Contour Lines, Guatemala; published by ARC | `https://agroforestryrc.org/wp-content/uploads/2021/12/After-September-2021-Contour-Lines_1920.jpg` |
| `forest-before` | Contour Lines, Guatemala; published by ARC | `https://agroforestryrc.org/wp-content/uploads/2021/12/Before-February-2019-Contour-Lines_1920.jpg` |
| `training` | ARC agroforestry training network; contextual RHRC image, not a verified RHRC event | `https://agroforestryrc.org/wp-content/uploads/2022/03/Roland-homepg-scaled.jpg` |
| `gardens` | Refarmers, Uganda; published by ARC | `https://agroforestryrc.org/wp-content/uploads/2022/03/patrick-homepg-scaled.jpg` |
| `seedlings` | Permaculture Paradise Institute, Malawi; published by ARC | `https://agroforestryrc.org/wp-content/uploads/2021/12/Permaculture-Paradise_Seedlings.jpg` |
| `community` | Towards Green Environment; AEF archive | `https://web.archive.org/web/20250812100538im_/https://abundantearthfoundation.org/wp-content/uploads/2023/05/IMG_0192-150x150.jpg` |
| `education` | Students observing plants; current Eco-Designers website | `https://www.eco-designers.com/uploads/1/1/8/6/11866315/students-observing-plants-on-pots-1.jpeg` |
| `youth` | Brenda Nakafeero; AEF prize-recipient archive | `https://web.archive.org/web/20250812100538im_/https://abundantearthfoundation.org/wp-content/uploads/2023/05/Nakafeero-Brenda-2022.jpg` |
| `hannah` | Hannah Eckberg portrait; retained for future approved team treatment | `https://agroforestryrc.org/wp-content/uploads/2021/12/HAE-headshot-in-green_1200.jpg` |

Public availability does not establish a reuse license. Photographs remain owned by their rights holders. The site is delivered as a non-indexable preview while permissions/current context are reviewed. No claim of newly obtained photography consent is made.

The TGE image is an archived thumbnail. The `Photo` component renders it at its native scale in a designed frame. Other images use responsive WebP variants and stable display dimensions. No photo is AI-generated or presented as a new field visit.

## Updating images

1. Obtain an approved original and an accurate subject/location caption.
2. For a known publicly hosted image, update the corresponding source in `scripts/fetch-media.mjs`.
3. Run `npm run media -- FAMILY_NAME` to generate the family’s 480/960/1600 variants. The script validates image bytes, strips metadata through re-encoding, and does not enlarge smaller originals.
4. Update `image`, `imageAlt`, and `imageCaption` in the project/story data. Families are referenced by name without a file extension.
5. If replacing the small `community` thumbnail with a full-resolution original, remove its special archival-frame branch in `Photo.astro`.
6. Run `npm run build`, then inspect the image at desktop and mobile widths.

Pages CMS media uploads alone do not generate these variants. A developer must prepare new image families before selecting them in content.

## Fonts and identity

- Fraunces Variable: `@fontsource-variable/fraunces`, SIL Open Font License.
- DM Sans: `@fontsource/dm-sans`, SIL Open Font License.
- Font files are bundled locally. License files are distributed with the packages.
- The leaf mark, SVG line icons, layout, and decorative patterns were created for this redesign. Confirm brand approval before adopting them as the official identity.

## Sources on the public site

`/sources/` exposes the research basis and credits. Project profiles have their own source links. `/impact/#reporting` explains attribution. Historical statistics, grant plans, and team roles are labeled rather than silently upgraded to current claims.
