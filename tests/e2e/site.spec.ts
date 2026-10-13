import { test, expect } from "@playwright/test";
test("all public routes render and unknown routes are handled", async ({
  page,
}) => {
  for (const [path, title] of [
    ["", "Discover Sri Lanka,"],
    ["about", "Our home. Your next story."],
    ["tours", "Find your kind of journey."],
    ["guides", "Meet your local friends."],
    ["ideas", "An island full of possibility."],
    ["contact", "Let’s dream up your trip."],
    ["tours/discover", "Discover Sri Lanka"],
    ["guides/sunil", "Ayubowan,"],
    ["ideas/ella", "Ella"],
    ["missing", "This path ends here."],
  ]) {
    await page.goto(`#/${path}`);
    await expect(page.locator("h1")).toContainText(title);
  }
});
test("demo request is pending, owner approves, completed trip review is moderated", async ({
  page,
}) => {
  await page.goto("#/book?guide=sunil");
  await expect(page.locator("h1")).toHaveText("Welcome back.");
  await page.getByLabel("Email address").fill("traveller@example.com");
  await page.getByRole("button", { name: "Enter demo account" }).click();
  await expect(page.locator("h1")).toHaveText("Let’s make a plan.");
  await page.getByLabel("Full name").fill("Test Traveller");
  await page.getByLabel("WhatsApp / contact number").fill("+447700900123");
  await page.getByLabel("Arrival date").fill("2030-07-01");
  await page.getByLabel("Departure date").fill("2030-07-08");
  await page.getByLabel("Pickup location").fill("Colombo airport");
  await page.getByLabel("I understand this is a request").check();
  await page.getByRole("button", { name: "Save demo booking request" }).click();
  await expect(page.locator(".status-badge")).toHaveText("Pending");
  await expect(page.getByRole("status")).toContainText(
    "No booking request was delivered",
  );
  await page.getByRole("link", { name: "Try demo owner tools" }).click();
  await page.getByRole("button", { name: "Accept", exact: true }).click();
  await expect(page.locator(".status-badge")).toHaveText("Accepted");
  await page.getByRole("button", { name: "Mark completed" }).click();
  await expect(page.locator(".status-badge")).toHaveText("Completed");
  await page.getByRole("link", { name: "Customer view" }).click();
  await page.getByRole("button", { name: "Share your experience" }).click();
  await page.getByLabel("Country", { exact: true }).fill("New Zealand");
  await page
    .getByLabel("Your experience", { exact: true })
    .fill(
      "A wonderful demo journey with beautiful scenery and a friendly guide.",
    );
  await page.getByLabel("I agree to publish").check();
  await page
    .getByLabel("Trip photographs")
    .setInputFiles("public/images/sigiriya-hero.png");
  await page.getByRole("button", { name: "Submit for moderation" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Demo review saved locally" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("ceylon:reviews")!)[0].photos[0],
    ),
  ).toMatch(/^data:image\/jpeg;base64,/);
  await page.getByRole("link", { name: "Try demo owner tools" }).click();
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await page.goto("#/guides/sunil");
  await expect(
    page.getByText(
      "A wonderful demo journey with beautiful scenery and a friendly guide.",
      { exact: false },
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "View trip photograph 1 from traveller" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("contact validation and local submission do not claim delivery", async ({
  page,
}) => {
  await page.goto("#/contact");
  await page.getByRole("button", { name: "Save demo enquiry" }).click();
  await expect(page.locator("input[name=name]")).toBeFocused();
  await page.getByLabel("Full name").fill("Test Traveller");
  await page.getByLabel("Email address").fill("test@example.com");
  await page.getByLabel("Country", { exact: true }).fill("Germany");
  await page.getByLabel("Planned arrival date").fill("2030-01-01");
  await page
    .getByLabel("What are you dreaming of?")
    .fill("A seven-day journey through Sri Lanka.");
  await page.getByRole("button", { name: "Save demo enquiry" }).click();
  await expect(page.getByRole("status")).toContainText(
    "No message was delivered",
  );
});
test("mobile menu and page layouts fit a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "",
    "tours",
    "guides",
    "contact",
    "tours/complete",
    "ideas",
    "about",
    "login",
  ]) {
    await page.goto(`#/${path}`);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("#/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Our Tours", exact: true })
    .click();
  await expect(page.locator("h1")).toHaveText("Find your kind of journey.");
});
test("placeholder WhatsApp is safely disclosed", async ({ page }) => {
  await page.goto("#/");
  await page.locator(".floating-contact button").click();
  await expect(page.getByRole("dialog")).toContainText("cannot be sent yet");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.locator(".floating-contact button")).toBeFocused();
});
test("bundled travel imagery and portraits load without remote services", async ({
  page,
}) => {
  await page.goto("#/");
  await expect(page.locator(".hero-bg")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".hero-bg")
        .evaluate((el) => (el as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.locator(".home-guides").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".home-guides img")
        .evaluateAll((images) =>
          images.every((el) => (el as HTMLImageElement).naturalWidth > 0),
        ),
    )
    .toBe(true);
});
