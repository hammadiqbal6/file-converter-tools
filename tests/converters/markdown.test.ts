import { describe, expect, it } from 'vitest';
import { markdownToHtml } from '../../src/lib/converters/markdown-html';

describe('markdown-html', () => {
  it('renders heading', async () => {
    const html = await markdownToHtml('# Hello');
    expect(html).toContain('<h1>Hello</h1>');
  });
});
