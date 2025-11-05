import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: 'test-example.spec.ts',
  
  reporter: [
    ['list'],
    // Use local dist build for testing
    ['./dist/index.js', {
      outputDir: './test-results/reports',
      outputFile: 'enhanced-report.html',
      title: 'Playwright Enhanced Reporter v2.0 - Demo Report',
      includeCharts: true,
      includeTrends: true,
      openReport: true,
      theme: 'auto'
    }]
  ],

  use: {
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
  },

  // Enable retries to demonstrate flaky test feature
  retries: 1,

  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
      },
    },
  ],
});
