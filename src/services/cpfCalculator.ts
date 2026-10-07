import { BuyerProfile, CPFCalculationResult, CPFGrantBreakdown } from '../types/hdb';

/**
 * Calculates Enhanced CPF Housing Grant (EHG) for first-timers
 * Based on CPF Board income brackets
 */
export function calculateEHG(monthlyIncome: number, isSingle: boolean): number {
  if (isSingle) {
    if (monthlyIncome > 4500) return 0;
    if (monthlyIncome <= 750) return 40000;
    if (monthlyIncome <= 1000) return 37500;
    if (monthlyIncome <= 1250) return 35000;
    if (monthlyIncome <= 1500) return 32500;
    if (monthlyIncome <= 1750) return 30000;
    if (monthlyIncome <= 2000) return 27500;
    if (monthlyIncome <= 2250) return 25000;
    if (monthlyIncome <= 2500) return 22500;
    if (monthlyIncome <= 2750) return 20000;
    if (monthlyIncome <= 3000) return 17500;
    if (monthlyIncome <= 3250) return 15000;
    if (monthlyIncome <= 3500) return 12500;
    if (monthlyIncome <= 3750) return 10000;
    if (monthlyIncome <= 4000) return 7500;
    if (monthlyIncome <= 4250) return 5000;
    if (monthlyIncome <= 4500) return 2500;
    return 0;
  } else {
    // Couple / Family
    if (monthlyIncome > 9000) return 0;
    if (monthlyIncome <= 1500) return 80000;
    if (monthlyIncome <= 2000) return 75000;
    if (monthlyIncome <= 2500) return 70000;
    if (monthlyIncome <= 3000) return 65000;
    if (monthlyIncome <= 3500) return 60000;
    if (monthlyIncome <= 4000) return 55000;
    if (monthlyIncome <= 4500) return 50000;
    if (monthlyIncome <= 5000) return 45000;
    if (monthlyIncome <= 5500) return 40000;
    if (monthlyIncome <= 6000) return 35000;
    if (monthlyIncome <= 6500) return 30000;
    if (monthlyIncome <= 7000) return 25000;
    if (monthlyIncome <= 7500) return 20000;
    if (monthlyIncome <= 8000) return 15000;
    if (monthlyIncome <= 8500) return 10000;
    if (monthlyIncome <= 9000) return 5000;
    return 0;
  }
}

/**
 * Calculates CPF Housing Grant (Family Grant or Singles Grant) for Resale Flats
 */
export function calculateFamilyOrSinglesGrant(
  buyerStatus: BuyerProfile['buyerStatus'],
  monthlyIncome: number,
  flatType: BuyerProfile['preferredFlatType']
): number {
  const is2to4Room = flatType === '2 ROOM' || flatType === '3 ROOM' || flatType === '4 ROOM';

  if (buyerStatus === 'first_timer_couple') {
    if (monthlyIncome > 14000) return 0;
    // Resale Family Grant: $80,000 for 2-4 room, $50,000 for 5-room or bigger
    return is2to4Room ? 80000 : 50000;
  } else if (buyerStatus === 'first_timer_single') {
    if (monthlyIncome > 7000) return 0;
    // Resale Singles Grant: $40,000 for 2-4 room, $25,000 for 5-room
    return is2to4Room ? 40000 : 25000;
  }
  return 0;
}

/**
 * Calculates Proximity Housing Grant (PHG)
 */
export function calculatePHG(
  buyerStatus: BuyerProfile['buyerStatus'],
  nearParents: boolean,
  livingWithParents: boolean
): number {
  if (!nearParents && !livingWithParents) return 0;

  const isSingle = buyerStatus === 'first_timer_single';

  if (livingWithParents) {
    return isSingle ? 15000 : 30000;
  } else if (nearParents) {
    return isSingle ? 10000 : 20000;
  }
  return 0;
}

/**
 * Calculates monthly mortgage payment using standard amortization formula
 */
export function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  tenureYears: number
): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualInterestRate / 12;
  const numberOfPayments = tenureYears * 12;
  const payment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  return Math.round(payment);
}

/**
 * Calculates max loan amount permitted under Singapore MSR (Mortgage Servicing Ratio: 30%)
 */
export function calculateMaxLoanByMSR(
  monthlyIncome: number,
  annualInterestRate: number,
  tenureYears: number
): number {
  const maxMonthlyPaymentAllowed = monthlyIncome * 0.3; // 30% MSR cap for HDB
  const monthlyRate = annualInterestRate / 12;
  const numberOfPayments = tenureYears * 12;

  // Invert amortization formula: Principal = Payment * [(1+r)^n - 1] / [r * (1+r)^n]
  const principal =
    (maxMonthlyPaymentAllowed * (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));

  return Math.floor(principal);
}

/**
 * Main CPF & Budget Calculator for Singapore First-Timer HDB Buyers
 */
export function calculateCpfBudget(profile: BuyerProfile): CPFCalculationResult {
  const isSingle = profile.buyerStatus === 'first_timer_single';

  // 1. Grants Calculation
  const ehg = calculateEHG(profile.monthlyHouseholdIncome, isSingle);
  const familyGrant = calculateFamilyOrSinglesGrant(
    profile.buyerStatus,
    profile.monthlyHouseholdIncome,
    profile.preferredFlatType
  );
  const phg = calculatePHG(profile.buyerStatus, profile.nearParents, profile.livingWithParents);
  const totalGrants = ehg + familyGrant + phg;

  const grants: CPFGrantBreakdown = {
    ehg,
    familyGrant,
    phg,
    totalGrants,
  };

  // 2. Loan details
  const interestRate = profile.loanType === 'hdb_concessionary' ? 0.026 : 0.031; // 2.6% for HDB, ~3.1% for Bank
  const maxLoanByMSR = calculateMaxLoanByMSR(
    profile.monthlyHouseholdIncome,
    interestRate,
    profile.loanTenureYears
  );

  // 3. Downpayment & LTV constraints
  // HDB Loan: 75% LTV, 20% downpayment (can be 100% CPF OA + Grants)
  // Bank Loan: 75% LTV, 25% downpayment (at least 5% cash)
  const ltvRatio = 0.75;
  const minDownpaymentRatio = profile.loanType === 'hdb_concessionary' ? 0.20 : 0.25;

  // Maximum purchase price constrained by loan + downpayment capacity:
  // Downpayment capacity = CPF OA balance + total grants + cash
  const availableDownpayment = profile.cpfOaBalance + totalGrants + profile.cashSavings;

  // Price cannot exceed Loan / LTV:
  const maxPriceByLoan = maxLoanByMSR / ltvRatio;
  // Price cannot exceed Downpayment / minDownpaymentRatio:
  const maxPriceByDownpayment = availableDownpayment / minDownpaymentRatio;

  // Theoretical max purchase price is bounded by the tighter of the two:
  const rawMaxPrice = Math.min(maxPriceByLoan, maxPriceByDownpayment);
  const maxAffordablePrice = Math.max(150000, Math.floor(rawMaxPrice / 1000) * 1000);

  // Recompute actual loan for this max price (75% LTV capped by MSR)
  const actualMaxLoan = Math.min(maxLoanByMSR, Math.floor(maxAffordablePrice * ltvRatio));

  const monthlyInstallmentAtMaxLoan = calculateMonthlyPayment(
    actualMaxLoan,
    interestRate,
    profile.loanTenureYears
  );

  const msrMonthlyCap = Math.round(profile.monthlyHouseholdIncome * 0.3);

  // Monthly CPF OA contribution estimation:
  // Singapore CPF OA rate is typically 23% of wage (17% employee + 6% or standard allocation)
  // Capped at monthly salary ceiling (e.g. $8,000 for standard Ordinary Wage)
  const eligibleIncome = Math.min(profile.monthlyHouseholdIncome, 8000);
  const monthlyCpfContributionAvailable = Math.round(eligibleIncome * 0.23);

  const cashTopUpRequiredMonthly = Math.max(
    0,
    monthlyInstallmentAtMaxLoan - monthlyCpfContributionAvailable
  );

  const minDownpaymentRequired = Math.round(maxAffordablePrice * minDownpaymentRatio);

  let financialHealth: 'Safe' | 'Comfortable' | 'Tight' = 'Safe';
  const installmentRatio = monthlyInstallmentAtMaxLoan / profile.monthlyHouseholdIncome;
  if (installmentRatio >= 0.28) {
    financialHealth = 'Tight';
  } else if (installmentRatio >= 0.20) {
    financialHealth = 'Comfortable';
  } else {
    financialHealth = 'Safe';
  }

  return {
    grants,
    maxAffordablePrice,
    maxLoanAmount: actualMaxLoan,
    msrMonthlyCap,
    monthlyInstallmentAtMaxLoan,
    monthlyCpfContributionAvailable,
    cashTopUpRequiredMonthly,
    minDownpaymentRequired,
    financialHealth,
    loanInterestRate: interestRate,
  };
}
