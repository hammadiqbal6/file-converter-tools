/**
 * Site-wide configuration. Prefer PUBLIC_* env overrides at build time
 * (Cloudflare Workers Builds / CI). Fallbacks match the live workers.dev origin
 * so sitemap/canonicals never bake example.com when env is unset.
 */

/** Canonical origin when PUBLIC_SITE_URL is unset (Workers.dev deploy). */
export const DEFAULT_SITE_URL =
  'https://file-converter-tools.hammadiqbal117.workers.dev';

/** Public contact when PUBLIC_CONTACT_EMAIL is unset. */
const DEFAULT_CONTACT_EMAIL = 'hammadiqbal117@gmail.com';

/**
 * GSC HTML-tag verification already live on this property.
 * Prefer PUBLIC_GSC_VERIFICATION; keep alias for older Workers Builds configs.
 */
const DEFAULT_GSC_VERIFICATION = '0-q_NxhBgfgCm4WOLfbe9VrHrjbLzaxh8SXsbo2Q-UU';

/** GA4 measurement ID already live on this Worker. Empty env keeps this default. */
const DEFAULT_GA4_MEASUREMENT_ID = 'G-L73MEN86ZY';

/**
 * IndexNow key (also place matching file at public/<key>.txt — root, not a folder).
 * Override with PUBLIC_INDEXNOW_KEY or INDEXNOW_KEY.
 */
export const DEFAULT_INDEXNOW_KEY = 'e0d80dcb289204f10564144f215e4a8e';

/**
 * Stable Person @id shared across sister tool sites so Google can tie authorship
 * to one entity. GitHub profile is the canonical cross-site id.
 */
export const CANONICAL_PERSON_ID = 'https://github.com/hammadiqbal6#person';

/** Public profiles for Person.sameAs (real profiles only). */
export const AUTHOR_SAME_AS = ['https://github.com/hammadiqbal6'] as const;

/** Bylines when PUBLIC_AUTHOR_NAME is unset — named maintainer. */
export const DEFAULT_AUTHOR_NAME = 'Hammad';

/** Full display name for authors page / schema name. */
export const DEFAULT_AUTHOR_FULL_NAME = 'Hammad Iqbal';

/** Role label when PUBLIC_AUTHOR_ROLE is unset. */
export const DEFAULT_AUTHOR_ROLE = 'Site maintainer';

/**
 * Honest default bio when PUBLIC_AUTHOR_BIO is unset.
 * No invented credentials.
 */
export const DEFAULT_AUTHOR_BIO =
  'I build and maintain LocalFile Convert as an independent developer. Converters run entirely in the browser; I document real format limits, cite specs (YAML, JSON, TOML, PDF, STL, image formats), and keep fixtures honest. I do not claim to replace vendor software for production CAD, print, or finance workflows.';

/**
 * Read a PUBLIC_* / build env var from Vite/Astro (`import.meta.env`) or Node
 * (`process.env`). Empty/whitespace → ''.
 */
function readEnv(key: string): string {
  let fromMeta = '';
  try {
    const env = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env;
    const v = env?.[key];
    if (typeof v === 'string') fromMeta = v;
  } catch {
    /* plain Node import (e.g. astro.config) may lack import.meta.env */
  }
  const fromProcess =
    typeof process !== 'undefined' && process.env ? String(process.env[key] ?? '') : '';
  return (fromMeta || fromProcess).trim();
}

function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.replace(/\/+$/, '');
  if (!trimmed) return DEFAULT_SITE_URL;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return DEFAULT_SITE_URL;
    return `${u.protocol}//${u.host}`;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

const siteUrl = normalizeSiteUrl(readEnv('PUBLIC_SITE_URL') || DEFAULT_SITE_URL);

export const siteConfig = {
  /** Public site name shown in UI, titles, and schema */
  name: 'LocalFile Convert',
  /** Short tagline */
  tagline: 'Private, in-browser file converters. Your files never leave your device.',
  /**
   * Canonical origin including protocol, no trailing slash.
   * Override with PUBLIC_SITE_URL.
   */
  url: siteUrl,
  /** Primary locale */
  locale: 'en_US',
  /**
   * Public contact email (Contact, Privacy, Terms, footer, Organization schema).
   * Override with PUBLIC_CONTACT_EMAIL.
   */
  contactEmail: readEnv('PUBLIC_CONTACT_EMAIL') || DEFAULT_CONTACT_EMAIL,
  /** Twitter/X handle without @ (optional) */
  twitterHandle: '',
  /** Organization legal / display name */
  organizationName: 'LocalFile Convert',
  /** Named author for E-E-A-T bylines (visible “Hammad” on tool pages) */
  defaultAuthor: {
    name: readEnv('PUBLIC_AUTHOR_NAME') || DEFAULT_AUTHOR_NAME,
    fullName: readEnv('PUBLIC_AUTHOR_FULL_NAME') || DEFAULT_AUTHOR_FULL_NAME,
    role: readEnv('PUBLIC_AUTHOR_ROLE') || DEFAULT_AUTHOR_ROLE,
    bio: readEnv('PUBLIC_AUTHOR_BIO') || DEFAULT_AUTHOR_BIO,
  },
  /** Stable Person @id (cross-site) */
  personId: CANONICAL_PERSON_ID,
  /** Person.sameAs profiles */
  authorSameAs: AUTHOR_SAME_AS,
  /** Google AdSense publisher ID — leave empty to disable ads */
  adsensePublisherId: readEnv('PUBLIC_ADSENSE_PUBLISHER_ID') || '',
  /** Enable Auto ads when publisher ID is set */
  adsenseAutoAds: false,
  /** GA4 measurement ID — leave empty via env to disable (default is live ID) */
  ga4MeasurementId: readEnv('PUBLIC_GA4_MEASUREMENT_ID') || DEFAULT_GA4_MEASUREMENT_ID,
  /**
   * Google Search Console HTML tag content (meta verification).
   * Prefer PUBLIC_GSC_VERIFICATION; PUBLIC_GOOGLE_SITE_VERIFICATION is a legacy alias.
   */
  gscVerification:
    readEnv('PUBLIC_GSC_VERIFICATION') ||
    readEnv('PUBLIC_GOOGLE_SITE_VERIFICATION') ||
    DEFAULT_GSC_VERIFICATION,
  /** Bing Webmaster verification */
  bingVerification:
    readEnv('PUBLIC_BING_VERIFICATION') || readEnv('PUBLIC_BING_SITE_VERIFICATION') || '',
  /** IndexNow key (also place public/<key>.txt) */
  indexNowKey:
    readEnv('PUBLIC_INDEXNOW_KEY') || readEnv('INDEXNOW_KEY') || DEFAULT_INDEXNOW_KEY,
  /** Default OG image path (absolute URL built from url + path; no trailing slash) */
  defaultOgImage: '/og-default.png',
  /** Theme color for manifest / browser chrome */
  themeColor: '#0f3d3e',
  /** Last content refresh stamp for homepage */
  lastUpdated: '2026-10-23',
  /** ISO build/content date used in bylines when a page omits its own */
  buildDate: '2026-10-23',
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Absolute URL helper.
 * Preserves the path as given (including trailing slash for HTML pages).
 * Does NOT append a trailing slash — file assets like /og-default.png must stay slash-free.
 */
export function absoluteUrl(path = '/'): string {
  const base = siteConfig.url.replace(/\/$/, '');
  if (!path || path === '/') return `${base}/`;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
