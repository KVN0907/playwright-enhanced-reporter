# Test the Enhanced Reporter Package

This directory contains a simple test to verify that the playwright-enhanced-reporter package works correctly.

## How to Test

1. **Install the package locally:**
   ```bash
   npm pack
   npm install ./playwright-enhanced-reporter-1.0.0.tgz
   ```

2. **Create a simple test project:**
   ```bash
   mkdir test-project
   cd test-project
   npm init -y
   npm install @playwright/test
   npm install ../playwright-enhanced-reporter-1.0.0.tgz
   ```

3. **Add a simple test file and playwright config**

4. **Run tests:**
   ```bash
   npx playwright test
   ```

5. **Check the generated report:**
   ```bash
   open test-results/reports/enhanced-report.html
   ```

## Package Publishing

To publish to npm:

```bash
npm run build
npm publish
```

Make sure you're logged in to npm and have the appropriate permissions.

## Local Development

For local development and testing:

```bash
# Build the package
npm run build

# Create a tarball for local testing
npm pack

# Install in test project
npm install ../playwright-enhanced-reporter-1.0.0.tgz
```
