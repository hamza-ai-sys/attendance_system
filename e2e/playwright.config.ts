import { defineConfig, devices } from "@playwright/test";

const dashboardPort = Number(process.env.E2E_DASHBOARD_PORT ?? 3100);
const baseURL = `http://localhost:${dashboardPort}`;

export default defineConfig({
  testDir: "./tests",
  outputDir: "../test-results",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: "pnpm --filter @attendance/dashboard dev",
    url: `${baseURL}/healthz`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      PORT: String(dashboardPort),
      SESSION_SECRET: process.env.SESSION_SECRET ?? "e2e-only-session-secret-at-least-32-bytes-long"
    }
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
