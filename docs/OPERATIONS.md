# Launch and maintenance

## Current deployment state

The code builds static files in `dist/` and is deployed at **https://abundant-earth.vercel.app/** through Vercel’s GitHub integration. The project is `lyvena/abundant-earth` (`prj_x8NY9lrCNIvxBE9A7ynM4jiglixi`), connected to `Akshay115/AbundantEarth`, with `main` as its production branch.

The first deployment was requested using the Vercel CLI’s API command with a GitHub `gitSource`, pinned to commit `e2de311a855adb7cb3f5c8382f6fac43090343e3`; the ready deployment ID is `dpl_GKcFo6dTfZoZvrzWHEUbtemBZFrg`. Subsequent pushes are built by the native Git integration. No local source files or prebuilt output were uploaded for deployment.

`SITE_URL=https://abundant-earth.vercel.app` and `PUBLIC_SITE_LIVE=false` are configured for Vercel production and preview. The hosted redesign is non-indexable, includes a preview footer, and disallows crawling. Public Give Lively handoffs are now connected for general giving and seven source-published project campaigns. The foundation’s custom domain and a working newsletter signup destination remain to be connected. See [non-blog migration notes](MIGRATION.md).

`PUBLIC_SITE_LIVE=true` is a publication control, not authentication. Anyone with a preview URL can still access it. Use the hosting provider’s access controls if a private review is required.

## Required owner inputs

1. Custom-domain/DNS access when moving from the Vercel URL to the foundation’s domain.
2. Any additional project-specific donation destinations; the seven recovered Give Lively routes are already configured. Confirm amount/frequency and receipts at the provider.
3. A working hosted newsletter signup URL; the original Mailchimp endpoint returned HTTP 404.
4. Current contact-mailbox availability, leadership roster, project status, and application availability.
5. Approved brand treatment and photography reuse permissions, and replacements for source images that could not be recovered.
6. Actual provider identities and information-retention arrangements for the privacy page.

Do not collect a donation into a developer’s account or infer payment ownership from a historical URL. The implemented handoff only uses explicitly configured public URLs.

## Deployment procedure

1. Run the README’s verification commands against the final content.
2. Use the existing Vercel project’s Git connection; push to `main` for production or another branch for a preview.
3. Use Node 24, `npm ci` for installation, `npm run build` for building, and `dist/` as the publication directory.
4. Set provider URLs and `SITE_URL`. Keep `PUBLIC_SITE_LIVE=false` on preview deployments.
5. Check preview content, keyboard navigation, mobile pages, and project-specific giving selections.
6. When launching on the approved custom domain, set `PUBLIC_SITE_LIVE=true` for production only, update `SITE_URL`, connect the root domain, and trigger a fresh Git-backed deployment.
7. Verify response headers, canonical origin, sitemap, robots rules, 404 status, and actual HTTP 301 rules.
8. Follow provider sandbox/testing guidance to verify payment receipts, monthly cancellation, and newsletter confirmation without making an unintended real charge.

Vercel serves native HTTP 301s from `vercel.json`; the build verifies that these match `src/data/redirects.json`. Astro also emits meta-refresh fallbacks, and `scripts/verify-build.mjs` emits `_redirects` for other compatible hosts. `#team` is a client fragment; donation query strings are part of the redirect target and must survive.

Avoid a catch-all SPA rewrite. This is a multi-page static website, and unknown paths should return `404.html` with HTTP 404.

## Release workflow

- Content and code changes are versioned in Git.
- GitHub Actions runs on pushes, pull requests, and manual dispatch, across branches.
- CI performs type checks, unit tests, build/link verification, browser/accessibility checks, and configured-provider handoff tests.
- The static-site artifact is available from successful Actions runs. It is a default preview build unless production variables are explicitly provided in a deployment pipeline.
- Vercel’s native Git integration publishes pushes independently of GitHub Actions. `main` deploys to the production alias; other branches produce previews. Publication is not gated on the separate Actions checks.
- Use `vercel list abundant-earth --scope lyvena` and `vercel inspect DEPLOYMENT_URL --scope lyvena` to inspect builds. Deployment metadata should identify the GitHub repository, branch, and expected commit SHA.
- Keep deployment Git-backed. Do not publish this project with local-source `vercel deploy` or `--prebuilt` commands.
- The initial requested delivery checks all remote branches. At implementation time the remote had only `main`; future branches do not need to be kept identical automatically.

## Routine maintenance

### On every content update

- Keep source, reporting period, and attribution with each figure.
- Do not label a funded plan as a completed result without a follow-up report.
- Preserve old slugs with redirects.
- Review meaningful alt text and captions when changing images.
- Rebuild and check the actual published page after the deployment completes.

### Monthly

- Check the homepage, contact address, newsletter signup, and donation destinations.
- Check external project links and application availability.
- Review pending project updates and records that need current confirmation.
- Check dependencies with `npm audit`; apply updates through the test suite.
- Retain a copy of original approved photos and the original WordPress export outside the source-code repository.

### Annually

- Add the most recent publicly available filing and review the financial summary.
- Review leadership roles and organizational information.
- Refresh dated impact reports with project leaders; reconcile foundation-level and partner-level numbers.

## Monitoring and backups

Configure an external uptime monitor for `https://abundant-earth.vercel.app/`, `/donate/`, and any selected provider links. Update the monitor when a custom domain is connected. Assign an owner and notification address. This repository does not provision a monitoring account or send alerts.

GitHub provides version history, but maintain an independent repository backup and the original source media. Record domain registrar, DNS, hosting, CMS, payment-provider, and newsletter ownership in the foundation’s password manager, not in this repository.

## Recovery

1. Identify the last successful deployment and its Git commit.
2. Use the host’s rollback mechanism to restore that artifact.
3. If rebuilding is necessary, request a Vercel Git-source deployment of the known-good GitHub commit, or make a forward revert commit and push it. Local builds may be used for diagnosis but are not uploaded as deployments.
4. Verify inbound project-donation URLs and integration destinations after recovery.
5. Correct the issue in a normal forward commit; do not force-push shared history to perform a rollback.

## Analytics and outcomes

No visitor analytics service is installed. Once the foundation selects one, define success around completed provider-confirmed donations, recurring support, confirmed subscribers, and qualified project inquiries. Configure receipt/conversion reporting at the actual provider; a button click is not a completed donation.

Any future analytics or form-delivery integration needs an updated privacy disclosure and appropriate handling of personal information. Do not put contact text, email addresses, or payment details into analytics events.
