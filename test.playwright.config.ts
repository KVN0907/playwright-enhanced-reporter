import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    // Use local dist build for testing
    ['./dist/index.js', {
      outputDir: './test-results/reports',
      outputFile: 'enhanced-report.html',
      title: 'Test Report - CSS Alignment Fix',
      includeCharts: true,
      includeTrends: true,
      openReport: false,
      theme: 'auto'
    }]
  ],

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
      },
    },
  ],
});
