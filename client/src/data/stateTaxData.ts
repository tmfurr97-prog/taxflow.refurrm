export interface StateTaxInfo {
  name: string;
  rate: number;
  hasIncomeTax: boolean;
  standardDeduction?: number;
}

export const stateTaxData: Record<string, StateTaxInfo> = {
  AL: { name: 'Alabama', rate: 0.05, hasIncomeTax: true, standardDeduction: 2500 },
  AK: { name: 'Alaska', rate: 0, hasIncomeTax: false },
  AZ: { name: 'Arizona', rate: 0.025, hasIncomeTax: true, standardDeduction: 12950 },
  AR: { name: 'Arkansas', rate: 0.047, hasIncomeTax: true, standardDeduction: 2200 },
  CA: { name: 'California', rate: 0.093, hasIncomeTax: true, standardDeduction: 4803 },
  CO: { name: 'Colorado', rate: 0.044, hasIncomeTax: true, standardDeduction: 12950 },
  CT: { name: 'Connecticut', rate: 0.0699, hasIncomeTax: true, standardDeduction: 0 },
  DE: { name: 'Delaware', rate: 0.066, hasIncomeTax: true, standardDeduction: 3250 },
  FL: { name: 'Florida', rate: 0, hasIncomeTax: false },
  GA: { name: 'Georgia', rate: 0.055, hasIncomeTax: true, standardDeduction: 5400 },
  HI: { name: 'Hawaii', rate: 0.11, hasIncomeTax: true, standardDeduction: 2200 },
  ID: { name: 'Idaho', rate: 0.058, hasIncomeTax: true, standardDeduction: 12950 },
  IL: { name: 'Illinois', rate: 0.0495, hasIncomeTax: true, standardDeduction: 0 },
  IN: { name: 'Indiana', rate: 0.0305, hasIncomeTax: true, standardDeduction: 1000 },
  IA: { name: 'Iowa', rate: 0.06, hasIncomeTax: true, standardDeduction: 2210 },
  KS: { name: 'Kansas', rate: 0.057, hasIncomeTax: true, standardDeduction: 3500 },
  KY: { name: 'Kentucky', rate: 0.045, hasIncomeTax: true, standardDeduction: 2770 },
  LA: { name: 'Louisiana', rate: 0.0425, hasIncomeTax: true, standardDeduction: 4500 },
  ME: { name: 'Maine', rate: 0.0715, hasIncomeTax: true, standardDeduction: 12950 },
  MD: { name: 'Maryland', rate: 0.0575, hasIncomeTax: true, standardDeduction: 2400 },
  MA: { name: 'Massachusetts', rate: 0.05, hasIncomeTax: true, standardDeduction: 0 },
  MI: { name: 'Michigan', rate: 0.0425, hasIncomeTax: true, standardDeduction: 4900 },
  MN: { name: 'Minnesota', rate: 0.0985, hasIncomeTax: true, standardDeduction: 12950 },
  MS: { name: 'Mississippi', rate: 0.05, hasIncomeTax: true, standardDeduction: 2300 },
  MO: { name: 'Missouri', rate: 0.048, hasIncomeTax: true, standardDeduction: 12950 },
  MT: { name: 'Montana', rate: 0.0675, hasIncomeTax: true, standardDeduction: 4790 },
  NE: { name: 'Nebraska', rate: 0.0664, hasIncomeTax: true, standardDeduction: 7100 },
  NV: { name: 'Nevada', rate: 0, hasIncomeTax: false },
  NH: { name: 'New Hampshire', rate: 0.04, hasIncomeTax: true, standardDeduction: 0 },
  NJ: { name: 'New Jersey', rate: 0.1075, hasIncomeTax: true, standardDeduction: 0 },
  NM: { name: 'New Mexico', rate: 0.059, hasIncomeTax: true, standardDeduction: 12950 },
  NY: { name: 'New York', rate: 0.109, hasIncomeTax: true, standardDeduction: 8000 },
  NC: { name: 'North Carolina', rate: 0.0475, hasIncomeTax: true, standardDeduction: 10750 },
  ND: { name: 'North Dakota', rate: 0.025, hasIncomeTax: true, standardDeduction: 12950 },
  OH: { name: 'Ohio', rate: 0.035, hasIncomeTax: true, standardDeduction: 2400 },
  OK: { name: 'Oklahoma', rate: 0.0475, hasIncomeTax: true, standardDeduction: 6350 },
  OR: { name: 'Oregon', rate: 0.099, hasIncomeTax: true, standardDeduction: 2420 },
  PA: { name: 'Pennsylvania', rate: 0.0307, hasIncomeTax: true, standardDeduction: 0 },
  RI: { name: 'Rhode Island', rate: 0.0599, hasIncomeTax: true, standardDeduction: 9300 },
  SC: { name: 'South Carolina', rate: 0.07, hasIncomeTax: true, standardDeduction: 12950 },
  SD: { name: 'South Dakota', rate: 0, hasIncomeTax: false },
  TN: { name: 'Tennessee', rate: 0, hasIncomeTax: false },
  TX: { name: 'Texas', rate: 0, hasIncomeTax: false },
  UT: { name: 'Utah', rate: 0.0485, hasIncomeTax: true, standardDeduction: 12950 },
  VT: { name: 'Vermont', rate: 0.0875, hasIncomeTax: true, standardDeduction: 6350 },
  VA: { name: 'Virginia', rate: 0.0575, hasIncomeTax: true, standardDeduction: 4500 },
  WA: { name: 'Washington', rate: 0, hasIncomeTax: false },
  WV: { name: 'West Virginia', rate: 0.065, hasIncomeTax: true, standardDeduction: 0 },
  WI: { name: 'Wisconsin', rate: 0.0765, hasIncomeTax: true, standardDeduction: 11790 },
  WY: { name: 'Wyoming', rate: 0, hasIncomeTax: false },
  DC: { name: 'Washington D.C.', rate: 0.0895, hasIncomeTax: true, standardDeduction: 12950 },
};

// Extended interface for components that need more fields
export interface StateTaxInfoExtended extends StateTaxInfo {
  brackets?: Array<{ min: number; max: number | null; rate: number }>;
  taxRate?: number;
  formName?: string;
  flatTax?: boolean;
  code?: string;
  quarterlyDates?: { q1?: string; q2?: string; q3?: string; q4?: string };
  stateSpecificDeductions?: Array<{ name: string; amount: number }>;
  estimatedPayments?: number;
}

export function getStateTaxInfoExtended(code: string): StateTaxInfoExtended {
  const base = stateTaxData[code];
  if (!base) return { name: 'Unknown', rate: 0, hasIncomeTax: false };
  return {
    ...base,
    taxRate: base.rate,
    formName: `State Form ${code}`,
    flatTax: false,
    code,
    quarterlyDates: { q1: '04/15', q2: '06/15', q3: '09/15', q4: '01/15' },
    estimatedPayments: 0,
    stateSpecificDeductions: [
      { name: 'Standard Deduction', amount: base.standardDeduction || 0 },
    ],
    brackets: [
      { min: 0, max: 10000, rate: base.rate * 0.5 },
      { min: 10000, max: 50000, rate: base.rate * 0.75 },
      { min: 50000, max: null, rate: base.rate },
    ],
  };
}
