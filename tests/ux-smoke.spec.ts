import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

type AppManifest = {
  slug: string;
  enabled?: boolean;
  visibility?: "public" | "hidden";
};

const allowanceScanRoute = "/apps/toeslagen-scan";
const maximumMortgageRoute = "/apps/artifact-hypotheek-wonen-maximale-hypotheek";
const debtComparisonRoute = "/apps/schulden-volgorde";

function getAppManifests() {
  const appsDirectory = path.join(process.cwd(), "apps");

  return fs
    .readdirSync(appsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const manifestPath = path.join(appsDirectory, entry.name, "app.json");
      if (!fs.existsSync(manifestPath)) return [];

      const manifest = JSON.parse(
        fs.readFileSync(manifestPath, "utf8"),
      ) as AppManifest;

      return [manifest];
    });
}

function getPublicToolRoutes() {
  return getAppManifests()
    .filter(
      (manifest) =>
        manifest.enabled !== false &&
        (manifest.visibility ?? "public") === "public",
    )
    .map((manifest) => `/apps/${manifest.slug}`)
    .sort();
}

function getNonPublicToolRoutes() {
  return new Set(
    getAppManifests()
      .filter(
        (manifest) =>
          manifest.enabled === false || manifest.visibility === "hidden",
      )
      .map((manifest) => `/apps/${manifest.slug}`),
  );
}

async function submitCurrentCalculator(
  page: Page,
  isMobile: boolean,
  desktopLabel = "Bereken",
) {
  if (!isMobile) {
    await page.getByRole("button", { name: desktopLabel, exact: true }).first().click();
    return;
  }

  const nextButton = page.getByRole("button", { name: "Volgende", exact: true });
  while (await nextButton.isVisible().catch(() => false)) {
    await nextButton.click();
  }
  await page.getByRole("button", { name: "Bekijk uitkomst", exact: true }).click();
}

const routes = [
  "/",
  "/apps",
  "/profiel",
  "/kennisbank",
  "/variabelen",
  ...getPublicToolRoutes(),
];

const maximumMortgageEnabled = getPublicToolRoutes().includes(maximumMortgageRoute);
const mortgageImpactEnabled = getPublicToolRoutes().includes(
  "/apps/hypotheek-impact-studieschuld",
);

for (const route of routes) {
  test(`${route} heeft een bruikbare basisstructuur`, async ({ page }, testInfo) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    expect(pageErrors).toEqual([]);

    const audit = await page.evaluate(() => {
      function accessibleName(control: Element) {
        const id = control.getAttribute("id");
        const explicitLabel = id
          ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent
          : "";

        return (
          control.getAttribute("aria-label") ||
          explicitLabel ||
          control.closest("label")?.textContent ||
          ""
        ).trim();
      }

      const controls = [...document.querySelectorAll("input, select, textarea")];
      const fieldFlows = [...document.querySelectorAll('[class*="md:hidden"]')]
        .filter((element) => /Vraag\s+\d+\s+van\s+\d+/.test(element.textContent ?? ""))
        .map((element) => Boolean(element.getClientRects().length));

      return {
        bodyWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
        h1Count: document.querySelectorAll("h1").length,
        mainCount: document.querySelectorAll("main").length,
        unlabeledControlCount: controls.filter(
          (control) => accessibleName(control).length === 0,
        ).length,
        fieldFlows,
      };
    });

    expect(audit.bodyWidth).toBeLessThanOrEqual(audit.viewportWidth + 1);
    expect(audit.h1Count).toBe(1);
    expect(audit.mainCount).toBe(1);
    expect(audit.unlabeledControlCount).toBe(0);
    if (testInfo.project.name.startsWith("mobile")) {
      expect(audit.fieldFlows.every(Boolean)).toBe(true);
    }
  });
}

test("mobiele hypotheekflow kan naar veld 2", async ({ page }, testInfo) => {
  test.skip(!mortgageImpactEnabled, "Zelfstandige hypotheekimpact is uitgeschakeld");
  test.skip(!testInfo.project.name.startsWith("mobile"), "Alleen relevant op mobiel");

  await page.goto("/apps/hypotheek-impact-studieschuld", {
    waitUntil: "networkidle",
  });

  await expect(page.getByText(/Vraag 1 van \d+/)).toBeVisible();
  await page.getByRole("button", { name: "Volgende", exact: true }).click();
  await expect(page.getByText(/Vraag 2 van \d+/)).toBeVisible();
  await expect(
    page.getByLabel("Terugbetalingsregel", { exact: true }),
  ).toBeVisible();
});

test("mobiele calculatorflows blijven solide op 375, 390 en 430 pixels", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  test.skip(!testInfo.project.name.startsWith("mobile"), "Alleen relevant op mobiel");

  for (const width of [375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });

    for (const route of getPublicToolRoutes()) {
      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page.locator(".mobile-flow-controls")).toBeVisible();
      const visibleStepParts = await page.locator(".mobile-flow-step:visible").count();
      expect(visibleStepParts, `${route} zichtbare stapdelen bij ${width}px`).toBeGreaterThanOrEqual(1);
      expect(visibleStepParts, `${route} zichtbare stapdelen bij ${width}px`).toBeLessThanOrEqual(2);

      const dimensions = await page.evaluate(() => ({
        body: document.body.scrollWidth,
        html: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      expect(dimensions.body, `${route} body bij ${width}px`).toBeLessThanOrEqual(
        dimensions.viewport + 1,
      );
      expect(dimensions.html, `${route} html bij ${width}px`).toBeLessThanOrEqual(
        dimensions.viewport + 1,
      );
    }
  }
});

test("mobiele hoofdactie blijft tijdens invullen binnen bereik", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Alleen relevant op mobiel");
  await page.setViewportSize({ width: 390, height: 560 });

  for (const route of [
    "/apps/duo-schuld-bij-starten-lenen",
    "/apps/duo-maandbedrag",
    "/apps/duo-extra-aflossen",
  ]) {
    await page.goto(route, { waitUntil: "networkidle" });
    const controls = page.locator(".mobile-flow-controls");
    await expect(controls, route).toHaveCSS("position", "fixed");

    for (const scrollY of [0, 280]) {
      await page.evaluate((value) => window.scrollTo(0, value), scrollY);
      const box = await controls.boundingBox();
      expect(box, `${route}: actiezone ontbreekt`).not.toBeNull();
      expect(box!.y, `${route}: actiezone boven beeld`).toBeGreaterThanOrEqual(-1);
      expect(box!.y + box!.height, `${route}: actiezone onder beeld`).toBeLessThanOrEqual(561);
    }
  }
});

test("Enter valideert, gaat verder en rondt de laatste mobiele vraag af", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Alleen relevant op mobiel");

  await page.goto("/apps/duo-leenbedrag-impact", { waitUntil: "networkidle" });
  const monthlyLoan = page.locator("#monthlyLoan");
  await monthlyLoan.fill("-1");
  await monthlyLoan.press("Enter");
  await expect(page.getByText("Gebruik 0 of een positief bedrag.")).toBeVisible();
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await monthlyLoan.fill("150,5");
  await expect(monthlyLoan).toHaveAttribute("inputmode", "decimal");
  await expect(monthlyLoan).toHaveAttribute("enterkeyhint", "done");
  await expect(page.locator("#monthlyLoanSlider")).toHaveValue("150.5");
  await monthlyLoan.press("Enter");
  await expect(page.getByRole("button", { name: "Invoer wijzigen" })).toBeVisible();
  const resultSummary = page.locator("#tool-result-summary");
  await expect(resultSummary).toBeFocused();
  expect(
    await resultSummary.evaluate((element) => {
      const conclusion = element.querySelector("h3");
      const actions = element.querySelector('[aria-label="Acties voor je berekening"]');
      return Boolean(
        conclusion &&
          actions &&
          (conclusion.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
      );
    }),
  ).toBe(true);
});

test("vorige, invoer wijzigen en bevestigd herstarten bewaren de juiste staat", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Alleen relevant op mobiel");

  await page.goto("/apps/duo-aanvullende-beurs", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  const education = page.getByLabel("Opleiding");
  await expect(education).toHaveValue("hbo");
  await page.getByRole("button", { name: "Volgende", exact: true }).click();
  await page.getByRole("button", { name: "Vorige" }).click();
  await expect(education).toHaveValue("hbo");

  await page.goto("/apps/duo-leenbedrag-impact", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  const monthlyLoan = page.locator("#monthlyLoan");
  const originalValue = await monthlyLoan.inputValue();
  await page.getByRole("button", { name: "Bekijk uitkomst" }).click();
  await page.getByRole("button", { name: "Invoer wijzigen" }).click();
  await expect(monthlyLoan).toHaveValue(originalValue);
  await page.getByRole("button", { name: "Opnieuw beginnen" }).click();
  await page.getByRole("button", { name: "Wis en begin opnieuw" }).click();
  await expect(monthlyLoan).toHaveValue("");
});

test("browser-terug blijft routernavigatie en maakt geen verborgen formuliergeschiedenis", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Alleen relevant op mobiel");

  await page.goto("/apps", { waitUntil: "networkidle" });
  await page.goto("/apps/duo-aanvullende-beurs", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Volgende", exact: true }).click();
  await page.goBack({ waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/apps$/);
});

test("publieke links verwijzen alleen naar bestaande publieke routes", async ({
  page,
  request,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Een volledige linkcrawl volstaat");

  const nonPublicToolRoutes = getNonPublicToolRoutes();
  const links = new Map<string, string>();

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), route).toBe(200);

    const visibleLinks = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors
        .filter((anchor) => {
          const element = anchor as HTMLElement;
          const style = window.getComputedStyle(element);
          return Boolean(element.getClientRects().length) && style.visibility !== "hidden";
        })
        .map((anchor) => anchor.getAttribute("href") ?? "")
        .filter(Boolean),
    );

    for (const href of visibleLinks) {
      if (href.startsWith("/") && !links.has(href)) {
        links.set(href, route);
      }
    }
  }

  for (const [href, sourceRoute] of links) {
    const pathname = href.split(/[?#]/, 1)[0] || "/";
    expect(
      nonPublicToolRoutes.has(pathname),
      `${sourceRoute} verwijst publiek naar ${pathname}`,
    ).toBe(false);

    const response = await request.get(href);
    expect(
      response.status(),
      `${sourceRoute} verwijst naar niet-bestaande route ${href}`,
    ).toBeLessThan(400);
  }

  expect(links.has("/apps/volgende-euro")).toBe(false);
});

test("publieke oppervlakken blijven binnen dezelfde horizontale randen", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Eén volledige resizematrix volstaat");

  const sizes = [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1180, height: 820 },
    { width: 1440, height: 900 },
  ] as const;

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route).toBe(200);

    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

      const audit = await page.evaluate(() => {
        const visibleInteractiveElements = [
          ...document.querySelectorAll("main input, main select, main textarea, main button, main a[href]"),
        ].filter((element) => {
          const htmlElement = element as HTMLElement;
          const style = window.getComputedStyle(htmlElement);
          return Boolean(htmlElement.getClientRects().length) && style.visibility !== "hidden";
        });
        const outsideViewport = visibleInteractiveElements
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > window.innerWidth + 1;
          })
          .map((element) =>
            element.getAttribute("aria-label") ||
            element.getAttribute("id") ||
            element.textContent?.trim().slice(0, 80) ||
            element.tagName,
          );

        return {
          htmlWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          outsideViewport,
        };
      });

      const label = `${route} bij ${size.width}x${size.height}`;
      expect(audit.htmlWidth, `${label}: html-overflow`).toBeLessThanOrEqual(audit.clientWidth + 1);
      expect(audit.bodyWidth, `${label}: body-overflow`).toBeLessThanOrEqual(audit.clientWidth + 1);
      expect(audit.outsideViewport, `${label}: interactie buiten viewport`).toEqual([]);
    }
  }
});

test("gekoppelde velden en kaarten delen horizontale rijen", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop geometriecontrole");

  async function expectAlignedFieldRows(containerSelector: string, label: string) {
    const rows = await page.locator(containerSelector).evaluateAll((containers) =>
      containers.flatMap((container) => {
        const groups = new Map<number, Array<{ label: string; controlTop: number }>>();

        for (const child of [...container.children]) {
          const control = child.querySelector("input, select, textarea") as HTMLElement | null;
          if (!control || !control.getClientRects().length) continue;
          const visualControl =
            (control.closest(".field-shell") as HTMLElement | null) ?? control;
          const childTop = Math.round((child as HTMLElement).getBoundingClientRect().top);
          const fieldLabel = child.querySelector("label")?.textContent?.trim() || control.id;
          const row = groups.get(childTop) ?? [];
          row.push({
            label: fieldLabel,
            controlTop: Math.round(visualControl.getBoundingClientRect().top),
          });
          groups.set(childTop, row);
        }

        return [...groups.values()]
          .filter((row) => row.length > 1)
          .map((row) => ({
            labels: row.map((field) => field.label),
            difference:
              Math.max(...row.map((field) => field.controlTop)) -
              Math.min(...row.map((field) => field.controlTop)),
          }));
      }),
    );

    for (const row of rows) {
      expect(row.difference, `${label}: ${row.labels.join(" / ")}`).toBeLessThanOrEqual(1);
    }
  }

  for (const width of [768, 1024, 1180, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/profiel", { waitUntil: "networkidle" });
    for (const step of ["Inkomen", "Studieschuld", "Wonen"]) {
      await page.getByRole("button", { name: step, exact: true }).first().click();
      await expectAlignedFieldRows(
        "section.surface-panel:has(> h3) > div.mt-5",
        `Profiel ${step} bij ${width}px`,
      );
    }
  }

  await page.goto("/apps/duo-aanvullende-beurs", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  const deductions = page.locator("details").filter({ hasText: "Aftrekposten en broers of zussen" });
  await deductions.locator("summary").click();
  for (const width of [768, 1024, 1180, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expectAlignedFieldRows(
      ".additional-grant-responsive-grid",
      `Aanvullende beurs bij ${width}px`,
    );
  }

  for (const width of [768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/apps", { waitUntil: "networkidle" });
    const cardRows = await page.locator("#apps a.surface-panel").evaluateAll((cards) => {
      const groups = new Map<number, HTMLElement[]>();
      for (const card of cards as HTMLElement[]) {
        const top = Math.round(card.getBoundingClientRect().top);
        const row = groups.get(top) ?? [];
        row.push(card);
        groups.set(top, row);
      }

      return [...groups.values()]
        .filter((row) => row.length > 1)
        .map((row) => {
          const descriptionTops = row.map((card) =>
            Math.round(card.querySelector("p")!.getBoundingClientRect().top),
          );
          const actionTops = row.map((card) =>
            Math.round(card.querySelector("div.mt-auto")!.getBoundingClientRect().top),
          );
          return {
            titles: row.map((card) => card.querySelector("h3")?.textContent?.trim() || "kaart"),
            descriptionDifference: Math.max(...descriptionTops) - Math.min(...descriptionTops),
            actionDifference: Math.max(...actionTops) - Math.min(...actionTops),
          };
        });
    });

    for (const row of cardRows) {
      const label = `Toolkaarten bij ${width}px: ${row.titles.join(" / ")}`;
      expect(row.descriptionDifference, label).toBeLessThanOrEqual(1);
      expect(row.actionDifference, label).toBeLessThanOrEqual(1);
    }
  }

  await page.goto("/apps/duo-schuld-bij-starten-lenen", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();
  for (const width of [768, 1024, 1180, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const resultRows = await page.locator(".grid").evaluateAll((grids) =>
      grids.flatMap((grid) => {
        const cards = [...grid.children].filter((child) =>
          child.matches("article.result-panel"),
        ) as HTMLElement[];
        if (cards.length < 2) return [];
        const groups = new Map<number, HTMLElement[]>();
        for (const card of cards) {
          const top = Math.round(card.getBoundingClientRect().top);
          const row = groups.get(top) ?? [];
          row.push(card);
          groups.set(top, row);
        }
        return [...groups.values()]
          .filter((row) => row.length > 1)
          .map((row) => {
            const valueTops = row.map((card) =>
              Math.round(card.querySelectorAll(":scope > p")[1].getBoundingClientRect().top),
            );
            return Math.max(...valueTops) - Math.min(...valueTops);
          });
      }),
    );
    expect(resultRows, `Resultaatkaarten bij ${width}px`).toEqual(
      resultRows.map(() => 0),
    );
  }
});

test("aanvullende beurs houdt oudervelden solide tijdens resizen", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Eén volledige resizematrix volstaat");

  const sizes = [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 640, height: 720 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1180, height: 820 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ] as const;

  async function expectSolidFormLayout(label: string) {
    const audit = await page.evaluate(() => {
      const scope = document.querySelector(".additional-grant-form");
      if (!scope) throw new Error("Aanvullende-beursformulier ontbreekt");

      const controls = [...scope.querySelectorAll("input, select, textarea")]
        .filter((control) => Boolean((control as HTMLElement).getClientRects().length))
        .map((control) => {
          const rect = control.getBoundingClientRect();
          return {
            id: control.id,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
          };
        });
      const overlaps: string[] = [];

      for (let leftIndex = 0; leftIndex < controls.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < controls.length; rightIndex += 1) {
          const left = controls[leftIndex];
          const right = controls[rightIndex];
          const horizontalOverlap = Math.min(left.right, right.right) - Math.max(left.left, right.left);
          const verticalOverlap = Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top);
          if (horizontalOverlap > 1 && verticalOverlap > 1) {
            overlaps.push(`${left.id} / ${right.id}`);
          }
        }
      }

      const boundedElements = [
        ...scope.querySelectorAll("label, legend, input, select, textarea"),
      ].filter((element) => Boolean((element as HTMLElement).getClientRects().length));
      const outsideViewport = boundedElements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left < -1 || rect.right > window.innerWidth + 1;
        })
        .map((element) =>
          element.getAttribute("for") || element.getAttribute("id") || element.textContent?.trim() || element.tagName,
        );

      return {
        htmlWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overlaps,
        outsideViewport,
      };
    });

    expect(audit.htmlWidth, `${label}: html overflow`).toBeLessThanOrEqual(audit.clientWidth + 1);
    expect(audit.bodyWidth, `${label}: body overflow`).toBeLessThanOrEqual(audit.clientWidth + 1);
    expect(audit.overlaps, `${label}: overlappende velden`).toEqual([]);
    expect(audit.outsideViewport, `${label}: onderdelen buiten viewport`).toEqual([]);
  }

  await page.goto("/apps/duo-aanvullende-beurs", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();

  const deductions = page
    .locator("details")
    .filter({ hasText: "Aftrekposten en broers of zussen" });
  await deductions.locator("summary").click();
  await expect(deductions).toHaveAttribute("open", "");
  await deductions.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(deductions).not.toHaveAttribute("open", "");
  await page.keyboard.press("Enter");
  await expect(deductions).toHaveAttribute("open", "");
  await expect(page.locator('[data-parent-income-group="1"]')).toBeVisible();
  await expect(page.locator('[data-parent-income-group="2"]')).toBeVisible();
  await expect(page.locator('[data-parent-deductions-group="1"]')).toBeVisible();
  await expect(page.locator('[data-parent-deductions-group="2"]')).toBeVisible();

  for (const size of [...sizes, ...[...sizes].reverse()]) {
    await page.setViewportSize(size);
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    await expectSolidFormLayout(`${size.width}x${size.height}, twee ouders`);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByLabel("Hoeveel ouders tellen mee?").selectOption("single-parent");
  await expect(page.locator('[data-parent-income-group="2"]')).toHaveCount(0);
  await expect(page.locator('[data-parent-deductions-group="2"]')).toHaveCount(0);
  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    await expectSolidFormLayout(`${size.width}x${size.height}, één ouder`);
  }

  await page.setViewportSize({ width: 320, height: 568 });
  for (let step = 0; step < 4; step += 1) {
    await page.getByRole("button", { name: "Volgende", exact: true }).click();
  }
  await page
    .locator('[data-parent-deductions-group="1"]')
    .getByLabel("Andere kwalificerende kinderen")
    .fill("12345678901234567890,5");
  await expect(
    page.locator('[data-parent-deductions-group="1"]').getByText("Gebruik een heel aantal van 0 of hoger."),
  ).toBeVisible();
  await expectSolidFormLayout("320x568 met lange ongeldige invoer en foutmelding");
});

test("maximale hypotheek toont één primaire uitkomst", async ({ page }, testInfo) => {
  test.skip(!maximumMortgageEnabled, "Maximale hypotheek is uitgeschakeld");
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopuitkomst controleren");

  await page.goto("/apps/artifact-hypotheek-wonen-maximale-hypotheek", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();

  const summary = page.locator("#tool-result-summary");
  await expect(summary.getByText("Indicatieve maximale hypotheek")).toBeVisible();
  await expect(summary.locator("article")).toHaveCount(1);
  await expect(summary.getByText("Impact DUO-schuld")).toHaveCount(0);
});

test("maximale hypotheek legt de uitkomst uit inclusief studieschuld", async ({
  page,
}) => {
  test.skip(!maximumMortgageEnabled, "Maximale hypotheek is uitgeschakeld");
  await page.goto("/apps/artifact-hypotheek-wonen-maximale-hypotheek", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();

  const desktopCalculate = page.getByRole("button", {
    name: "Bereken",
    exact: true,
  });
  if (await desktopCalculate.isVisible()) {
    await desktopCalculate.click();
  } else {
    const nextField = page.getByRole("button", { name: "Volgende", exact: true });
    while (await nextField.isVisible()) {
      await nextField.click();
    }
    await page.getByRole("button", { name: "Bekijk uitkomst" }).click();
  }

  const breakdown = page.getByTestId("mortgage-calculation-breakdown");
  await expect(
    breakdown.getByText("Zo is dit bedrag opgebouwd"),
  ).toBeVisible();

  const disclosure = breakdown.locator("details");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await breakdown
    .getByText("Zo is dit bedrag opgebouwd")
    .click();
  await expect(disclosure).toHaveAttribute("open", "");

  await expect(
    breakdown.getByText("Studieschuld en andere verplichtingen verwerken"),
  ).toBeVisible();
  await expect(breakdown.getByText("Inkomen en rente", { exact: true })).toBeVisible();
  await expect(
    breakdown.getByText("Ruimte na verplichtingen", { exact: true }),
  ).toBeVisible();
  await expect(breakdown.getByText("Grens op inkomen", { exact: true })).toBeVisible();
  await expect(
    breakdown.getByText("Uiteindelijke maximum", { exact: true }),
  ).toBeVisible();
  await expect(
    breakdown.getByText(
      "Minder hypotheekruimte op basis van inkomen door studieschuld",
    ),
  ).toBeVisible();
  await expect(
    breakdown.getByText("Eindbedrag na alle grenzen"),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("maximale hypotheek noemt rente en extra leenruimte in de samenvatting", async ({
  page,
}, testInfo) => {
  test.skip(!maximumMortgageEnabled, "Maximale hypotheek is uitgeschakeld");
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop rentevergelijking");

  await page.goto("/apps/artifact-hypotheek-wonen-maximale-hypotheek", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page
    .getByRole("textbox", { name: /^Hypotheekrente/ })
    .fill("4,99");
  await page.getByRole("textbox", { name: /^Koopprijs/ }).fill("1000000");
  await page.getByRole("textbox", { name: /^Woningwaarde/ }).fill("1000000");
  await page.getByRole("combobox", { name: /^NHG gewenst/ }).selectOption("no");
  await page.getByRole("button", { name: "Bereken", exact: true }).click();

  const breakdown = page.getByTestId("mortgage-calculation-breakdown");
  await breakdown.getByText("Zo is dit bedrag opgebouwd").click();
  await expect(
    breakdown.getByText(/Bij een toetsrente van .+ is indicatief .+ meer hypotheek mogelijk\./),
  ).toBeVisible();
  await expect(
    breakdown.getByText(/De alternatieve einduitkomst is .+ Dit komt door een andere officiële financieringslastband/),
  ).toBeVisible();
});

test("maximale hypotheek toont rentelink en salarisverhogingsanalyse", async ({
  page,
}, testInfo) => {
  test.skip(!maximumMortgageEnabled, "Maximale hypotheek is uitgeschakeld");
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/artifact-hypotheek-wonen-maximale-hypotheek", {
    waitUntil: "networkidle",
  });

  const rateLink = page.getByRole("link", {
    name: /Bekijk actuele hypotheekrentes ter inspiratie/,
  });
  await expect(rateLink).toBeVisible();
  await expect(rateLink).toHaveAttribute(
    "href",
    "https://www.geld.nl/hypotheek/hypotheekrente",
  );
  await expect(rateLink).toHaveAttribute("target", "_blank");
  await expect(rateLink).toHaveAttribute("rel", "noopener noreferrer");

  const rateInput = page.getByRole("textbox", { name: /Hypotheekrente/ });
  await rateInput.fill("4,2");
  await expect(rateInput).toHaveValue("4,2");

  await page.goto("/apps/hypotheek-impact-studieschuld", {
    waitUntil: "networkidle",
  });
  const impactRateLink = page.getByRole("link", {
    name: /Bekijk actuele hypotheekrentes ter inspiratie/,
  });
  await expect(impactRateLink).toBeVisible();
  await expect(impactRateLink).toHaveAttribute(
    "href",
    "https://www.geld.nl/hypotheek/hypotheekrente",
  );
  await expect(impactRateLink).toHaveAttribute("target", "_blank");
  await expect(impactRateLink).toHaveAttribute("rel", "noopener noreferrer");
  const impactRateInput = page.getByRole("textbox", {
    name: /Hypotheekrentepercentage/,
  });
  await impactRateInput.fill("4,3");
  await expect(impactRateInput).toHaveValue("4,3");

  await page.goto("/apps/artifact-hypotheek-wonen-maximale-hypotheek", {
    waitUntil: "networkidle",
  });

  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();
  await expect(
    page.locator("#tool-result-summary").getByText("Indicatieve maximale hypotheek"),
  ).toBeVisible();

  await page
    .getByText("Wat doet een salarisverhoging met mijn leenruimte?")
    .click();
  await expect(page.getByText("Huidig bruto jaarinkomen")).toBeVisible();

  await page.getByLabel("Nieuw bruto jaarinkomen slider").fill("81200");
  const newIncomeInput = page.getByRole("textbox", {
    name: /Nieuw bruto jaarinkomen/,
  });
  await expect(newIncomeInput).toHaveValue("81200");
  await expect(page.getByText("+ EUR 100 bruto per maand")).toBeVisible();

  await newIncomeInput.fill("100000");
  await expect(page.getByText("buiten het praktische sliderbereik")).toBeVisible();
  await expect(page.getByText("Gekozen nieuw inkomen")).toBeVisible();
  await expect(page.getByText("Verschil leenruimte gekozen inkomen")).toBeVisible();

  await newIncomeInput.fill("70000");
  await expect(page.getByText("Inkomensverschil")).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Verschil leenruimte" }),
  ).toBeVisible();
  await expect(page.getByText("het verschil in leenruimte kan daardoor negatief zijn")).toBeVisible();

  await page.getByRole("textbox", { name: /^Bruto jaarinkomen/ }).fill("90000");
  await expect(
    page.getByText("Deze analyse gebruikt nog je laatst berekende hypotheekscenario"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Opnieuw beginnen" }).click();
  await page.getByRole("button", { name: "Wis en begin opnieuw" }).click();
  await expect(
    page.getByText("Wat doet een salarisverhoging met mijn leenruimte?"),
  ).toHaveCount(0);
});

test("hypotheek-impact behoudt de externe hypotheekrentelink", async ({
  page,
}, testInfo) => {
  test.skip(!mortgageImpactEnabled, "Zelfstandige hypotheekimpact is uitgeschakeld");
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/hypotheek-impact-studieschuld", {
    waitUntil: "networkidle",
  });
  const rateLink = page.getByRole("link", {
    name: /Bekijk actuele hypotheekrentes ter inspiratie/,
  });
  await expect(rateLink).toBeVisible();
  await expect(rateLink).toHaveAttribute(
    "href",
    "https://www.geld.nl/hypotheek/hypotheekrente",
  );
  await expect(rateLink).toHaveAttribute("target", "_blank");
  await expect(rateLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("DUO-tools tonen de uitgebreide PDF-download", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  for (const route of [
    "/apps/duo-schuld-bij-starten-lenen",
    "/apps/duo-stoppen-kosten-prestatiebeurs",
    "/apps/duo-leenbedrag-impact",
    "/apps/duo-maandbedrag",
    "/apps/duo-extra-aflossen",
  ]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
    await page.getByRole("button", { name: "Bereken", exact: true }).click();
    await expect(page.getByRole("button", { name: "Download overzicht" })).toBeVisible();
  }
});

test("DUO-maandbedrag biedt hypotheekimpact als geneste verdieping", async ({
  page,
}, testInfo) => {
  const isMobile = testInfo.project.name.startsWith("mobile");

  await page.goto("/apps/duo-maandbedrag", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await submitCurrentCalculator(page, isMobile);

  const depthTitle = page.getByText("Wat betekent dit voor mijn hypotheek?", {
    exact: true,
  });
  const income = page.getByLabel("Jouw bruto jaarinkomen");
  await expect(depthTitle).toBeVisible();
  await expect(income).not.toBeVisible();
  await expect(page.getByText("Hoe is dit berekend?", { exact: true })).toHaveCount(0);

  await depthTitle.click();
  await income.fill("65000");
  if (isMobile) {
    await page.getByRole("button", { name: "Volgende", exact: true }).click();
    await page
      .getByRole("button", { name: "Bereken hypotheekimpact", exact: true })
      .click();
  } else {
    await page
      .getByRole("button", { name: "Bereken mijn hypotheekimpact", exact: true })
      .click();
  }

  await expect(page.getByRole("heading", { name: "Jouw hypotheekimpact" })).toBeVisible();
  await expect(page.getByText("Effect op je maximale hypotheek", { exact: true })).toBeVisible();
  const mortgageTable = page.getByText("Bekijk de vergelijking als tabel", { exact: true });
  await mortgageTable.click();
  await expect(page.getByRole("table", { name: /maximale hypotheek zonder en met/ })).toBeVisible();
  await expect(page.getByText("Zonder studieschuld", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Met jouw studieschuld", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Verschil", { exact: true }).first()).toBeVisible();

  const explanationTitle = page.getByText("Hoe is dit berekend?", { exact: true });
  await explanationTitle.click();
  await expect(page.getByText("1. Wettelijk maandbedrag", { exact: true })).toBeVisible();
  await expect(page.getByText("2. Omrekening voor de hypotheek", { exact: true })).toBeVisible();
  await expect(page.getByText("Woonlast die de bank meerekent", { exact: true })).toBeVisible();

  await depthTitle.click();
  await expect(income).not.toBeVisible();
  await depthTitle.click();
  await expect(income).toHaveValue("65000");
  await expect(page.getByRole("heading", { name: "Jouw hypotheekimpact" })).toBeVisible();

  await page.getByRole("button", { name: "Opnieuw beginnen" }).click();
  await page.getByRole("button", { name: "Wis en begin opnieuw" }).click();
  await expect(depthTitle).toHaveCount(0);
});

test("betekenisvolle resultaatgrafieken hebben direct daaronder een uitklaptabel", async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const isMobile = testInfo.project.name.startsWith("mobile");
  const visualisations = [
    {
      route: "/apps/duo-schuld-bij-starten-lenen",
      title: "Zo groeit en daalt je studieschuld",
      table: "Bekijk de schuld per jaar",
    },
    {
      route: "/apps/duo-leenbedrag-impact",
      title: "Verloop van je totale studieschuld",
      table: "Bekijk de schuld per jaar",
    },
    {
      route: "/apps/duo-stoppen-kosten-prestatiebeurs",
      title: "Waaruit bestaat dit bedrag?",
      table: "Bekijk alle schuldonderdelen",
    },
    {
      route: "/apps/duo-extra-aflossen",
      title: "Je schuld vóór en na extra aflossen",
      table: "Bekijk de schuld per jaar",
    },
    {
      route: "/apps/duo-aanvullende-beurs",
      title: "Zo ontstaat je maandbedrag",
      table: "Bekijk de berekening als tabel",
    },
  ];

  for (const visualisation of visualisations) {
    await page.goto(visualisation.route, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Voorbeeld invullen" }).first().click();
    await submitCurrentCalculator(page, isMobile);

    const section = page.getByRole("region", { name: visualisation.title });
    await expect(section, visualisation.route).toBeVisible();
    await expect(section.locator("figure"), visualisation.route).toBeVisible();

    const tableDisclosure = section.getByText(visualisation.table, { exact: true });
    const details = tableDisclosure.locator("xpath=ancestor::details[1]");
    await expect(details, visualisation.route).not.toHaveAttribute("open", "");
    await tableDisclosure.click();
    await expect(details, visualisation.route).toHaveAttribute("open", "");
    await expect(section.getByRole("table"), visualisation.route).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(dimensions.body, visualisation.route).toBeLessThanOrEqual(
      dimensions.viewport + 1,
    );
  }
});

test("gerichte DUO-tools gebruiken begrijpelijke PDF-bestandsnamen", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopdownload controleren");

  for (const { route, filename } of [
    {
      route: "/apps/duo-schuld-bij-starten-lenen",
      filename: /^verwachte-studieschuld-\d{4}-\d{2}\.pdf$/,
    },
    {
      route: "/apps/duo-stoppen-kosten-prestatiebeurs",
      filename: /^kosten-stoppen-zonder-diploma-\d{4}-\d{2}\.pdf$/,
    },
    {
      route: "/apps/duo-leenbedrag-impact",
      filename: /^impact-maandelijks-leenbedrag-\d{4}-\d{2}\.pdf$/,
    },
  ]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
    await page.getByRole("button", { name: "Bereken", exact: true }).click();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download overzicht" }).last().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(filename);
  }
});

test("hypotheek-impact maakt een PDF vanuit de laatst berekende invoer", async ({
  page,
}, testInfo) => {
  test.skip(!mortgageImpactEnabled, "Zelfstandige hypotheekimpact is uitgeschakeld");
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/hypotheek-impact-studieschuld", {
    waitUntil: "networkidle",
  });

  const pdfButton = page.getByRole("button", {
    name: "Download overzicht",
  });
  await expect(pdfButton).toHaveCount(0);

  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();
  await expect(pdfButton).toBeVisible();
  await expect(page.getByText(/Voor jouw situatie is het verplichte DUO-bedrag/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await pdfButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^impact-studieschuld-op-hypotheek-\d{4}-\d{2}\.pdf$/,
  );
  await expect(
    page.getByText("PDF-overzicht gemaakt met de laatst berekende invoer."),
  ).toBeVisible();

  await page.getByRole("textbox", { name: /^Bruto jaarinkomen gebruiker/ }).fill("51000");
  await expect(pdfButton).toHaveCount(0);
  await expect(
    page.getByText("Bereken opnieuw om een actueel PDF-overzicht te downloaden."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Bereken opnieuw" }).click();
  await expect(pdfButton).toBeVisible();

  await page.getByRole("button", { name: "Opnieuw beginnen" }).click();
  await page.getByRole("button", { name: "Wis en begin opnieuw" }).click();
  await expect(pdfButton).toHaveCount(0);
  await expect(
    page.getByText("PDF-overzicht gemaakt met de laatst berekende invoer."),
  ).toHaveCount(0);
});

test("hypotheek-impact haalt DUO-maandbedrag op via expliciete returnflow", async ({
  page,
}, testInfo) => {
  test.skip(!mortgageImpactEnabled, "Zelfstandige hypotheekimpact is uitgeschakeld");
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/hypotheek-impact-studieschuld", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page
    .getByRole("button", { name: "Open DUO-maandbedrag" })
    .click();

  await expect(page).toHaveURL(/\/apps\/duo-maandbedrag\?duoMortgageTransfer=/);
  const duoUrl = new URL(page.url());
  expect([...duoUrl.searchParams.keys()]).toEqual(["duoMortgageTransfer"]);
  expect(duoUrl.search).not.toContain("150");
  expect(duoUrl.search).not.toContain("48000");
  await expect(page.getByText("Je kwam vanuit de hypotheektool")).toBeVisible();
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();

  await page
    .getByRole("button", { name: "Terug naar mijn hypotheekberekening" })
    .click();

  await expect(page).toHaveURL(/\/apps\/hypotheek-impact-studieschuld/);
  await expect(page.getByText("DUO-bedrag uit rekentool")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Dit bedrag gebruiken in mijn hypotheekberekening",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Huidig DUO-maandbedrag" }),
  ).toHaveValue("150");

  await page
    .getByRole("button", {
      name: "Dit bedrag gebruiken in mijn hypotheekberekening",
    })
    .click();

  await expect(
    page.getByText("Klik opnieuw op Bereken om de uitkomst te vernieuwen."),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Huidig DUO-maandbedrag" }),
  ).not.toHaveValue("150");
});

test("v2 routes zijn gepauzeerd voor de publieke livegang", async ({
  page,
}) => {
  for (const route of ["/v2", "/v2/apps", "/v2/apps/toeslagen-scan"]) {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), `${route} should not be public`).toBe(404);
    expect(page.url()).toContain(route);
  }
});

test("homepage verwijst één keer naar het volledige tooloverzicht", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "Bekijk alle tools" })).toBeVisible();
  await expect(page.locator('a[href^="/apps/"]').filter({ hasText: "Open tool" })).toHaveCount(0);

  await page.goto("/apps", { waitUntil: "networkidle" });
  const cards = page.locator('a[href^="/apps/"]').filter({ hasText: "Open tool" });
  await expect(cards.first()).toBeVisible();

  const cardClass = await cards.first().getAttribute("class");
  expect(cardClass).toContain("rounded-[1.25rem]");
  const uniqueToolRoutes = await cards.evaluateAll((links) => [
    ...new Set(links.map((link) => link.getAttribute("href")).filter(Boolean)),
  ] as string[]);
  await expect(cards).toHaveCount(getPublicToolRoutes().length);
  expect(uniqueToolRoutes).toHaveLength(getPublicToolRoutes().length);
  expect(uniqueToolRoutes).not.toContain("/apps/familiehulp-eerste-woning");
  expect(uniqueToolRoutes).not.toContain(allowanceScanRoute);
  expect(uniqueToolRoutes).not.toContain(maximumMortgageRoute);
  expect(uniqueToolRoutes).not.toContain(debtComparisonRoute);
  expect(uniqueToolRoutes.every((route) => !route.startsWith("/v2"))).toBe(true);
  await expect(page.locator('a[href^="/v2"]')).toHaveCount(0);
  await expect(page.getByText("Familiehulp")).toHaveCount(0);
  await expect(page.getByText("Waarom dit rustig blijft")).toHaveCount(0);

  await expect(page.locator(`a[href="${allowanceScanRoute}"]`)).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Welke toeslagen passen mogelijk bij mij?" }),
  ).toHaveCount(0);
});

test("toeslagenscan is uitgeschakeld en nergens publiek gelinkt", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  await page.goto("/apps", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Welke toeslagen passen mogelijk bij mij?" }),
  ).toHaveCount(0);
  await expect(page.locator(`a[href="${allowanceScanRoute}"]`)).toHaveCount(0);

  const response = await page.goto(allowanceScanRoute, { waitUntil: "networkidle" });
  expect(response?.status()).toBe(404);
});

test("maximale hypotheek is uitgeschakeld en nergens publiek gelinkt", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  for (const route of ["/", "/apps"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator(`a[href="${maximumMortgageRoute}"]`)).toHaveCount(0);
  }

  const response = await page.goto(maximumMortgageRoute, { waitUntil: "networkidle" });
  expect(response?.status()).toBe(404);
});

test("schuldenvergelijker is uitgeschakeld en nergens publiek gelinkt", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  for (const route of ["/", "/apps"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator(`a[href="${debtComparisonRoute}"]`)).toHaveCount(0);
  }

  const response = await page.goto(debtComparisonRoute, { waitUntil: "networkidle" });
  expect(response?.status()).toBe(404);
});

test("aanvullende beurs vraagt bij bijzondere oudersituaties geen regulier inkomen", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/duo-aanvullende-beurs", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await page
    .getByLabel("Bijzondere oudersituatie?")
    .selectOption("parent-deceased");

  await expect(page.getByLabel("Hoeveel ouders tellen mee?")).toHaveCount(0);
  await expect(page.getByLabel("Ouderinkomen 2024 ouder 1")).toHaveCount(0);
  await expect(
    page.getByText("Controleer welke ouder DUO nog gebruikt"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Bereken", exact: true }).click();
  await expect(page.getByText("Bijzondere DUO-situatie")).toBeVisible();
  const result = page.locator("#tool-result-summary");
  await expect(result.getByRole("heading", { name: "Wat je nu kunt doen" })).toBeVisible();
  await expect(result.getByText(/welke ouder en welk inkomen bij je aanvullende beurs staan/)).toBeVisible();
  await expect(page.getByText("Niet berekend")).toHaveCount(0);
});

test("hypotheek-impact toont woningdoel alleen na een expliciete keuze", async ({
  page,
}, testInfo) => {
  test.skip(!mortgageImpactEnabled, "Zelfstandige hypotheekimpact is uitgeschakeld");
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/hypotheek-impact-studieschuld", {
    waitUntil: "networkidle",
  });

  const choice = page.getByRole("checkbox", {
    name: /Vergelijk ook met mijn woningdoel/,
  });
  await expect(choice).not.toBeChecked();
  await expect(page.getByLabel("Gewenste woningprijs")).toHaveCount(0);

  await choice.check();
  await expect(page.getByLabel("Gewenste woningprijs")).toBeVisible();
  await page.getByLabel("Gewenste woningprijs").fill("375000");
  await choice.uncheck();
  await expect(page.getByLabel("Gewenste woningprijs")).toHaveCount(0);

  await choice.check();
  await expect(page.getByLabel("Gewenste woningprijs")).toHaveValue("");
});

test("verborgen, uitgeschakelde en v2-routes blijven buiten publieke routes", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  const hiddenResponse = await page.goto("/apps/volgende-euro", { waitUntil: "networkidle" });
  expect(hiddenResponse?.status()).toBe(404);
  const disabledResponse = await page.goto("/apps/familiehulp-eerste-woning", {
    waitUntil: "networkidle",
  });
  expect(disabledResponse?.status()).toBe(404);
  const allowanceScanResponse = await page.goto(allowanceScanRoute, {
    waitUntil: "networkidle",
  });
  expect(allowanceScanResponse?.status()).toBe(404);
  const response404 = await page.goto("/apps/bestaat-niet", {
    waitUntil: "networkidle",
  });
  expect(response404?.status()).toBe(404);

  const v2Response = await page.goto("/v2/apps/toeslagen-scan", {
    waitUntil: "networkidle",
  });
  expect(v2Response?.status()).toBe(404);
  expect(page.url()).toContain("/v2/apps/toeslagen-scan");
});

test("sitemap publiceert geen uitgeschakelde of v2-routes", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  if (response.status() === 404) {
    expect(response.status()).toBe(404);
    return;
  }

  expect(response.status()).toBe(200);
  const sitemap = await response.text();
  expect(sitemap).not.toContain("/v2");
  expect(sitemap).not.toContain(allowanceScanRoute);
  expect(sitemap).not.toContain(maximumMortgageRoute);
  expect(sitemap).not.toContain(debtComparisonRoute);
});

test("onbekende app slug blijft 404", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole");

  const response = await page.goto("/apps/onbekende-tool", {
    waitUntil: "networkidle",
  });
  expect(response?.status()).toBe(404);
});

test("losse DUO-tools tonen simpele scenario-uitkomst en schuldenvrije datum", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  await page.goto("/apps/duo-leenbedrag-impact", { waitUntil: "networkidle" });
  await expect(page.getByLabel("Lening per maand slider")).toBeVisible();
  await page.getByLabel("Lening per maand slider").fill("250");
  await page.getByRole("button", { name: "Voorbeeld invullen" }).first().click();
  await page.getByRole("button", { name: "Bereken", exact: true }).first().click();

  await expect(page.getByRole("heading", { name: "Ik studeer al: impact nieuw leenbedrag per maand" })).toBeVisible();
  await page.getByText("Bekijk de volledige berekening").click();
  await expect(page.getByText("Schuldenvrij rond")).toBeVisible();
  await expect(page.getByText("Totaal terug te betalen inclusief rente")).toBeVisible();
});

test("verwachte eindschuld toont direct het totaal bij regulier aflossen", async ({ page }, testInfo) => {
  await page.goto("/apps/duo-schuld-bij-starten-lenen", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await submitCurrentCalculator(
    page,
    testInfo.project.name.startsWith("mobile"),
  );

  const summary = page.locator("#tool-result-summary");
  await expect(summary.getByText("Verwachte eindschuld", { exact: true })).toBeVisible();
  await expect(
    summary.getByText("Totaal terug te betalen inclusief rente", { exact: true }),
  ).toBeVisible();
  await expect(
    summary.getByText(/Bij regulier aflossen binnen 35 jaar, zonder extra aflossingen of aflosvrije maanden\./),
  ).toBeVisible();

  const width = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(width.body).toBeLessThanOrEqual(width.viewport + 1);
});

test("gerichte DUO-tools tonen op verzoek de hypotheekimpact van de eindschuld", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktopinteractie controleren");

  for (const slug of [
    "duo-schuld-bij-starten-lenen",
    "duo-leenbedrag-impact",
    "duo-stoppen-kosten-prestatiebeurs",
  ]) {
    await page.goto(`/apps/${slug}`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Voorbeeld invullen" }).first().click();
    await page.getByRole("button", { name: "Bereken", exact: true }).first().click();

    const impact = page.getByRole("region", { name: "Hypotheekimpact eindschuld" });
    await expect(impact).toBeVisible();
    await impact
      .getByRole("button", { name: "Bereken impact op hypotheekruimte" })
      .click();

    await expect(impact.getByText("Wettelijk DUO-bedrag", { exact: true })).toBeVisible();
    await expect(impact.getByText("Minder hypotheekruimte", { exact: true })).toBeVisible();
    await expect(impact.getByText(/2,33% voor 2026/)).toBeVisible();
    await expect(impact.getByText(/annuïtair terug in 35 jaar/)).toBeVisible();
  }
});

test("maximaal lenen zonder diploma gebruikt centrale bedragen en hele maanden", async ({
  page,
}) => {
  await page.goto("/apps/duo-schuld-bij-starten-lenen", {
    waitUntil: "networkidle",
  });

  await expect(page.locator("#monthsUntilDiploma")).toHaveAttribute("step", "1");
  await expect(page.locator("#monthlyLoan")).toHaveAttribute("step", "0.01");
  await page.locator("#calculationMonthSlider").fill("7");
  await page
    .getByRole("button", {
      name: "Wat als ik maximaal leen en geen diploma haal?",
    })
    .click();

  const summary = page.locator("#tool-result-summary");
  await expect(
    summary.getByRole("heading", {
      name: "Maximaal lenen en geen diploma halen",
    }),
  ).toBeVisible();
  await expect(
    summary.getByText("Verwachte eindschuld zonder diploma", { exact: true }),
  ).toBeVisible();
  await summary.getByText("Bekijk de volledige berekening").click();
  await expect(
    summary.getByText("Prestatiebeurs die schuld blijft", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#monthlyLoan")).toHaveValue("315.17");
  await expect(page.locator("#monthlyCollegegeldkrediet")).toHaveValue("216.75");
  await expect(page.locator("#monthlyBasisbeurs")).toHaveValue("324.52");
  await expect(page.locator("#monthlyAanvullendeBeurs")).toHaveValue("491.08");
  await expect(page.locator("#monthlyReisproduct")).toHaveValue("110.95");

  const width = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(width.body).toBeLessThanOrEqual(width.viewport + 1);
});

test("DUO-maandbedragen bieden centrale maxima direct in het veld aan", async ({ page }) => {
  test.setTimeout(60_000);
  const isMobile = (page.viewportSize()?.width ?? 0) < 768;

  async function moveToQuestion(question: number, direction: "Volgende" | "Vorige") {
    if (!isMobile) return;

    await page.getByRole("button", { name: direction, exact: true }).click();
    await expect(page.getByText(`Vraag ${question} van 4`, { exact: true })).toBeVisible();
    const fieldId = ["calculationMonth", "monthsUntilDiploma", "monthlyLoan", "repaymentRule"][
      question - 1
    ];
    await expect
      .poll(() =>
        page.locator(`[data-mobile-flow-field="${fieldId}"]`).first().evaluate(
          (element) => element.contains(document.activeElement),
        ),
      )
      .toBe(true);
  }

  async function expectLimitedField(inputId: string, maximum: string, hint: RegExp) {
    const input = page.locator(`#${inputId}`);
    await expect(input).toHaveAttribute("max", maximum);

    const field = input.locator("xpath=ancestor::*[@data-mobile-flow-field][1]");
    const heading = field.locator(":scope > span").first();
    const rightHint = heading.locator(":scope > span").last();
    await expect(rightHint).toHaveText(hint);
    const layout = await heading.evaluate((element) => {
      const parts = element.querySelectorAll(":scope > span");
      const labelRect = parts[0]?.getBoundingClientRect();
      const hintRect = parts[parts.length - 1]?.getBoundingClientRect();
      const headingRect = element.getBoundingClientRect();
      if (!labelRect || !hintRect) return null;

      return {
        headingRight: headingRect.right,
        hintRight: hintRect.right,
        labelRight: labelRect.right,
        labelBottom: labelRect.bottom,
        hintLeft: hintRect.left,
        hintTop: hintRect.top,
        hintBottom: hintRect.bottom,
        labelTop: labelRect.top,
      };
    });
    expect(layout).not.toBeNull();
    expect(
      Math.abs(layout!.headingRight - layout!.hintRight),
      `${inputId}: maximumtoelichting staat niet rechts`,
    ).toBeLessThanOrEqual(1);

    const horizontallySeparated = layout!.labelRight <= layout!.hintLeft + 1;
    const verticallySeparated =
      layout!.labelBottom <= layout!.hintTop + 1 ||
      layout!.hintBottom <= layout!.labelTop + 1;
    expect(
      horizontallySeparated || verticallySeparated,
      `${inputId}: veldlabel overlapt de maximumtoelichting`,
    ).toBe(true);
  }

  await page.goto("/apps/duo-schuld-bij-starten-lenen", {
    waitUntil: "networkidle",
  });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  // Pin this regression scenario to augustus; the default month intentionally follows today.
  await page.locator("#calculationMonthSlider").fill("7");
  await expect(page.locator("#calculationMonthSlider")).toHaveAttribute(
    "aria-valuetext",
    "augustus 2026",
  );
  await expect(page.getByRole("button", { name: "Vorige maand" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Volgende maand" })).toBeVisible();
  await expect(page.getByText("Normen in augustus 2026")).toHaveCount(0);
  await expect(
    page.getByText(
      /Vanaf september 2026 verandert het collegegeldkrediet van €\s*216,75 naar €\s*224,50/,
    ),
  ).toBeVisible();
  if (isMobile) {
    await moveToQuestion(2, "Volgende");
    await moveToQuestion(3, "Volgende");
  }
  await expectLimitedField(
    "monthlyLoan",
    "1083.74",
    /Beschikbaar: €\s*1\.083,74 per maand/,
  );
  const loanField = page.locator('[data-mobile-flow-field="monthlyLoan"]').first();
  await loanField.getByRole("button", { name: /Vul maximaal toegestaan bedrag in/ }).click();
  await expect(page.locator("#monthlyLoan")).toHaveValue("1083.74");
  await expect(page.locator("#monthlyLoan")).toBeFocused();
  await page.locator("#monthlyLoan").fill("500");
  await expect(page.locator("#monthlyLoan")).toHaveValue("500");

  const advanced = page.getByRole("group", {
    name: "Andere studiebedragen (optioneel)",
  });
  await expect(advanced).toBeVisible();
  await expect(advanced).not.toHaveAttribute("open", "");
  await advanced.locator(":scope > summary").click();
  await expect(advanced).toHaveAttribute("open", "");
  await expect(
    advanced.getByRole("button", { name: /Uitwonend.*€\s*324,52/ }),
  ).toBeVisible();
  const additionalGrantHelp = advanced.locator("details").filter({
    hasText: "Benieuwd of je recht hebt op aanvullende beurs?",
  });
  await additionalGrantHelp.locator(":scope > summary").click();
  await expect(
    additionalGrantHelp.getByRole("link", { name: "Bereken mijn aanvullende beurs" }),
  ).toHaveAttribute("href", "/apps/duo-aanvullende-beurs");
  await expectLimitedField(
    "monthlyCollegegeldkrediet",
    "216.75",
    /Max\. €\s*216,75 per maand, €\s*2\.601 ÷ 12/,
  );
  await expectLimitedField(
    "monthlyBasisbeurs",
    "324.52",
    /Max\. €\s*324,52 uitwonend/,
  );
  await expect(
    advanced.locator('[data-mobile-flow-field="monthlyBasisbeurs"]').getByRole("button", {
      name: /Vul maximaal toegestaan bedrag in/,
    }),
  ).toHaveCount(0);
  await expectLimitedField(
    "monthlyAanvullendeBeurs",
    "491.08",
    /Max\. €\s*491,08/,
  );
  await advanced
    .locator('[data-mobile-flow-field="monthlyAanvullendeBeurs"]')
    .getByRole("button", { name: /Vul maximaal toegestaan bedrag in/ })
    .click();
  await expect(page.locator("#monthlyAanvullendeBeurs")).toHaveValue("491.08");
  await expectLimitedField(
    "monthlyReisproduct",
    "110.95",
    /€\s*110,95 zolang dit nog geen gift is/,
  );
  await advanced
    .locator('[data-mobile-flow-field="monthlyReisproduct"]')
    .getByRole("button", { name: /Vul maximaal toegestaan bedrag in/ })
    .click();
  await expect(page.locator("#monthlyReisproduct")).toHaveValue("110.95");

  if (isMobile) {
    await moveToQuestion(2, "Vorige");
    await moveToQuestion(1, "Vorige");
  }
  await page.locator("#calculationMonthSlider").fill("8");
  if (isMobile) {
    await moveToQuestion(2, "Volgende");
    await moveToQuestion(3, "Volgende");
  }
  await expectLimitedField(
    "monthlyCollegegeldkrediet",
    "224.5",
    /Max\. €\s*224,50 per maand, €\s*2\.694 ÷ 12/,
  );
  await advanced
    .locator('[data-mobile-flow-field="monthlyCollegegeldkrediet"]')
    .getByRole("button", { name: /Vul maximaal toegestaan bedrag in/ })
    .click();
  await expect(page.locator("#monthlyCollegegeldkrediet")).toHaveValue("224.5");

  await page.locator("#monthlyCollegegeldkrediet").fill("224.5");
  if (isMobile) {
    await moveToQuestion(2, "Vorige");
    await moveToQuestion(1, "Vorige");
  }
  await page.locator("#calculationMonthSlider").fill("7");
  await expect(page.locator("#monthlyCollegegeldkrediet")).toHaveValue("224.5");
  await page
    .getByRole("button", {
      name: /Pas collegegeldkrediet aan naar €\s*216,75/,
    })
    .click();
  await expect(page.locator("#monthlyCollegegeldkrediet")).toHaveValue("216.75");
  await page.locator("#calculationMonthSlider").fill("8");
  if (isMobile) {
    await moveToQuestion(2, "Volgende");
    await moveToQuestion(3, "Volgende");
  }

  await page.locator("#monthlyLoan").fill("1213.96");
  await expect(
    page.getByText(/Gebruik maximaal €\s*1\.213,95 per maand\./),
  ).toBeVisible();
  if (isMobile) {
    await page.getByRole("button", { name: "Volgende", exact: true }).click();
  } else {
    await expect(page.getByRole("button", { name: "Bereken", exact: true })).toBeDisabled();
  }
  await expect(page.getByText(/Gebruik maximaal €\s*1\.213,95 per maand\./)).toBeVisible();

  await page.goto("/apps/duo-leenbedrag-impact", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voorbeeld invullen" }).click();
  await expect(page.locator("#monthlyLoanSlider")).toHaveAttribute("max", "1213.95");
  await expect(page.getByText(/Max\. €\s*1\.213,95 per maand/)).toBeVisible();

  const width = await page.evaluate(() => ({
    body: document.body.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }));
  expect(width.body).toBeLessThanOrEqual(width.viewport + 1);
});

test("alle zes tools doorlopen invoer, uitkomst, details en vervolgactie", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop productiesmoke");

  const scenarios: ReadonlyArray<{
    route: string;
    calculate?: string;
    pdf: boolean;
  }> = [
    { route: "/apps/duo-aanvullende-beurs", calculate: "Bereken", pdf: false },
    { route: "/apps/duo-extra-aflossen", calculate: "Bereken", pdf: true },
    { route: "/apps/duo-leenbedrag-impact", calculate: "Bereken", pdf: true },
    { route: "/apps/duo-maandbedrag", calculate: "Bereken", pdf: true },
    { route: "/apps/duo-schuld-bij-starten-lenen", calculate: "Bereken", pdf: true },
    {
      route: "/apps/duo-stoppen-kosten-prestatiebeurs",
      calculate: "Bereken",
      pdf: true,
    },
  ];

  for (const scenario of scenarios) {
    const response = await page.goto(scenario.route, { waitUntil: "networkidle" });
    expect(response?.status(), scenario.route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

    const clearButton = page.getByRole("button", { name: "Wis invoer" }).first();
    if (await clearButton.isVisible().catch(() => false)) {
      await clearButton.click();
      await expect(
        page.getByRole("complementary", { name: "Volgende stappen" }),
      ).toHaveCount(0);
    }

    await page.getByRole("button", { name: "Voorbeeld invullen" }).first().click();
    await expect(
      page.getByText("Voorbeeldgegevens ingevuld", { exact: true }),
    ).toBeVisible();
    if (scenario.calculate) {
      await page
        .getByRole("button", { name: scenario.calculate, exact: true })
        .first()
        .click();
    }

    await expect(
      page.getByText("Voorbeeldberekening", { exact: true }),
    ).toBeVisible();
    const nextSteps = page.getByRole("complementary", { name: "Volgende stappen" });
    await expect(nextSteps).toBeVisible();
    await expect(nextSteps.locator("a").first()).toHaveCSS(
      "color",
      "rgb(255, 250, 240)",
    );

    const resultDetails = page.locator("section.order-2 details").first();
    await expect(resultDetails, `${scenario.route} heeft verdiepende details`).toBeVisible();
    await resultDetails.locator(":scope > summary").click();
    await expect(resultDetails).toHaveAttribute("open", "");

    const pdfButton = page.getByRole("button", { name: "Download overzicht" });
    if (scenario.pdf) {
      await expect(pdfButton).toBeVisible();
    } else {
      await expect(pdfButton).toHaveCount(0);
    }
  }
});

test("publieke tools tonen geen interne procesgids", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop routecontrole volstaat");

  for (const route of getPublicToolRoutes()) {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.getByRole("region", { name: "Werking van deze tool" }), route).toHaveCount(0);
    await expect(page.getByText("Wil je weten hoe deze tool werkt?", { exact: true }), route).toHaveCount(0);
  }
});
