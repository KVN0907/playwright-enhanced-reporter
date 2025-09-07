# Publishing Guide for Playwright Enhanced Reporter

## Pre-Publishing Checklist

1. **Update version in package.json** (if needed)
2. **Ensure all files are built**: `npm run build`
3. **Test the package locally**: `npm pack && npm install ./playwright-enhanced-reporter-x.x.x.tgz`
4. **Review package contents**: `npm pack --dry-run`

## Publishing Steps

### 1. Login to npm
```bash
npm login
```

### 2. Publish to npm
```bash
npm publish
```

### 3. Verify publication
```bash
npm view playwright-enhanced-reporter
```

## Version Management

### Patch Release (bug fixes)
```bash
npm version patch
npm publish
```

### Minor Release (new features)
```bash
npm version minor
npm publish
```

### Major Release (breaking changes)
```bash
npm version major
npm publish
```

## Testing Before Publishing

### Local Testing
```bash
# Create package
npm pack

# Test in a sample project
mkdir ../test-playwright-reporter
cd ../test-playwright-reporter
npm init -y
npm install @playwright/test
npm install ../playwright-enhanced-reporter/playwright-enhanced-reporter-1.0.0.tgz

# Create playwright.config.ts
cat > playwright.config.ts << EOF
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['playwright-enhanced-reporter']],
  testDir: './tests',
});
EOF

# Create a test
mkdir tests
cat > tests/sample.spec.ts << EOF
import { test, expect } from '@playwright/test';

test('sample test', async ({ page }) => {
  test.info().annotations.push({ type: 'severity', description: 'high' });
  test.info().annotations.push({ type: 'feature', description: 'Sample Feature' });
  
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});
EOF

# Run test
npx playwright test
```

## Package Structure

```
playwright-enhanced-reporter/
├── dist/                  # Compiled TypeScript
├── src/                   # Source code
│   ├── index.ts          # Main reporter class
│   ├── html-generator.ts # HTML generation
│   └── types.ts          # Type definitions
├── examples/             # Example usage
├── README.md            # Documentation
├── LICENSE              # MIT License
├── package.json         # Package configuration
└── tsconfig.json        # TypeScript config
```

## GitHub Repository Setup

1. Create repository: `https://github.com/KVN0907/playwright-enhanced-reporter`
2. Push code:
   ```bash
   git init
   git add .
   git commit -m "Initial release v1.0.0"
   git branch -M main
   git remote add origin https://github.com/KVN0907/playwright-enhanced-reporter.git
   git push -u origin main
   ```

3. Create release tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Post-Publishing

1. **Update documentation** if needed
2. **Create GitHub release** with changelog
3. **Announce** on relevant platforms
4. **Monitor** for issues and feedback

## Support

- Issues: https://github.com/KVN0907/playwright-enhanced-reporter/issues
- NPM: https://www.npmjs.com/package/playwright-enhanced-reporter
