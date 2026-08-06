import { expect, test, type Page } from "@playwright/test";

const password = "password123";

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL("/");
}

function dashboard(page: Page) {
  return page.getByRole("region", { name: "Dashboard modules" });
}

test("redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
});

test("employee sees only employee dashboard modules", async ({ page }) => {
  await login(page, "employee@e2e.test");
  const modules = dashboard(page);

  await expect(modules.getByRole("heading", { name: "My attendance" })).toBeVisible();
  await expect(modules.getByRole("heading", { name: "Apply for Leave" })).toBeVisible();
  await expect(modules.getByRole("heading", { name: "Manual requests" })).toBeVisible();
  await expect(modules.getByRole("heading", { name: "Approvals" })).toHaveCount(0);
  await expect(modules.getByRole("heading", { name: "Enrollment" })).toHaveCount(0);
});

test("manager sees only pending requests from direct reports", async ({ page }) => {
  await login(page, "manager@e2e.test");
  const modules = dashboard(page);

  await expect(modules.getByRole("heading", { name: "Team attendance" })).toBeVisible();
  await expect(modules.getByRole("heading", { name: "Approvals" })).toBeVisible();
  await expect(modules.getByText("2 Pending", { exact: true })).toBeVisible();
  await expect(modules.getByRole("heading", { name: "Company Attendance" })).toHaveCount(0);
});

test("owner sees organization modules and all pending requests", async ({ page }) => {
  await login(page, "owner@e2e.test");
  const modules = dashboard(page);

  await expect(modules.getByRole("heading", { name: "Approvals" })).toBeVisible();
  await expect(modules.getByRole("heading", { name: "Enrollment" })).toBeVisible();
  await expect(modules.getByRole("heading", { name: "Company Attendance" })).toBeVisible();
  await expect(modules.getByText("4 Pending", { exact: true })).toBeVisible();
  await expect(modules.getByRole("heading", { name: "My attendance" })).toHaveCount(0);
  await expect(modules.getByRole("heading", { name: "Apply for Leave" })).toHaveCount(0);
  await expect(modules.getByRole("heading", { name: "Manual requests" })).toHaveCount(0);
});

test("signs out and returns to login", async ({ page }) => {
  await login(page, "employee@e2e.test");

  await page.getByRole("button", { name: "Sign Out" }).click();

  await expect(page).toHaveURL("/login");
  await page.goto("/");
  await expect(page).toHaveURL("/login");
});
