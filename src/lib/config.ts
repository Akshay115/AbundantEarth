import settings from '../data/integrations.json';
import { httpsUrl } from './integrations.mjs';
export const donationUrl = httpsUrl(import.meta.env.PUBLIC_DONATION_URL || settings.donationUrl, 'Donation URL');
export const monthlyDonationUrl = httpsUrl(import.meta.env.PUBLIC_MONTHLY_DONATION_URL || settings.monthlyDonationUrl, 'Monthly donation URL');
export const newsletterUrl = httpsUrl(import.meta.env.PUBLIC_NEWSLETTER_URL || settings.newsletterUrl, 'Newsletter URL');
export const projectDonationUrls = (settings.projectDonationUrls as { slug: string; oneTimeUrl: string; monthlyUrl: string }[]).map(item => ({
  slug: item.slug,
  oneTimeUrl: httpsUrl(item.oneTimeUrl, `${item.slug} donation URL`),
  monthlyUrl: httpsUrl(item.monthlyUrl, `${item.slug} monthly donation URL`),
}));
