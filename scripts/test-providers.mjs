import { spawnSync } from 'node:child_process';
import process from 'node:process';

// Reserved example.org destinations are intercepted by Playwright. No provider request is made.
function run(args, env = process.env) {
  const result = spawnSync('npm', args, { stdio: 'inherit', env });
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed`);
}
try {
  run(['run', 'build'], {
    ...process.env,
    PUBLIC_DONATION_URL: 'https://example.org/aef-once',
    PUBLIC_MONTHLY_DONATION_URL: 'https://example.org/aef-monthly',
    PUBLIC_NEWSLETTER_URL: 'https://example.org/aef-newsletter',
  });
  run(['exec', 'playwright', 'test', '--', '--config=playwright.providers.config.ts']);
} finally {
  // Always restore the operator’s normal output. Test provider URLs must not be shipped.
  run(['run', 'build']);
}
