/**
 * Site-wide configuration. Fill in placeholders before launch.
 * Env vars override these at build time when set.
 */
export const siteConfig = {
  /** Public site name shown in UI, titles, and schema */
  name: 'LocalFile Convert',
  /** Short tagline */
  tagline: 'Private, in-browser file converters. Your files never leave your device.',
  /**
   * Canonical origin including protocol, no trailing slash.
   * Override with PUBLIC_SITE_URL.
   */
  url: (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SITE_URL) || 'https://example.com',
  /** Primary locale */
  locale: 'en_US',
  /**
   * Public contact email (Contact, Privacy, Terms, footer, Organization schema).
   * Override with PUBLIC_CONTACT_EMAIL.
   */
  contactEmail:
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_CONTACT_EMAIL) ||
    'hammadiqbal117@gmail.com',
  /** Twitter/X handle without @ (optional) */
  twitterHandle: '',
  /** Organization legal / display name */
  organizationName: 'LocalFile Convert',
  /** Placeholder author for E-E-A-T bylines */
  defaultAuthor: {
    name: 'Editorial Team',
    role: 'Tools & Documentation',
  },
  /** Google AdSense publisher ID — leave empty to disable ads */
  adsensePublisherId:
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_ADSENSE_PUBLISHER_ID) || '',
  /** Enable Auto ads when publisher ID is set */
  adsenseAutoAds: false,
  /** GA4 measurement ID — leave empty to disable */
  ga4MeasurementId:
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_GA4_MEASUREMENT_ID) || '',
  /** Google Search Console HTML tag content (meta verification) */
  gscVerification:
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_GSC_VERIFICATION) || '',
  /** Bing Webmaster verification */
  bingVerification:
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_BING_VERIFICATION) || '',
  /** IndexNow key (also place public/indexnow/<key>.txt) */
  indexNowKey:
    (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_INDEXNOW_KEY) ||
    '00000000000000000000000000000000',
  /** Default OG image path (absolute URL built from url + path) */
  defaultOgImage: '/og-default.png',
  /** Theme color for manifest / browser chrome */
  themeColor: '#0f3d3e',
  /** Last content refresh stamp for homepage */
  lastUpdated: '2026-10-19',
} as const;

export type SiteConfig = typeof siteConfig;

/** Absolute URL helper */
export function absoluteUrl(path = '/'): string {
  const base = siteConfig.url.replace(/\/$/, '');
  if (!path || path === '/') return `${base}/`;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p.endsWith('/') ? p : `${p}/`}`;
}
