import type { SimpleDuoToolMode, SimpleDuoValues, SimpleDuoView } from "./focused-logic";

type ValidSimpleDuoView = Extract<SimpleDuoView, { isValid: true }>;

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

type PdfLine = { label: string; value: string; note?: string };

export type FocusedDuoPdfReport = {
  title: string;
  subtitle: string;
  generatedAt: string;
  summaryLines: PdfLine[];
  inputLines: PdfLine[];
  explanation: string[];
  sources: Array<{ label: string; url: string }>;
  disclaimer: string;
};

const MARGIN = 42;
const COLORS = {
  paper: [247, 245, 240] as const,
  card: [255, 255, 255] as const,
  ink: [24, 24, 23] as const,
  muted: [102, 102, 98] as const,
  hair: [220, 218, 212] as const,
  accent: [61, 91, 132] as const,
  accentSoft: [231, 236, 243] as const,
};

const modeTitles: Record<SimpleDuoToolMode, { title: string; subtitle: string; subject: string }> = {
  "start-borrowing": {
    title: "Verwachte studieschuld als je gaat lenen",
    subtitle: "Je invoer, verwachte eindschuld en totale terugbetaling in één overzicht.",
    subject: "verwachte-studieschuld",
  },
  "stop-cost": {
    title: "Kosten van stoppen zonder diploma",
    subtitle: "Welke prestatiebeursdelen schuld blijven en wat je naar verwachting terugbetaalt.",
    subject: "kosten-stoppen-zonder-diploma",
  },
  "monthly-impact": {
    title: "Impact van je maandelijkse leenbedrag",
    subtitle: "Hoe je gekozen leenbedrag je schuld bij diploma en terugbetaling verandert.",
    subject: "impact-maandelijks-leenbedrag",
  },
};

function formatCurrency(value: number, digits = 0) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatInputCurrency(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? formatCurrency(parsed, 2) : "Niet ingevuld";
}

function getSelectedScenario(mode: SimpleDuoToolMode, view: ValidSimpleDuoView) {
  if (view.focusScenario.key === "max-borrowing-no-diploma") {
    return view.result.scenarios.find((scenario) => scenario.key === "continue-no-diploma");
  }
  if (mode === "stop-cost") {
    return view.result.scenarios.find((scenario) => scenario.key === "stop-now-no-diploma");
  }
  return view.result.scenarios.find((scenario) => scenario.key === "continue-to-diploma");
}

export function buildFocusedDuoPdfReport(
  mode: SimpleDuoToolMode,
  values: SimpleDuoValues,
  view: ValidSimpleDuoView,
  generatedAt = new Date(),
): FocusedDuoPdfReport {
  const scenario = getSelectedScenario(mode, view);
  const titleCopy = modeTitles[mode];
  const commonResultLines: PdfLine[] = [
    {
      label: "Schuld bij start terugbetaling",
      value: formatCurrency(view.focusScenario.debtAtRepaymentStart),
    },
    {
      label: "Totaal terug te betalen inclusief rente",
      value: formatCurrency(view.focusScenario.totalPaid),
      note: `Bij regulier aflossen binnen ${view.focusScenario.repaymentTermYears} jaar, zonder extra aflossingen of aflosvrije maanden.`,
    },
    { label: "Rente tijdens terugbetaling", value: formatCurrency(view.focusScenario.totalInterest) },
    { label: "Naar verwachting schuldenvrij", value: view.focusScenario.payoffDate ?? "Niet te bepalen" },
  ];

  const summaryLines: PdfLine[] = mode === "monthly-impact"
    ? [
        { label: "Extra schuld door dit leenbedrag", value: formatCurrency(view.focusScenario.primaryAmount) },
        { label: "Verwachte totale schuld bij diploma", value: formatCurrency(scenario?.debtAtStop.total ?? 0) },
        ...commonResultLines,
      ]
    : mode === "stop-cost"
      ? [
          { label: "Prestatiebeurs die schuld blijft", value: formatCurrency(view.focusScenario.primaryAmount) },
          { label: "Totale schuld bij stoppen", value: formatCurrency(scenario?.debtAtStop.total ?? 0) },
          { label: "Basisbeurs die schuld blijft", value: formatCurrency(scenario?.debtAtStop.basisbeurs ?? 0) },
          { label: "Aanvullende beurs die schuld blijft", value: formatCurrency(scenario?.debtAtStop.aanvullendeBeurs ?? 0) },
          { label: "Reisproduct dat schuld blijft", value: formatCurrency(scenario?.debtAtStop.reisproduct ?? 0) },
          ...commonResultLines,
        ]
      : [
          { label: view.focusScenario.primaryLabel, value: formatCurrency(view.focusScenario.primaryAmount) },
          { label: view.focusScenario.secondaryLabel, value: formatCurrency(view.focusScenario.secondaryAmount) },
          ...commonResultLines,
        ];

  const inputLines: PdfLine[] = [
    { label: "Berekening vanaf", value: view.result.calculationMonth },
    ...(mode !== "stop-cost"
      ? [
          { label: "Resterende studieduur", value: `${values.monthsUntilDiploma} maanden` },
          { label: "Lening per maand", value: formatInputCurrency(values.monthlyLoan) },
          { label: "Collegegeldkrediet per maand", value: formatInputCurrency(values.monthlyCollegegeldkrediet) },
          { label: "Basisbeurs per maand", value: formatInputCurrency(values.monthlyBasisbeurs) },
          { label: "Aanvullende beurs per maand", value: formatInputCurrency(values.monthlyAanvullendeBeurs) },
          { label: "Reisproduct per maand", value: formatInputCurrency(values.monthlyReisproduct) },
        ]
      : [
          { label: "Huidige lening", value: formatInputCurrency(values.currentLoanDebt) },
          { label: "Huidig collegegeldkrediet", value: formatInputCurrency(values.currentCollegegeldkredietDebt) },
          { label: "Basisbeurs als prestatiebeurs", value: formatInputCurrency(values.currentBasisbeursDebt) },
          { label: "Aanvullende beurs als prestatiebeurs", value: formatInputCurrency(values.currentAanvullendeBeursDebt) },
          { label: "Reisproduct als prestatiebeurs", value: formatInputCurrency(values.currentReisproductDebt) },
        ]),
    { label: "Terugbetaling", value: `${view.focusScenario.repaymentTermYears} jaar (SF35)` },
    { label: "Gekozen DUO-rentejaar", value: values.duoRateYear },
  ];

  return {
    title: titleCopy.title,
    subtitle: titleCopy.subtitle,
    generatedAt: new Intl.DateTimeFormat("nl-NL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(generatedAt),
    summaryLines,
    inputLines,
    explanation: [
      view.focusScenario.description,
      view.focusScenario.note,
      "De webpagina en deze PDF gebruiken exact dezelfde berekende uitkomst. Controleer persoonlijke bedragen en je regeling in Mijn DUO.",
    ],
    sources: view.result.sources.slice(0, 4).map((source) => ({
      label: `${source.organization}: ${source.title}`,
      url: source.url,
    })),
    disclaimer:
      "Dit is een indicatie op basis van je invoer en openbare DUO-regels. Het is geen DUO-beschikking en geen persoonlijk financieel advies.",
  };
}

export function focusedDuoReportFileName(mode: SimpleDuoToolMode, view: ValidSimpleDuoView) {
  return `${modeTitles[mode].subject}-${view.result.calculationMonth}.pdf`;
}

function renderFocusedDuoPdf(doc: PdfDocument, report: FocusedDuoPdfReport) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  let y = MARGIN;

  function background() {
    doc.setFillColor(...COLORS.paper);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  }

  function nextPage() {
    doc.addPage();
    background();
    y = MARGIN;
  }

  function ensureSpace(height: number) {
    if (y + height > pageHeight - 58) nextPage();
  }

  function sectionTitle(title: string) {
    ensureSpace(38);
    doc.setFillColor(...COLORS.accentSoft);
    doc.roundedRect(MARGIN, y, contentWidth, 32, 8, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.ink);
    doc.text(title, MARGIN + 12, y + 20);
    y += 42;
  }

  function line(row: PdfLine) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const labelLines = doc.splitTextToSize(row.label, contentWidth * 0.46);
    const valueLines = doc.splitTextToSize(row.value, contentWidth * 0.46);
    const noteLines = row.note ? doc.splitTextToSize(row.note, contentWidth - 20) : [];
    const height = Math.max(labelLines.length, valueLines.length) * 13 + noteLines.length * 10 + 18;
    ensureSpace(height);
    doc.setFillColor(...COLORS.card);
    doc.setDrawColor(...COLORS.hair);
    doc.roundedRect(MARGIN, y, contentWidth, height - 6, 7, 7, "FD");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.ink);
    doc.text(labelLines, MARGIN + 10, y + 16, { maxWidth: contentWidth * 0.46 });
    doc.setFont("helvetica", "normal");
    doc.text(valueLines, pageWidth - MARGIN - 10, y + 16, {
      align: "right",
      maxWidth: contentWidth * 0.46,
    });
    if (noteLines.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.muted);
      doc.text(noteLines, MARGIN + 10, y + Math.max(labelLines.length, valueLines.length) * 13 + 15, {
        maxWidth: contentWidth - 20,
      });
    }
    y += height;
  }

  function paragraph(value: string) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(value, contentWidth);
    const height = lines.length * 12 + 10;
    ensureSpace(height);
    doc.setTextColor(...COLORS.muted);
    doc.text(lines, MARGIN, y + 10, { maxWidth: contentWidth });
    y += height;
  }

  background();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...COLORS.ink);
  const titleLines = doc.splitTextToSize(report.title, contentWidth);
  doc.text(titleLines, MARGIN, y + 18, { maxWidth: contentWidth });
  y += titleLines.length * 22 + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  const subtitleLines = doc.splitTextToSize(report.subtitle, contentWidth);
  doc.text(subtitleLines, MARGIN, y + 10, { maxWidth: contentWidth });
  y += subtitleLines.length * 12 + 10;
  doc.setFontSize(8.5);
  doc.text(`Gemaakt op ${report.generatedAt}`, MARGIN, y + 8);
  y += 24;

  sectionTitle("Jouw uitkomst");
  report.summaryLines.forEach(line);
  sectionTitle("Jouw invoer");
  report.inputLines.forEach(line);
  sectionTitle("Wat dit betekent");
  report.explanation.forEach(paragraph);
  sectionTitle("Bronnen en voorbehoud");
  report.sources.forEach((source) => line({ label: source.label, value: source.url }));
  paragraph(report.disclaimer);

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...COLORS.hair);
    doc.line(MARGIN, pageHeight - 32, pageWidth - MARGIN, pageHeight - 32);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text("Grip · studieschuld", MARGIN, pageHeight - 18);
    doc.text(`Pagina ${page} van ${totalPages}`, pageWidth - MARGIN, pageHeight - 18, { align: "right" });
  }
}

export async function downloadFocusedDuoPdfReport(
  mode: SimpleDuoToolMode,
  values: SimpleDuoValues,
  view: ValidSimpleDuoView,
) {
  const { jsPDF } = await import("jspdf");
  const report = buildFocusedDuoPdfReport(mode, values, view);
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  renderFocusedDuoPdf(doc as unknown as PdfDocument, report);
  doc.save(focusedDuoReportFileName(mode, view));
}
