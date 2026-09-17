# Launch and maintenance

## Current deployment state

The code builds static files in `dist/`. No public domain, hosting project, DNS change, payment account, or mailing list has been created. The default preview is `noindex, nofollow`, includes a preview footer, and disallows crawling in `robots.txt`.

`PUBLIC_SITE_LIVE=true` is a publication control, not authentication. Anyone with a preview URL can still access it. Use the hosting provider’s access controls if a private review is required.

## Required owner inputs

1. Hosting account/domain access and the intended canonical URL.
2. Approved one-time and monthly donation provider URLs, plus project-specific destinations where available.
3. A verified hosted newsletter signup URL with confirmation and unsubscribe handling.
4. Current contact-mailbox availability, leadership roster, project status, and application availability.
5. Approved brand treatment and photography reuse permissions; better TGE photography if available.
6. Actual provider identities and information-retention arrangements for the privacy page.

Do not collect a donation into a developer’s account or infer payment ownership from a historical URL. The implemented handoff only uses explicitly configured public URLs.

## Deployment procedure

1. Run the README’s verification commands against the final content.
2. Connect a static host to the repository, selecting the intended branch.
3. Use Node 24, `npm ci` for installation, `npm run build` for building, and `dist/` as the publication directory.
4. Set provider URLs and `SITE_URL`. Keep `PUBLIC_SITE_LIVE=false` on preview deployments.
5. Check preview content, keyboard navigation, mobile pages, and project-specific giving selections.
6. Set `PUBLIC_SITE_LIVE=true` for production only. Rebuild, connect the root domain, and enable HTTPS.
7. Verify response headers, canonical origin, sitemap, robots rules, 404 status, and actual HTTP 301 rules.
8. Follow provider sandbox/testing guidance to verify payment receipts, monthly cancellation, and newsletter confirmation without making an unintended real charge.

Astro emits meta-refresh pages for legacy routes. `scripts/verify-build.mjs` additionally emits `_redirects` for hosts that support it. Import `src/data/redirects.json` into the chosen host’s redirect configuration if necessary. `#team` is a client fragment; donation query strings are part of the redirect target and must survive.

Avoid a catch-all SPA rewrite. This is a multi-page static website, and unknown paths should return `404.html` with HTTP 404.

## Release workflow

- Content and code changes are versioned in Git.
- GitHub Actions runs on pushes, pull requests, and manual dispatch, across branches.
- CI performs type checks, unit tests, build/link verification, browser/accessibility checks, and configured-provider handoff tests.
- The static-site artifact is available from successful Actions runs. It is a default preview build unless production variables are explicitly provided in a deployment pipeline.
- Publishing is not wired into CI. Connect the hosting provider’s branch builds or add a deployment job after the hosting destination is selected.
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

After a host is chosen, configure an external uptime monitor for `/`, `/donate/`, and the selected provider links. Assign an owner and notification address. This repository does not provision a monitoring account or send alerts.

GitHub provides version history, but maintain an independent repository backup and the original source media. Record domain registrar, DNS, hosting, CMS, payment-provider, and newsletter ownership in the foundation’s password manager, not in this repository.

## Recovery

1. Identify the last successful deployment and its Git commit.
2. Use the host’s rollback mechanism to restore that artifact.
3. If rebuilding is necessary, check out the known-good revision in a separate worktree and run `npm ci && npm run build` with the correct production environment.
4. Verify inbound project-donation URLs and integration destinations after recovery.
5. Correct the issue in a normal forward commit; do not force-push shared history to perform a rollback.

## Analytics and outcomes

No visitor analytics service is installed. Once the foundation selects one, define success around completed provider-confirmed donations, recurring support, confirmed subscribers, and qualified project inquiries. Configure receipt/conversion reporting at the actual provider; a button click is not a completed donation.

Any future analytics or form-delivery integration needs an updated privacy disclosure and appropriate handling of personal information. Do not put contact text, email addresses, or payment details into analytics events.
