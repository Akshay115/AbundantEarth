# Layout review

## Coverage

The review script visits every URL in the built sitemap: 176 content pages at 320, 390, 768, 1024, and 1440px, for 880 page/width observations. It waits for fonts and checks page overflow, out-of-bounds elements, clipped headings/control text, and narrow columns. Intentional scrolling inside the project map is excluded from page-overflow findings.

Visual review covers the homepage, project directory and profiles, imported project narratives, team biographies, contact/donation forms, history/map, financials, resource collections, internships, and the existing stories. Screenshots are review artifacts, not image-snapshot assertions.

## Corrections

- **Narrow-phone header:** reduced header-specific brand spacing and made the menu control nonshrinking so the header fits 320px without horizontal scrolling.
- **Long titles:** responsive type sizes and safe word wrapping prevent long project/place names from clipping at 320–390px.
- **Landscape navigation:** the expanded menu is constrained to the available viewport and scrolls so every link remains reachable. Site search also appears in the mobile menu when the desktop utility bar is hidden.
- **Tablet columns:** reading content and sidebars, and contact/donation columns, stack at 900px. Inputs retain usable sizing; related field pairs stay together where there is room.
- **Form controls:** text inputs, selects, and draft-preview textareas use at least 16px text, avoiding the small-control sizing that can trigger mobile focus zoom.
- **Cards:** project, story, history, and resource cards use consistent image frames and bottom-aligned labels/actions. Imported posters/documents use containment instead of being cropped as landscape photographs.
- **Project spacing:** reduced the gap between a project hero and its account so introductory information stays connected.
- **Imported prose:** bare inline text becomes paragraphs; long unformatted paragraphs split only at sentence boundaries. Text, links, and image sources remain preserved.
- **Media:** consecutive source images form responsive galleries; SDG references form wrapped groups. Real image dimensions are injected at build time to reserve space before loading.
- **Team:** portraits remain paired with the corresponding name, role, and complete biography in responsive cards. Shared closing copy stays outside those cards.
- **Source appendices:** historical donor acknowledgment text, where present in the imported record, is retained in a closed-by-default native details section instead of dominating the project narrative.

## Content boundaries

This is a presentation change. No original blog posts were imported, and no source JSON datasets or donation-provider settings were rewritten. `renderLegacyHtml()` sanitizes before arranging the safe DOM; layout-generated wrappers never authorize incoming scripts, attributes, or forms.

`reserveImageSpace()` only reads local assets beneath `public/images/`, caches their dimensions during the build, and never fetches remote images. Normal builds continue to be independent of the original website.

## Verification

- All-page scan: **880 observations, zero detected layout issues** after corrections.
- Browser regression cases: 320px navigation and long titles, landscape menu scrolling, 768px form/reading-column stacking, source galleries, declared image dimensions, team cards, and accessible acknowledgment expansion.
- Unit tests verify that formatting preserves the narrative text, source links, images, biography associations, and acknowledgment data.
- Existing page/accessibility, filtering, provider-handoff, migration-exclusion, and redirect checks continue to run.

Repeat the review with a built preview running:

```bash
LAYOUT_BASE_URL=http://127.0.0.1:4321 \
LAYOUT_REVIEW_DIR=/tmp/opencode/aef-layout-review \
npm run review:layouts
```

The automated scan uses Chromium. It complements visual review and does not claim exhaustive testing on every physical device or browser.

The review command exits unsuccessfully if it detects layout issues; inspect its JSON report for the affected routes and elements.
