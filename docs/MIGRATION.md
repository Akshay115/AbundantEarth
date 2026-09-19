# Non-blog website migration

## User scope

Restore missing original-site content and functionality, **without transferring the old blog articles**. The three existing stories and their source file remain unchanged. No second blog is created; `/blog/` points to `/stories/`.

## Inventory and coverage

Source review: September 18, 2026.

- 65 published WordPress pages, each classified in `migration-manifest.json`.
- 28 WordPress posts: metadata inventoried solely to enforce exclusions; no post bodies imported.
- 34 donation URLs: all mapped to a project/giving destination or historical campaign record.
- 98 original project-map/popup records, including 23 youth-prize entries. These are source records, not a count of distinct grants or projects; related initiatives may appear more than once.
- 74 records had recoverable source coordinates. The remaining records are still searchable and readable. When a filter selects only records without coordinates, the map explains this instead of inventing points.
- 13 additional project profiles; combined project directory: 19.
- 15 recovered resource/participation/campaign narrative pages plus 16 older campaign directory entries.
- 92 synchronized native redirects in Astro and Vercel.
- 224 recovered image sources, including partner marks and the original logo, recorded in the manifest. Local WebP copies allow offline builds.
- Output at delivery: 177 content/error pages plus 92 redirect documents.

## Explicit editorial exclusions

All 28 original WordPress blog/news posts remain unimported. The old long-form article pages and Larry Korn editorial/memorial page also remain on their original publisher’s site, linked as external resources rather than copied. The original `/articles/` container is not reproduced as an empty page-builder grid.

The current Stories section has exactly the original three stories. Tests enforce this migration scope and prevent an excluded source URL from appearing as an imported page.

## How content is recovered

`scripts/import-legacy.mjs` obtains public page content from the WordPress API. It classifies every page rather than blindly copying plugin/test pages. It preserves meaningful project descriptions nested in GiveWP content wrappers while removing payment controls, scripts, forms, tracking embeds, donor walls, event attributes, and page-builder markup.

The project/prize records come from the original map’s `.igm-map-content` elements and coordinate configuration. Their original labels, descriptions, imagery, years, and limited-record status are retained. The original annual lists are available under `/history/grants/`.

Video widgets and external iframes become ordinary platform links. Content is sanitized during import and again in `src/lib/legacy.ts` before static rendering. Empty links are removed; original SDG image references become readable, labeled UN goal links. New source text and images should always retain source/date/credit metadata.

## Current-source updates

- The donation page’s July 2026 update reports 200+ individual projects in 35+ countries. The new impact page explicitly identifies this source and explains that older footer figures still differ.
- The published 2026 team page lists Hannah Eckberg and Alexa Bernard. Its biographies replace the previously displayed historical roster.
- The source funding page explicitly says applications are closed. The new site reflects this and treats any contact as an inquiry, not an accepted grant application.
- The source donation page publishes `AbundantEarthEmail@gmail.com` and `702 Hiller Road, McKinleyville, CA 95519`. These are attributed to that page; no email was sent to test the mailbox.
- Eco-Designers’ current published account, including the 6,500+ reported reach and its campaign context, replaces the older project account. The three existing historical stories remain unchanged as requested.

## Giving and subscription status

The foundation publishes a Give Lively general widget and seven project checkout links. They are configured in `src/data/integrations.json`, with source records in `legacy-providers.json`. The general widget identifies Abundant Earth Foundation and offers one-time/monthly choices. The seven project widget endpoints responded successfully during read-only verification. No payment was made, no card data was entered, and no receipt or subscription was fabricated.

The one-time/monthly options hand off to the correct fund’s hosted page. Final amount and frequency must be selected/confirmed there. Projects without a published independent checkout do not fall back silently to the general fund.

The original Mailchimp form action and inferred hosted-form variant both returned HTTP 404. A broken upstream audience/signup page cannot be repaired with this repository alone. The new newsletter page explains the issue and offers a reviewable email inquiry. Set `PUBLIC_NEWSLETTER_URL` or `newsletterUrl` to a working foundation-controlled signup page when supplied.

## Remaining source/provider dependencies

1. **Newsletter:** owner must supply or repair the Mailchimp signup destination.
2. **Email/report delivery:** contact and impact forms prepare email drafts. The original impact page contains only a broken Forminator shortcode; its actual private form and submission records are not available from public content. A backend/mail provider or working hosted form is needed for direct submissions.
3. **Donor accounts:** historical GiveWP/PayPal credentials and transactions are not exposed by the public pages and were not copied. Donor-support pages direct visitors to their original provider/receipt.
4. **Legacy campaigns:** 16 campaign pages preserve verified titles and source references. Several source page requests time out or fail, and the public donation API exposes no body content. Detailed descriptions are not invented. The manifest records retrieval failures.
5. **Missing images:** four source images could not be retrieved (one 404, two 403s, one timeout in the recorded run). Broken image tags are removed from rendered content; successful images are local. No unrelated stock substitute is used.
6. **Map:** no coordinates were recovered for 24 records, including the youth entries. They remain available through the complete filtered list.
7. **Custom domain, CMS authorization, and current operational approvals:** remain owner-managed as described in OPERATIONS.md.

These dependencies do not prevent browsing the restored non-blog content. They are not described as completed integrations.

## Validation and maintenance

- Build validation checks every generated local link/anchor, project/story references, every inventoried page/campaign target, redirect parity, and blog exclusions.
- Unit tests cover safe HTML rendering, content retained inside old donation wrappers, inventory coverage, and fund/frequency routing.
- Browser tests exercise desktop/mobile layouts and accessibility, restored pages, search, map filtering/zoom, historical donation redirects, donor-support behavior, and safe email/provider handoffs.
- Rerunning the importer is a source refresh, not a no-op: review changes to generated JSON, media, and redirects before committing.
- Deployment remains GitHub-backed through Vercel. No local source upload is used.
