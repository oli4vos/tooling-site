"use client";
import { TaxCalculator } from "../_tax_shared/TaxCalculator";
import { config } from "./logic";
export default function Calculator() { return <TaxCalculator config={config} />; }
