import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chrome-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "edge-equivalent", use: { ...devices["Desktop Edge"] } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "safari-equivalent", use: { ...devices["Desktop Safari"] } },
    { name: "small-phone", use: { ...devices["iPhone SE"] } },
    { name: "large-phone", use: { ...devices["iPhone 15 Pro Max"] } },
    { name: "tablet", use: { ...devices["iPad Pro 11"] } },
  ],
  webServer: {
    command: "NEXT_PUBLIC_SUPABASE_URL='' NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='' NEXT_PUBLIC_SUPABASE_ANON_KEY='' pnpm dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
