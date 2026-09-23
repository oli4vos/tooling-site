import { describe, expect, it } from "vitest";
import { calculateZvw } from "./zvw";

describe("central Zvw 2026 rules", () => {
  it("uses the employer rate without reducing employee net", () => {
    const result = calculateZvw({
      year: 2026,
      lines: [{ incomeCents: 4_000_000, mode: "employer", label: "Loon" }],
    });

    expect(result.employerCents).toBe(244_000);
    expect(result.employeeCents).toBe(0);
  });

  it("uses the employee rate for pension withholding", () => {
    const result = calculateZvw({
      year: 2026,
      lines: [{ incomeCents: 4_000_000, mode: "employee", label: "Pensioen" }],
    });

    expect(result.employeeCents).toBe(194_000);
  });

  it("shares the contribution cap across mixed employment lines", () => {
    const result = calculateZvw({
      year: 2026,
      lines: [
        { incomeCents: 8_000_000, mode: "employer", label: "Loon" },
        { incomeCents: 2_000_000, mode: "self-employed", label: "Winst" },
      ],
    });

    expect(result.contributionIncomeCents).toBe(7_940_900);
    expect(result.rows[1].cappedIncomeCents).toBe(0);
  });
});
