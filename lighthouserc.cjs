/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: [
        '/',
        '/category/data/',
        '/tools/yaml-to-json/',
        '/tools/psd-to-png/',
        '/tools/stl-to-obj/',
      ],
      numberOfRuns: 1,
      settings: {
        formFactor: 'mobile',
        screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2 },
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'total-blocking-time': ['error', { maxNumericValue: 150 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './artifacts/lighthouse' },
  },
};
