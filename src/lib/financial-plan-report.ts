import type { FinancialPlanInput, FinancialPlanResult } from "@/lib/financial-plan";

type PdfDocument = {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
  addPage: () => PdfDocument;
  setPage: (pageNumber: number) => PdfDocument;
  getNumberOfPages: () => number;
  setFont: (fontName: string, fontStyle?: "normal" | "bold") => PdfDocument;
  setFontSize: (size: number) => PdfDocument;
  setTextColor: (r: number, g?: number, b?: number) => PdfDocument;
  setDrawColor: (r: number, g?: number, b?: number) => PdfDocument;
  setFillColor: (r: number, g?: number, b?: number) => PdfDocument;
  rect: (x: number, y: number, width: number, height: number, style?: "S" | "F" | "FD") => PdfDocument;
  roundedRect: (x: number, y: number, width: number, height: number, rx: number, ry?: number, style?: "S" | "F" | "FD") => PdfDocument;
  line: (x1: number, y1: number, x2: number, y2: number) => PdfDocument;
  text: (text: string | string[], x: number, y: number, options?: { maxWidth?: number; align?: "left" | "right" }) => PdfDocument;
  splitTextToSize: (text: string, size: number) => string[];
  save: (filename: string) => void;
};

const MARGIN = 40;
const colors = { paper: [247, 245, 240], white: [255, 255, 255], ink: [25, 32, 35], muted: [93, 102, 104], hair: [216, 216, 210], accent: [107, 133, 88] } as const;

function currency(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function fill(doc: PdfDocument, color: readonly [number, number, number]) { doc.setFillColor(...color); }
function ink(doc: PdfDocument, color: readonly [number, number, number]) { doc.setTextColor(...color); }

function panel(doc: PdfDocument, y: number, title: string, lines: Array<[string, string]>, subtitle?: string) {
  const width = doc.internal.pageSize.getWidth() - MARGIN * 2;
  const height = 52 + lines.length * 28 + (subtitle ? 16 : 0);
  fill(doc, colors.white); doc.setDrawColor(...colors.hair); doc.roundedRect(MARGIN, y, width, height, 12, 12, "FD");
  doc.setFont("helvetica", "bold"); doc.setFontSize(12); ink(doc, colors.ink); doc.text(title, MARGIN + 16, y + 22);
  if (subtitle) { doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); ink(doc, colors.muted); doc.text(subtitle, MARGIN + 16, y + 36); }
  let lineY = y + (subtitle ? 56 : 44);
  lines.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); ink(doc, colors.muted); doc.text(label, MARGIN + 16, lineY);
    doc.setFont("courier", "bold"); ink(doc, colors.ink); doc.text(value, MARGIN + width - 16, lineY, { align: "right" });
    lineY += 28;
  });
  return y + height + 10;
}

function paragraphPage(doc: PdfDocument, result: FinancialPlanResult) {
  const yearlyBatches = Array.from({ length: Math.ceil(result.yearly.length / 12) }, (_, index) => result.yearly.slice(index * 12, index * 12 + 12));
  yearlyBatches.forEach((batch, index) => {
    doc.addPage();
    fill(doc, colors.paper); doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F");
    panel(doc, MARGIN, index === 0 ? "Jaarlijkse route" : "Jaarlijkse route (vervolg)", batch.map((point): [string, string] => [
      `Jaar ${point.year}`,
      `${currency(point.totalAssets)} | inleg ${currency(point.contributions)} | groei ${currency(point.growth)}`,
    ]));
  });
  doc.addPage();
  fill(doc, colors.paper); doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F");
  let y = MARGIN;
  const guidance = result.nextSteps.map((step, index): [string, string] => [`${index + 1}. ${step.title}`, step.detail]);
  y = panel(doc, y, "Logische vervolgstappen", guidance);
  const warningLines = result.warnings.map((warning, index): [string, string] => [`${index + 1}`, warning]);
  panel(doc, y, "Aannames en grenzen", warningLines);
}

export async function downloadFinancialPlanPdf(input: FinancialPlanInput, result: FinancialPlanResult) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true }) as unknown as PdfDocument;
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  fill(doc, colors.paper); doc.rect(0, 0, width, height, "F");
  fill(doc, colors.white); doc.setDrawColor(...colors.hair); doc.roundedRect(MARGIN, MARGIN, width - MARGIN * 2, 112, 14, 14, "FD");
  fill(doc, colors.accent); doc.roundedRect(MARGIN + 16, MARGIN + 16, 5, 54, 2, 2, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(21); ink(doc, colors.ink); doc.text("Mijn financiële planning", MARGIN + 34, MARGIN + 38);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); ink(doc, colors.muted);
  doc.text(`Gemaakt op ${new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(new Date())}. Scenario voor ${result.horizonYears} jaar.`, MARGIN + 34, MARGIN + 58, { maxWidth: width - MARGIN * 2 - 52 });
  doc.text("IPC Ole - lokaal berekend scenario, geen persoonlijk financieel of belastingadvies.", MARGIN + 34, MARGIN + 82, { maxWidth: width - MARGIN * 2 - 52 });
  let y = 170;
  y = panel(doc, y, "Mijn uitgangspunt", [
    ["Start spaargeld", currency(input.currentSavings ?? 0)], ["Start beleggingen", currency(input.currentInvestments ?? 0)],
    ["Maandelijkse spaarinleg", currency(input.monthlySavingsContribution ?? 0)], ["Maandelijkse beleggingsinleg", currency(input.monthlyInvestmentsContribution ?? 0)],
  ]);
  y = panel(doc, y, "Mijn plan", [
    ["Eindvermogen", currency(result.endingAssets)], ["Waarvan spaargeld", currency(result.endingSavings)], ["Waarvan beleggingen", currency(result.endingInvestments)],
    ["Totale eigen inleg", currency(result.totalContributions)], ["Scenario-groei", currency(result.totalGrowth)], ["Indicatieve Box 3 in eindjaar", currency(result.endingBox3Tax)],
  ], `Belastingjaar ${result.year}; ${input.box3Method === "actual" ? "werkelijk rendement" : "forfaitair rendement"}.`);
  if (result.fireTarget !== null) {
    y = panel(doc, y, "Financiële vrijheid", [["Indicatief FIRE-doel", currency(result.fireTarget)], ["Verschil op eindhorizon", currency(result.fireGap ?? 0)]]);
  }
  paragraphPage(doc, result);
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page); doc.setDrawColor(...colors.hair); doc.line(MARGIN, height - 30, width - MARGIN, height - 30);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); ink(doc, colors.muted); doc.text("IPC Ole - financiële planning", MARGIN, height - 17); doc.text(`Pagina ${page} van ${total}`, width - MARGIN, height - 17, { align: "right" });
  }
  doc.save(`financiele-planning-${result.year}.pdf`);
}
