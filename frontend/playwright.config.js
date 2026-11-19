import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 60000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/crossBrowser.spec.js', '**/performance.spec.js'],
    },
    {
      name: 'firefox',
      testMatch: '**/crossBrowser.spec.js',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-mobile',
      testMatch: '**/crossBrowser.spec.js',
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
    {
      name: 'performance',
      testMatch: '**/performance.spec.js',
      dependencies: ['chromium', 'firefox', 'webkit-mobile'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm --prefix ../frontend run build && node scripts/e2e-server.js',
    cwd: '../backend',
    url: 'http://127.0.0.1:4001/api/health',
    reuseExistingServer: false,
    timeout: 120000,
  },
});
