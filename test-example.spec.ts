import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  
  test('successful login with valid credentials', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Authentication' });
    test.info().annotations.push({ type: 'epic', description: 'User Management' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.screenshot({ path: 'test-results/login-success.png' });
    
    // Simulate successful login
    await page.waitForTimeout(100);
    expect(true).toBe(true);
  });

  test('login fails with invalid credentials', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Authentication' });
    test.info().annotations.push({ type: 'epic', description: 'User Management' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.screenshot({ path: 'test-results/login-fail.png' });
    
    await page.waitForTimeout(150);
    expect(true).toBe(true);
  });

  test('password reset flow', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Password Recovery' });
    test.info().annotations.push({ type: 'epic', description: 'User Management' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.waitForTimeout(120);
    expect(true).toBe(true);
  });
});

test.describe('E-commerce Tests', () => {
  
  test('add product to cart', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Shopping Cart' });
    test.info().annotations.push({ type: 'epic', description: 'E-commerce' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.screenshot({ path: 'test-results/add-to-cart.png' });
    
    await page.waitForTimeout(200);
    expect(true).toBe(true);
  });

  test('remove product from cart', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Shopping Cart' });
    test.info().annotations.push({ type: 'epic', description: 'E-commerce' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.waitForTimeout(100);
    expect(true).toBe(true);
  });

  test('checkout process', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Checkout' });
    test.info().annotations.push({ type: 'epic', description: 'E-commerce' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.waitForTimeout(300);
    expect(true).toBe(true);
  });

  test('apply discount code', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Promotions' });
    test.info().annotations.push({ type: 'epic', description: 'E-commerce' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.waitForTimeout(150);
    expect(true).toBe(true);
  });
});

test.describe('Search Functionality', () => {
  
  test('search with valid query', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Search' });
    test.info().annotations.push({ type: 'epic', description: 'Discovery' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.waitForTimeout(100);
    expect(true).toBe(true);
  });

  test('search with no results', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'normal' });
    test.info().annotations.push({ type: 'feature', description: 'Search' });
    test.info().annotations.push({ type: 'epic', description: 'Discovery' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.waitForTimeout(80);
    expect(true).toBe(true);
  });

  test('filter search results', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Search' });
    test.info().annotations.push({ type: 'epic', description: 'Discovery' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.waitForTimeout(120);
    expect(true).toBe(true);
  });
});

test.describe('User Profile Tests', () => {
  
  test('update profile information', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Profile Management' });
    test.info().annotations.push({ type: 'epic', description: 'User Management' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.waitForTimeout(150);
    expect(true).toBe(true);
  });

  test('upload profile picture', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'low' });
    test.info().annotations.push({ type: 'feature', description: 'Profile Management' });
    test.info().annotations.push({ type: 'epic', description: 'User Management' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.screenshot({ path: 'test-results/profile-pic.png' });
    await page.waitForTimeout(100);
    expect(true).toBe(true);
  });

  test('delete user account', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Account Management' });
    test.info().annotations.push({ type: 'epic', description: 'User Management' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.waitForTimeout(200);
    expect(true).toBe(true);
  });
});

// Intentionally failing test
test.describe('Error Scenarios', () => {
  
  test('network timeout error', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Error Handling' });
    test.info().annotations.push({ type: 'epic', description: 'Stability' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.screenshot({ path: 'test-results/error-screenshot.png' });
    
    // This will fail
    expect(1).toBe(2);
  });

  test('navigation error', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Navigation' });
    test.info().annotations.push({ type: 'epic', description: 'Stability' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    
    // This will also fail
    expect('actual').toBe('expected');
  });
});

// Test that will be skipped
test.describe('Skipped Tests', () => {
  
  test.skip('feature not yet implemented', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'low' });
    test.info().annotations.push({ type: 'feature', description: 'Future Feature' });
    test.info().annotations.push({ type: 'epic', description: 'Roadmap' });
    
    await page.goto('https://example.com');
  });
});

// Flaky test (will pass on retry)
test.describe('Flaky Test Example', () => {
  
  test('sometimes flaky test', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Payment' });
    test.info().annotations.push({ type: 'epic', description: 'E-commerce' });
    
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.waitForTimeout(100);
    
    // This will fail on first attempt but pass on retry
    if (test.info().retry === 0) {
      expect(false).toBe(true); // Will fail first time
    } else {
      expect(true).toBe(true); // Will pass on retry
    }
  });
});
