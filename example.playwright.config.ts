import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    // Basic usage
    ['playwright-enhanced-reporter'],
    
    // Or with options
    ['playwright-enhanced-reporter', {
      outputDir: './test-results/reports',
      outputFile: 'enhanced-report.html',
      title: 'My Test Results',
      includeCharts: true,
      includeTrends: true,
      openReport: false,
      theme: 'auto' // 'light', 'dark', or 'auto'
    }]
  ],

  use: {
    // Enable tracing for failed tests to get more detailed reports
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        // Add any browser-specific configuration
      },
    },
    {
      name: 'firefox',
      use: { 
        browserName: 'firefox',
      },
    },
    {
      name: 'webkit',
      use: { 
        browserName: 'webkit',
      },
    },
  ],
});
