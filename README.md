# Abundant Earth Foundation

A researched, responsive redesign of **abundantearthfoundation.org**, built around local leadership, regenerative growing, and community resilience.

**Hosted site:** [abundant-earth.vercel.app](https://abundant-earth.vercel.app/)

**Status:** deployed on Vercel directly from this GitHub repository. Pushes to `main` trigger production deployments. The non-blog migration restores the original project/resource content and official Give Lively handoffs. The site remains a non-indexable redesign preview; the foundation’s custom domain has not been connected. The original Mailchimp signup endpoint currently returns 404 and needs an owner-supplied replacement.

**Blog instruction:** the old website’s **28 blog posts were not transferred**. The three existing editorial stories and their URLs remain unchanged. `/blog/` redirects to that existing Stories section; a second blog was not created.

![Abundant Earth Foundation homepage](docs/screenshots/home-desktop.webp)

## What is included

- An editorial homepage with a warm green-and-cream design, responsive typography, and locally hosted project photography.
- **177 pages** (including the custom 404): 18 project profiles, 98 project/prize history records, the three existing stories, resource collections, internships, campaigns, impact, financials, and participation pages.
- **12 additional project profiles** including Ecoversities, Ancient Cacao, Clean Cooking with Comics, ReGenerOsa, Rooted Connections, Love Letters, SunRise Studios, Mothers of the Amazon, Tiny Gardens, Deeper Roots, REAP, and Seaworthy Collective.
- The original youth-prize program and **23 recipient records**, original year-by-year grant lists, podcast/video collections, and two newsletter-archive entry points.
- An interactive history map with **74 recovered source coordinates**, zoom/reset, record-type/year/search filters, and a complete list for records without coordinates. No project coordinates are invented.
- Site-wide search across projects, resource pages, existing stories, and historical records.
- A project directory split into **Current Projects** and **Past Projects** sections. To move a project, change its `section` field (`current` or `past`) in `src/data/projects.json` or `src/data/legacy-projects.json` (or via Pages CMS). There is no search or filter bar.
- Source-published Give Lively links for general giving and **seven project campaigns**. Donors confirm amount and frequency on the provider’s page; unconfigured projects retain a giving inquiry.
- A newsletter-provider handoff and accessible contact, volunteering, sponsorship, and project-support inquiry helpers.
- Honest integration states: unconfigured providers offer email inquiries; email drafts are reviewed and sent by the visitor. No simulated payments, submitted messages, or subscriptions.
- **92 legacy redirects**, covering all 34 inventoried donation URLs and the non-blog page migration. Duplicate/plugin account routes lead to relevant support pages rather than simulated accounts or successful payments.
- Updated source-attributed reach (200+ projects / 35+ countries), current published team biographies, contact details, closed funding-application status, 11 partner marks, and recovered source photography.
- Search metadata, canonical URLs, NGO structured data, a sitemap, and environment-controlled indexing.
- Keyboard navigation, reduced-motion support, meaningful image descriptions, native form validation, and no-JavaScript alternatives.
- A [Pages CMS](https://pagescms.org/) configuration for Git-based editing of projects, stories, foundation settings, impact, and public provider links.
- GitHub Actions checks and downloadable static-build artifacts.

### Original foundation branding

The header and footer use the **original Abundant Earth Foundation logo** recovered from the old website’s media library. Favicons use the separately published **blue-and-green spiral/leaf symbol only, with no lettering**.

- Logo: `public/images/brand/logo.png` (trimmed from the original high-resolution wordmark).
- Symbol: `public/images/brand/symbol.png` (original symbol-only artwork).
- Browser icons: `favicon.svg`, 16px/32px PNGs, and `favicon.ico`.
- Apple touch icon: `apple-touch-icon.png`, also symbol-only.
- Original source URLs and logo dimensions: `src/data/brand.json`.

Use `npm run branding` to regenerate these assets from the original source images. This maintenance command requires network access; ordinary builds use the committed local files. Favicon links include a version parameter so browsers can refresh the previous icon.

### Layout review

Reviewed all **176 content pages at 320, 390, 768, 1024, and 1440px** (880 page/width checks), with visual review of the shared page layouts. The revised build has no detected page overflow, clipped text, or undersized columns in that review.

Corrections include a narrow-phone header that fits the screen, wrapping long titles, a scrollable landscape menu, tablet-friendly reading/form columns, consistent card alignment and image frames, readable source paragraphs and galleries, paired team portraits/biographies, and declared image dimensions to reserve space before images load. Historical donor acknowledgments are retained in a collapsible source appendix.

The source datasets, existing stories, and donation destinations are unchanged by the layout pass. See [layout review and verification](docs/LAYOUTS.md).

## Run locally

Use **Node.js 24 LTS** for development, tests, and deployment. Astro’s minimum runtime is 22.12; the test suite uses Node 24’s native TypeScript support.

```bash
npm ci
npm run dev
```

Open the URL printed by Astro, normally `http://localhost:4321`.

To test the production output:

```bash
npm run build
npm run preview
```

Astro 7 may start a background server when run by an agent. Use `npx astro preview status`, `npx astro preview logs`, or `npx astro preview stop` to manage it. The browser-test server runs separately on port **4322** in the foreground.

## Verification

```bash
npm run check
npm run test:unit
npm run build
npx playwright install chromium
npm test
npm run test:providers
npm audit
```

On Linux CI, install browser dependencies with `npx playwright install --with-deps chromium`.

The verification suite includes:

| Check | Coverage |
|---|---|
| Astro/TypeScript | Templates, browser scripts, and test configuration |
| Build verification | All generated local links and anchors, project/story references, required metadata, provider URL validation, and legacy redirect targets |
| 190 browser checks | Desktop/mobile page rendering and WCAG A/AA scans, imported resource/project pages, map filters and zoom, site search, article exclusions, form validation, navigation, 404s, images, no-JavaScript alternatives, narrow-phone/landscape layouts, and tablet stacking |
| 6 provider-handoff checks | One-time and monthly checkout navigation, newsletter handoff, and protection against routing a project-specific gift to the general fund |
| 12 unit checks | Provider routing, unsafe URL rejection, email encoding, HTML sanitization, migration inventory, blog exclusions, source-content preservation, portrait/biography grouping, and image dimensions |

`test:providers` builds with reserved `example.org` fixture URLs, intercepts those navigations locally, and **restores the normal build in a `finally` block**. It does not contact a payment provider or submit personal information. Do not run it concurrently with another build.

Automated accessibility results are not a claim of formal accessibility certification. Manually review keyboard use, zoom, screen-reader experience, and any connected external providers before launch.

To repeat the all-page layout scan against a running built preview:

```bash
npm run build
npm run preview
npm run review:layouts
```

The review writes screenshots and a JSON report to `/tmp/opencode/aef-layout-review`, not into the repository. Override the server URL or output directory with `LAYOUT_BASE_URL` and `LAYOUT_REVIEW_DIR`.

## Content editing

Core content is separated from page templates:

| File | Purpose |
|---|---|
| `src/data/site.json` | Mission description, public contact address, social links, historical reach, and application status |
| `src/data/brand.json` | Original logo/symbol provenance, local asset paths, and intrinsic logo dimensions |
| `src/data/projects.json` | Project profiles, country/theme filters, outcome attribution, sources, and captions |
| `src/data/stories.json` | Editorial stories and related project references |
| `src/data/legacy-projects.json` | The 12 recovered standalone project accounts |
| `src/data/legacy-history.json` | 98 original map/project/prize records and recovered coordinates |
| `src/data/legacy-pages.json` | Resources, internships, source terms, and historical campaign entries |
| `src/data/source-pages.json` | Source records used to refresh existing pages and annual lists |
| `src/data/legacy-providers.json` | Original published provider links and newsletter endpoint provenance |
| `docs/migration-manifest.json` | Decisions for every inventoried old page/donation URL, blog exclusions, image sources, and failed fetches |
| `src/data/participation.json` | Volunteer, partnership, and fiscal-sponsorship copy |
| `src/data/integrations.json` | Public, verified hosted checkout and newsletter URLs |
| `src/data/redirects.json` | Old-to-new URL mappings |
| `vercel.json` | Vercel build settings, HTTP 301 redirects, trailing-slash routing, and response headers |
| `src/pages/financials.astro` | Year-specific public financial records |
| `src/styles/global.css` | Shared design system and responsive rules |
| `src/styles/migration.css` | Imported-content, map, search, and partner styles |

For a browser-based editor, authorize the repository in [Pages CMS](https://app.pagescms.org/). It reads `.pages.yml` from the selected branch and saves content changes as Git commits. This configuration is included; the external CMS account/GitHub authorization is **not provisioned by this repository**.

Keep project slugs stable. When changing a slug, update story references and add a legacy redirect in both `src/data/redirects.json` and `vercel.json`. Build checks enforce redirect parity and catch missing references and images. Keep figures, reporting dates, and source notes together; never substitute partner-wide results for AEF-attributable results.

Original curated image fields use an **image family name** such as `food-forest`, `education`, or `gardens`. A family has 480/960/1600 WebP variants in `public/images/`. Recovered images use local `/images/legacy/*.webp` paths and can be selected through the recovered-project CMS editor. Regenerate the original image families with:

```bash
npm run media
# Or just one family:
npm run media -- education
```

These commands require network access; normal builds use committed assets. The curated TGE thumbnail is displayed at its native size; additional source images are available inside the recovered project account. See [content and asset notes](docs/CONTENT.md).

### Reproduce or refresh the non-blog import

```bash
npm run import:legacy
```

This fetches public WordPress pages, project-map records, donation metadata, and source images. It only requests post **metadata** to record exclusions; it never imports post bodies or edits `stories.json`. Long-form editorial pages (Biomimicry, Resilience, Bee the Change, and Larry Korn) are likewise left on the original site.

The command regenerates the `legacy-*.json` datasets, `source-pages.json`, the migration manifest, local source images, the public-domain base map, and synchronized redirects. **Review its diff before committing:** rerunning it can replace manual edits to those generated datasets. Imported HTML is sanitized again during the build. Source scripts, embedded forms, events, tracking embeds, donor walls, and obsolete plugin UI are not executed or copied as working features.

See [migration notes and remaining dependencies](docs/MIGRATION.md). Some original campaign pages are title-only or inaccessible; those are documented historical records, not reconstructed fundraising systems.

## Connect giving and newsletter services

Use `.env.example` as a reference for an ignored local `.env` or set the values in your hosting provider. **Only public URLs belong in these settings; no secret API keys are needed for hosted checkout.**

```dotenv
SITE_URL=https://abundantearthfoundation.org
PUBLIC_SITE_LIVE=false
PUBLIC_DONATION_URL=
PUBLIC_MONTHLY_DONATION_URL=
PUBLIC_NEWSLETTER_URL=
```

Alternatively, edit the corresponding fields in `src/data/integrations.json` / Pages CMS. Nonempty environment values take precedence. The file now includes the foundation’s published Give Lively general and seven project URLs. One-time/monthly choices use the same hosted page where appropriate; the visitor must confirm frequency there.

For a project-specific provider page, add an entry to `projectDonationUrls`:

```json
{
  "slug": "agroforestry-regeneration-communities",
  "oneTimeUrl": "https://YOUR-VERIFIED-PROVIDER/PROJECT-CHECKOUT",
  "monthlyUrl": "https://YOUR-VERIFIED-PROVIDER/PROJECT-MONTHLY-CHECKOUT"
}
```

Replace those illustrative URLs with actual foundation-controlled provider links. Leave unavailable options empty. Validate the receiving organization, fund, frequency, receipts, and cancellation process at the provider before publishing the link.

The site does not append guessed Stripe/PayPal parameters, create charges, or claim a successful payment. Donors choose the amount and confirm the final designation on the provider’s page. An unconfigured project checkout **never falls back silently to a general donation**.

The published Mailchimp endpoint and its hosted signup variant both returned **HTTP 404** during verification. `newsletterUrl` remains empty, and the page explains the upstream failure and provides an email inquiry. Supplying a working hosted signup URL enables the provider handoff. No fake subscription success is shown.

Contact and impact-report helpers prepare an email for the visitor to send; there is no inbox backend. The original Individual Impact Report page exposes only a broken shortcode, so its private form definition cannot be recovered. Historical donor dashboards/history routes point to donor support; donor credentials, transactions, and recurring agreements are not migrated.

## Vercel deployment — GitHub-backed

| Setting | Value |
|---|---|
| Public URL | https://abundant-earth.vercel.app/ |
| Dashboard | https://vercel.com/lyvena/abundant-earth |
| Vercel team / project | `lyvena` / `abundant-earth` |
| Project ID | `prj_x8NY9lrCNIvxBE9A7ynM4jiglixi` |
| GitHub repository | `Akshay115/AbundantEarth` |
| Production branch | `main` |
| Framework / runtime | Astro / Node.js 24.x |
| Install / build / output | `npm ci` / `npm run build` / `dist` |
| Canonical origin (`SITE_URL`) | `https://abundant-earth.vercel.app` |
| Indexing (`PUBLIC_SITE_LIVE`) | `false` in production and preview |

The Vercel CLI was used to create the project, connect the GitHub repository, configure settings, and request the initial deployment through `vercel api /v13/deployments` with a **GitHub `gitSource`**. Vercel fetched commit `e2de311a855adb7cb3f5c8382f6fac43090343e3` from GitHub for that first deployment. No local source upload or prebuilt deployment was used.

### Publish updates

Commit and push changes to GitHub. Vercel’s native Git integration builds `main` into the public project URL, and other branches receive preview deployments. GitHub Actions runs checks separately; it does not upload the production site. Vercel publication is not gated on completion of that separate workflow.

To inspect or reconnect this existing project from another checkout:

```bash
vercel link --yes --scope lyvena --project abundant-earth
vercel git connect https://github.com/Akshay115/AbundantEarth --scope lyvena
vercel list abundant-earth --scope lyvena
vercel inspect https://abundant-earth.vercel.app --scope lyvena
```

Keep deployment source in GitHub: publish via Git pushes rather than `vercel deploy`, `vercel --prod`, or `vercel deploy --prebuilt`. Local `.vercel/` and `.env*` credentials are ignored and must not be committed.

`vercel.json` supplies native HTTP 301 redirects, preserves project-specific donation destinations, keeps trailing slashes consistent with Astro, and supplies response headers. The build verifies parity with `src/data/redirects.json`. Unknown paths return the custom `404.html` with HTTP 404. `_redirects` and `_headers` are still generated for other compatible static hosts.

### Move to the foundation’s domain

Connect the approved custom domain in Vercel, update its DNS, and change `SITE_URL` to that canonical origin. Complete the remaining provider/content items in [operations](docs/OPERATIONS.md). When the foundation is ready for indexing, set `PUBLIC_SITE_LIVE=true` for production only and trigger a fresh Git-backed deployment. Keep preview environments non-indexable.

This deployment connects public donation handoffs, not payment-account administration. Newsletter account repair, external CMS authorization, and the foundation’s DNS remain owner tasks.

## Research and editorial basis

The original site was unavailable during the first research pass, which used 2025 Wayback captures and a January 2022 funding page. It became accessible during the follow-up inventory. The non-blog migration was recovered from its public API, current pages, map data, and sitemap on September 18, 2026. Public records also come from ProPublica and partner materials from ARC and Eco-Designers.

The new site explicitly dates historical figures and team roles, distinguishes plans from outcomes, and links to source materials. Stories are editorial summaries of the archive, not invented interviews or fresh reporting.

- [Research and design decisions](docs/RESEARCH.md)
- [Content and photography provenance](docs/CONTENT.md)
- [Launch, maintenance, and recovery](docs/OPERATIONS.md)
- [Non-blog migration and outstanding dependencies](docs/MIGRATION.md)

Project photographs and source materials remain the property of their respective rights holders. This repository does not grant a new license to third-party assets. Confirm reuse permissions before public release.
