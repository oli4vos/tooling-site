export type TaxForm = Record<string, string>;
export type TaxField = { id: string; label: string; help?: string; type: "money" | "number" | "date" | "select"; options?: readonly { value: string; label: string }[]; optional?: boolean; min?: number; max?: number; visible?: (form: TaxForm) => boolean };
export type TaxChartDatum = { key: string; label: string; value: number; formattedValue: string; color?: string };
export type TaxView = { conclusion: string; rows: { label: string; value: string }[]; warnings: string[]; steps: string[]; table?: { headers: string[]; rows: string[][] }; chart?: { title: string; description: string; data: TaxChartDatum[] }; sources: { title: string; url: string }[]; version: string; verifiedAt: string };
export type TaxToolConfig = { title: string; intro: string; scope: string; fields: TaxField[]; empty: TaxForm; example: TaxForm; calculate: (form: TaxForm) => TaxView };
