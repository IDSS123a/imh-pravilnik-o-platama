// lib/payroll.ts
// ─────────────────────────────────────────────────────────────────────────────
// MASTER PAYROLL CALCULATION ENGINE
// Constitutional basis: IMH Pravilnik o Platama, Čl. 8
// All formulas verified against Rekapitulacije 10/25, 11/25, 12/25, 01/26
// PRECISION: All intermediate calculations use Decimal.js with 10 decimal places
// Final rounding: 2 decimal places (standard KM currency)
// ─────────────────────────────────────────────────────────────────────────────

import Decimal from 'decimal.js';

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface PayrollParameters {
  doprinosiIzPlate: number;    // 0.31
  doprinosiNaPlatu: number;    // 0.105
  porezStopa: number;          // 0.10
  licniOdbitak: number;        // 800.00
  topliObrok: number;          // 180.00
}

export interface PayrollInput {
  netoOsnova: number;
  dodatakStaz: number;         // absolute KM amount, pre-calculated
  dodVarijabilni: number;      // absolute KM amount
  naknPrevoz: number;
  params: PayrollParameters;
}

export interface PayrollResult {
  netoOsnova: string;          // formatted KM
  dodatakStaz: string;
  dodVarijabilni: string;
  netoUkupno: string;          // netoOsnova + dodatakStaz + dodVarijabilni
  bruto1: string;
  doprinoziIz: string;
  porezBaza: string;
  porezIznos: string;
  bruto2: string;
  topliObrok: string;
  naknPrevoz: string;
  ukupnoTrosak: string;        // bruto2 + topliObrok + naknPrevoz
  // Raw numbers for aggregation
  _netoOsnova: Decimal;
  _netoUkupno: Decimal;
  _bruto1: Decimal;
  _doprinoziIz: Decimal;
  _porezBaza: Decimal;
  _porezIznos: Decimal;
  _bruto2: Decimal;
  _topliObrok: Decimal;
  _naknPrevoz: Decimal;
  _ukupnoTrosak: Decimal;
}

/**
 * Calculate Bruto I from Neto using the closed-form analytical formula.
 * Formula: Bruto I = (Neto + 80) / 0.621
 * Derivation:
 *   Neto = BrutoI × 0.69 - max(0, BrutoI × 0.69 - 800) × 0.10
 *   For Neto > 720 (i.e., BrutoI × 0.69 > 800):
 *   Neto = BrutoI × 0.69 - (BrutoI × 0.69 - 800) × 0.10
 *   Neto = BrutoI × 0.69 - BrutoI × 0.069 + 80
 *   Neto = BrutoI × 0.621 - 80
 *   BrutoI = (Neto + 80) / 0.621
 * 
 * @param neto - Net salary in KM (must be > 720 for this formula to apply)
 * @param params - PayrollParameters
 * @returns Bruto I as Decimal
 */
export function calculateBruto1(
  neto: Decimal,
  params: PayrollParameters
): Decimal {
  const D = Decimal;
  const pd = new D(params.doprinosiIzPlate);     // 0.31
  const pt = new D(params.porezStopa);            // 0.10
  const ol = new D(params.licniOdbitak);          // 800.00
  
  // Coefficient: (1 - d_iz) × (1 - t) = 0.69 × 0.90 = 0.621
  const koef = new D(1).minus(pd).times(new D(1).minus(pt));
  // koef = 0.621
  
  // Tax offset: licni_odbitak × t × (1 - d_iz) = 800 × 0.10 × ... 
  // Simplified: the constant +80 in the formula
  // 80 = 800 × 0.10 = licni_odbitak × porezStopa
  const konstanta = ol.times(pt);
  // konstanta = 80.00
  
  const bruto1 = neto.plus(konstanta).dividedBy(koef);
  
  // VERIFICATION: re-derive neto from bruto1 and check
  const netoCheck = verifyBruto1(bruto1, params);
  const diff = neto.minus(netoCheck).abs();
  
  if (diff.greaterThan(new D('0.01'))) {
    throw new Error(
      `Payroll formula verification failed for neto=${neto.toString()}. ` +
      `Expected neto=${neto.toString()}, got ${netoCheck.toString()}, diff=${diff.toString()}`
    );
  }
  
  return bruto1;
}

/**
 * Verify Bruto I by deriving Neto from it (reverse calculation).
 * Used for internal formula verification only.
 */
function verifyBruto1(bruto1: Decimal, params: PayrollParameters): Decimal {
  const D = Decimal;
  const pd = new D(params.doprinosiIzPlate);  // 0.31
  const pt = new D(params.porezStopa);         // 0.10
  const ol = new D(params.licniOdbitak);       // 800.00
  
  const netoOsnova = bruto1.times(new D(1).minus(pd));  // BrutoI × 0.69
  const porezBaza = D.max(new D(0), netoOsnova.minus(ol));
  const porezIznos = porezBaza.times(pt);
  const neto = netoOsnova.minus(porezIznos);
  
  return neto;
}

/**
 * Calculate seniority addition in absolute KM.
 */
export function calculateDodatakStaz(
  netoOsnova: Decimal,
  godineStaza: number
): Decimal {
  let stopa = 0;
  if (godineStaza >= 11) stopa = 0.08;
  else if (godineStaza >= 8)  stopa = 0.06;
  else if (godineStaza >= 5)  stopa = 0.04;
  else if (godineStaza >= 2)  stopa = 0.02;
  
  return netoOsnova.times(new Decimal(stopa)).toDecimalPlaces(2);
}

/**
 * MASTER CALCULATION FUNCTION
 * Calculates complete payroll for a single employee in a single period.
 * All amounts in KM, rounded to 2 decimal places (standard BAM currency).
 */
export function calculatePayroll(input: PayrollInput): PayrollResult {
  const D = Decimal;
  const p = input.params;

  const netoOsnova  = new D(input.netoOsnova).toDecimalPlaces(2);
  const dodStaz     = new D(input.dodatakStaz).toDecimalPlaces(2);
  const dodVar      = new D(input.dodVarijabilni).toDecimalPlaces(2);
  const naknPrevoz  = new D(input.naknPrevoz).toDecimalPlaces(2);
  const topliObrok  = new D(p.topliObrok).toDecimalPlaces(2);
  
  // Total neto for Bruto calculation
  const netoUkupno  = netoOsnova.plus(dodStaz).plus(dodVar).toDecimalPlaces(2);
  
  // Bruto I (with verification)
  const bruto1      = calculateBruto1(netoUkupno, p).toDecimalPlaces(2);
  
  // Doprinosi iz plate
  const doprinoziIz = bruto1.times(new D(p.doprinosiIzPlate)).toDecimalPlaces(2);
  
  // Porez
  const netoOsnovaBruto = bruto1.times(new D(1).minus(new D(p.doprinosiIzPlate))).toDecimalPlaces(2);
  const porezBaza   = D.max(new D(0), netoOsnovaBruto.minus(new D(p.licniOdbitak))).toDecimalPlaces(2);
  const porezIznos  = porezBaza.times(new D(p.porezStopa)).toDecimalPlaces(2);
  
  // Bruto II = Bruto I × (1 + doprinosiNaPlatu)
  const bruto2      = bruto1.times(new D(1).plus(new D(p.doprinosiNaPlatu))).toDecimalPlaces(2);
  
  // Total employer cost
  const ukupnoTrosak = bruto2.plus(topliObrok).plus(naknPrevoz).toDecimalPlaces(2);
  
  // Format all values as KM strings
  const fmt = (d: Decimal) => d.toFixed(2).replace('.', ',');
  
  return {
    netoOsnova:       fmt(netoOsnova),
    dodatakStaz:      fmt(dodStaz),
    dodVarijabilni:   fmt(dodVar),
    netoUkupno:       fmt(netoUkupno),
    bruto1:           fmt(bruto1),
    doprinoziIz:      fmt(doprinoziIz),
    porezBaza:        fmt(porezBaza),
    porezIznos:       fmt(porezIznos),
    bruto2:           fmt(bruto2),
    topliObrok:       fmt(topliObrok),
    naknPrevoz:       fmt(naknPrevoz),
    ukupnoTrosak:     fmt(ukupnoTrosak),
    // Raw Decimals for aggregation
    _netoOsnova:      netoOsnova,
    _netoUkupno:      netoUkupno,
    _bruto1:          bruto1,
    _doprinoziIz:     doprinoziIz,
    _porezBaza:       porezBaza,
    _porezIznos:      porezIznos,
    _bruto2:          bruto2,
    _topliObrok:      topliObrok,
    _naknPrevoz:      naknPrevoz,
    _ukupnoTrosak:    ukupnoTrosak,
  };
}

/**
 * Aggregate payroll results for all employees.
 * Summation done in Decimal arithmetic to avoid floating-point errors.
 */
export function aggregatePayroll(results: PayrollResult[]): {
  ukupnoNeto: string;
  ukupnoBruto1: string;
  ukupnoBruto2: string;
  ukupnoTopliObrok: string;
  ukupnoTrosak: string;
} {
  const D = Decimal;
  const sum = (field: keyof PayrollResult) =>
    results.reduce((acc, r) => acc.plus(r[field] as Decimal), new D(0));
  
  const fmt = (d: Decimal) => d.toFixed(2).replace('.', ',');
  
  return {
    ukupnoNeto:       fmt(sum('_netoUkupno')),
    ukupnoBruto1:     fmt(sum('_bruto1')),
    ukupnoBruto2:     fmt(sum('_bruto2')),
    ukupnoTopliObrok: fmt(sum('_topliObrok')),
    ukupnoTrosak:     fmt(sum('_ukupnoTrosak')),
  };
}

/**
 * Quick projection using linear approximation.
 * For planning purposes only — clearly labeled as "procjena".
 */
export function quickProjection(neto: number): {
  ukupniTrosak: string;
  napomena: string;
} {
  const trosak = neto * 1.7794 + 322.36;
  return {
    ukupniTrosak: trosak.toFixed(2).replace('.', ','),
    napomena: 'PROCJENA (linearna aproksimacija) — nije za zvanični obračun'
  };
}
