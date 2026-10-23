import { describe, expect, it } from 'vitest';
import {
  CANONICAL_PERSON_ID,
  DEFAULT_INDEXNOW_KEY,
  DEFAULT_SITE_URL,
  absoluteUrl,
  siteConfig,
} from '../src/config/site';

describe('site SEO defaults', () => {
  it('defaults to the live workers.dev origin, not example.com', () => {
    expect(DEFAULT_SITE_URL).toBe(
      'https://file-converter-tools.hammadiqbal117.workers.dev',
    );
    expect(DEFAULT_SITE_URL).not.toContain('example.com');
    expect(siteConfig.url).not.toContain('example.com');
    expect(siteConfig.url.replace(/\/$/, '')).toBe(DEFAULT_SITE_URL);
  });

  it('exposes a stable Person @id and named Hammad author', () => {
    expect(CANONICAL_PERSON_ID).toBe('https://github.com/hammadiqbal6#person');
    expect(siteConfig.personId).toBe(CANONICAL_PERSON_ID);
    expect(siteConfig.defaultAuthor.name).toMatch(/Hammad/i);
  });

  it('uses a non-placeholder IndexNow key', () => {
    expect(DEFAULT_INDEXNOW_KEY).toMatch(/^[a-f0-9]{32}$/);
    expect(DEFAULT_INDEXNOW_KEY).not.toBe('00000000000000000000000000000000');
    expect(siteConfig.indexNowKey).toBe(DEFAULT_INDEXNOW_KEY);
  });

  it('absoluteUrl preserves trailing slash for pages and omits it for files', () => {
    expect(absoluteUrl('/')).toBe(`${DEFAULT_SITE_URL}/`);
    expect(absoluteUrl('/tools/yaml-to-json/')).toBe(
      `${DEFAULT_SITE_URL}/tools/yaml-to-json/`,
    );
    expect(absoluteUrl('/og-default.png')).toBe(`${DEFAULT_SITE_URL}/og-default.png`);
    expect(absoluteUrl(siteConfig.defaultOgImage)).not.toMatch(/\/$/);
  });
});
