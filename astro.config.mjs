// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from './src/config/site.ts';

export default defineConfig({
  site: siteConfig.url,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: undefined,
      priority: undefined,
      lastmod: new Date(siteConfig.lastUpdated),
      serialize(item) {
        return {
          url: item.url.endsWith('/') ? item.url : `${item.url}/`,
          lastmod: item.lastmod,
        };
      },
    }),
  ],
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/js-yaml')) return 'vendor-yaml';
            if (id.includes('node_modules/papaparse')) return 'vendor-csv';
            if (id.includes('node_modules/fast-xml-parser')) return 'vendor-xml';
            if (id.includes('node_modules/smol-toml')) return 'vendor-toml';
            if (id.includes('node_modules/marked')) return 'vendor-md';
            if (id.includes('node_modules/ag-psd')) return 'vendor-psd';
            if (id.includes('node_modules/heic2any')) return 'vendor-heic';
            if (id.includes('node_modules/pdfjs-dist')) return 'vendor-pdf';
            if (id.includes('node_modules/three')) return 'vendor-three';
          },
        },
      },
    },
  },
});
