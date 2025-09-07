# Playwright Enhanced Reporter

A comprehensive, feature-rich HTML reporter for Playwright with analytics, charts, and BDD-style UI. This package provides detailed test execution reports with collapsible sections, dark mode, responsive design, and advanced metrics.

## Features

- 🎯 **Beautiful HTML Reports** - Clean, professional test execution reports
- 📊 **Rich Analytics** - Pass rates, duration metrics, browser performance
- 📈 **Interactive Charts** - Visual representation of test data using Chart.js
- 🌙 **Dark Mode Support** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🏷️ **Allure-style Annotations** - Support for severity, feature, and epic annotations
- 🔍 **Detailed Test Information** - Including spec file paths for easy debugging
- 📊 **Error Categorization** - Automatic categorization of test failures
- 🎨 **Customizable** - Configurable options for title, output, and theme

## Installation

```bash
npm install playwright-enhanced-reporter
```

## Usage

### Basic Configuration

Add the reporter to your `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['playwright-enhanced-reporter']
  ],
  // ... other config
});
```

### Advanced Configuration

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
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
  // ... other config
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputDir` | string | `'./test-results/reports'` | Directory for output files |
| `outputFile` | string | `'enhanced-report.html'` | Name of the HTML report file |
| `title` | string | `'Enhanced Test Report'` | Title displayed in the report |
| `includeCharts` | boolean | `true` | Include interactive charts |
| `includeTrends` | boolean | `true` | Generate trends data |
| `openReport` | boolean | `false` | Auto-open report after test run |
| `theme` | string | `'auto'` | Default theme ('light', 'dark', 'auto') |

## Allure-style Annotations

Enhance your tests with metadata using Playwright annotations:

```typescript
import { test } from '@playwright/test';

test('user login', async ({ page }) => {
  // Add severity annotation
  test.info().annotations.push({ type: 'severity', description: 'critical' });
  
  // Add feature annotation
  test.info().annotations.push({ type: 'feature', description: 'Authentication' });
  
  // Add epic annotation
  test.info().annotations.push({ type: 'epic', description: 'User Management' });
  
  // Your test code here
});
```

### Supported Annotations

- **severity**: `critical`, `high`, `medium`, `low`, `normal`
- **feature**: Any string describing the feature being tested
- **epic**: Any string describing the epic or larger feature set

## Report Features

### Overview Section
- Total test count with pass/fail breakdown
- Browser performance metrics
- Execution time and duration information
- Interactive pie charts for test results

### Performance Metrics
- Pass rate percentage
- Average test duration
- Tests per second
- Success/failure trends

### Test Details Table
- Test name and status
- Browser information
- Spec file path (for easy debugging)
- Execution duration
- Severity and feature tags
- Error messages for failed tests

### Interactive Features
- Collapsible panels for better organization
- Dark/light mode toggle with persistence
- Smooth scrolling navigation
- Responsive design for all screen sizes

## Generated Files

The reporter generates several files:

- `enhanced-report.html` - Main interactive HTML report
- `detailed-report.json` - Raw test data in JSON format
- `trends.json` - Historical test execution data (if enabled)

## Examples

### Multiple Reporters
You can use this reporter alongside other Playwright reporters:

```typescript
export default defineConfig({
  reporter: [
    ['list'],
    ['html'],
    ['playwright-enhanced-reporter', {
      outputDir: './reports',
      title: 'CI Test Results'
    }],
    ['junit', { outputFile: './reports/junit.xml' }]
  ],
});
```

### CI/CD Integration
The reporter works great in CI/CD environments:

```typescript
export default defineConfig({
  reporter: [
    ['playwright-enhanced-reporter', {
      outputDir: process.env.CI ? './test-results' : './reports',
      title: process.env.CI ? 'CI Test Report' : 'Local Test Report',
      theme: 'auto'
    }]
  ],
});
```

## Development

### Building from Source

```bash
git clone https://github.com/KVN0907/playwright-enhanced-reporter.git
cd playwright-enhanced-reporter
npm install
npm run build
```

### Running Tests

```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT - See [LICENSE](LICENSE) file for details.

## Changelog

### 1.0.1
- Initial release
- Basic HTML report generation
- Interactive charts and analytics
- Dark mode support
- Responsive design
- Allure-style annotations
- Spec file path tracking

## Support

- 🐛 [Report Issues](https://github.com/KVN0907/playwright-enhanced-reporter/issues)
- 📖 [Documentation](https://github.com/KVN0907/playwright-enhanced-reporter#readme)
- 💬 [Discussions](https://github.com/KVN0907/playwright-enhanced-reporter/discussions)

---

Made with ❤️ for the Playwright testing community
