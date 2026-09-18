import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("public routing scope", () => {
  it("keeps v2 outside the public Next app routes", () => {
    const appDirectory = path.join(process.cwd(), "src/app");

    expect(fs.existsSync(path.join(appDirectory, "v2"))).toBe(false);
    expect(fs.existsSync(path.join(appDirectory, "_v2-paused", "v2"))).toBe(true);
  });

  it("keeps the legal information available as public routes", () => {
    const appDirectory = path.join(process.cwd(), "src/app");
    const footer = fs.readFileSync(
      path.join(process.cwd(), "src/components/SiteFooter.tsx"),
      "utf8",
    );

    expect(fs.existsSync(path.join(appDirectory, "privacy", "page.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(appDirectory, "voorwaarden", "page.tsx"))).toBe(true);
    expect(footer).toContain('href="/privacy"');
    expect(footer).toContain('href="/voorwaarden"');
    expect(footer).toContain('href="https://github.com/oli4vos/projectwebsite"');
  });

  it("keeps Grip's independent private status visible on public pages", () => {
    const footer = fs.readFileSync(
      path.join(process.cwd(), "src/components/SiteFooter.tsx"),
      "utf8",
    );
    const overPage = fs.readFileSync(
      path.join(process.cwd(), "src/app/over/page.tsx"),
      "utf8",
    );
    const toolPage = fs.readFileSync(
      path.join(process.cwd(), "src/app/apps/[slug]/page.tsx"),
      "utf8",
    );

    expect(footer).toContain("GRIP_INDEPENDENCE_SHORT");
    expect(overPage).toContain("GRIP_INDEPENDENCE_FULL");
    expect(overPage).toContain("geen toegang tot Mijn DUO");
    expect(toolPage).toContain("ToolIndependenceNotice");
  });
});
