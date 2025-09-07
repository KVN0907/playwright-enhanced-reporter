import { test, expect } from '@playwright/test';

// Example test with annotations for enhanced reporting
test.describe('User Authentication', () => {
  
  test('user can login with valid credentials', async ({ page }) => {
    // Add annotations for better reporting
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Authentication' });
    test.info().annotations.push({ type: 'epic', description: 'User Management' });
    
    await page.goto('https://example.com/login');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  });

  test('user cannot login with invalid credentials', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Authentication' });
    test.info().annotations.push({ type: 'epic', description: 'User Management' });
    
    await page.goto('https://example.com/login');
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('forgot password functionality', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Password Recovery' });
    test.info().annotations.push({ type: 'epic', description: 'User Management' });
    
    await page.goto('https://example.com/login');
    await page.click('[data-testid="forgot-password-link"]');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.click('[data-testid="reset-password-button"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Reset email sent');
  });
});

test.describe('Product Catalog', () => {
  
  test('user can view product details', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'normal' });
    test.info().annotations.push({ type: 'feature', description: 'Product Viewing' });
    test.info().annotations.push({ type: 'epic', description: 'E-commerce' });
    
    await page.goto('https://example.com/products');
    await page.click('[data-testid="product-1"]');
    
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
  });

  test('user can search for products', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'high' });
    test.info().annotations.push({ type: 'feature', description: 'Product Search' });
    test.info().annotations.push({ type: 'epic', description: 'E-commerce' });
    
    await page.goto('https://example.com/products');
    await page.fill('[data-testid="search-input"]', 'laptop');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-item"]').first()).toBeVisible();
  });
});

test.describe('Shopping Cart', () => {
  
  test('user can add items to cart', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'critical' });
    test.info().annotations.push({ type: 'feature', description: 'Cart Management' });
    test.info().annotations.push({ type: 'epic', description: 'E-commerce' });
    
    await page.goto('https://example.com/products');
    await page.click('[data-testid="product-1"]');
    await page.click('[data-testid="add-to-cart-button"]');
    
    await expect(page.locator('[data-testid="cart-counter"]')).toContainText('1');
    await expect(page.locator('[data-testid="cart-notification"]')).toBeVisible();
  });

  test('user can remove items from cart', async ({ page }) => {
    test.info().annotations.push({ type: 'severity', description: 'medium' });
    test.info().annotations.push({ type: 'feature', description: 'Cart Management' });
    test.info().annotations.push({ type: 'epic', description: 'E-commerce' });
    
    // Assume item is already in cart
    await page.goto('https://example.com/cart');
    await page.click('[data-testid="remove-item-button"]');
    
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-counter"]')).toContainText('0');
  });
});
