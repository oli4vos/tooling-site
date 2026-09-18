import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  GRIP_DUO_CONTEXT,
  GRIP_INDEPENDENCE_FULL,
  GRIP_INDEPENDENCE_SHORT,
} from "@/lib/trust-copy";

function readAppManifest(slug: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "apps", slug, "app.json"), "utf8"),
  ) as { enabled: boolean; visibility?: string };
}

function collectPublicCopyFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === "_v2-paused" ? [] : collectPublicCopyFiles(entryPath);
    }

    return /\.(?:ts|tsx)$/.test(entry.name) ? [entryPath] : [];
  });
}

describe("Grip trust positioning", () => {
  it("states the independent private position without implying government affiliation", () => {
    expect(GRIP_INDEPENDENCE_SHORT).toContain("onafhankelijk privé-initiatief");
    expect(GRIP_INDEPENDENCE_FULL).toContain("privaat ontwikkeld initiatief");
    expect(GRIP_INDEPENDENCE_FULL).toContain("niet verbonden aan of onderdeel van DUO");
    expect(GRIP_INDEPENDENCE_FULL).toContain("geen samenwerking");
    expect(GRIP_DUO_CONTEXT).toContain("Grip berekent dit zelf");
    expect(GRIP_DUO_CONTEXT).toContain("geen koppeling met Mijn DUO");
  });

  it("does not present Grip as an official DUO service or system integration", () => {
    const publicCopy = collectPublicCopyFiles(path.join(process.cwd(), "src", "app"))
      .concat(collectPublicCopyFiles(path.join(process.cwd(), "src", "components")))
      .map((file) => fs.readFileSync(file, "utf8").toLowerCase())
      .join("\n");

    expect(publicCopy).not.toMatch(/offici[eë]le duo-(?:dienst|calculator|tool)/);
    expect(publicCopy).not.toContain("namens duo");
    expect(publicCopy).not.toMatch(/(?:we|grip) halen .{0,60} uit mijn duo/);
  });

  it("keeps specifically excluded public tools disabled", () => {
    for (const slug of ["artifact-hypotheek-wonen-maximale-hypotheek", "toeslagen-scan"]) {
      const manifest = readAppManifest(slug);
      expect(manifest.enabled, slug).toBe(false);
    }
  });
});
