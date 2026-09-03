import { defineConfig, devices } from "@playwright/test";

const cannotListenOnLocalhost = process.env.CODEX_SANDBOX === "seatbelt";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  outputDir: "test-results",
  use: {
    baseURL: "http://127.0.0.1:4321",
    launchOptions: cannotListenOnLocalhost
      ? { args: ["--single-process", "--no-zygote"] }
      : undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: cannotListenOnLocalhost
    ? undefined
    : {
        command: "npm run preview -- --host 127.0.0.1 --port 4321",
        url: "http://127.0.0.1:4321",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
