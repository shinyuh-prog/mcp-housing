import React from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Users,
  User,
  Heart,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { BuyerProfile, CPFCalculationResult, FlatType, LoanType, BuyerStatus } from '../types/hdb';

interface CpfCalculatorPanelProps {
  profile: BuyerProfile;
  onChangeProfile: (updates: Partial<BuyerProfile>) => void;
  cpfResult: CPFCalculationResult;
  isCompact?: boolean;
}

export const CpfCalculatorPanel: React.FC<CpfCalculatorPanelProps> = ({
  profile,
  onChangeProfile,
  cpfResult,
  isCompact = false,
}) => {
  const formatSgd = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              CPF Calculator & Housing Budget
              <span className="text-xs font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Condition 2
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Enhanced CPF Housing Grant (EHG), Family Grant, PHG &amp; MSR 30% check
            </p>
          </div>
        </div>
      </div>

      {/* Calculator Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Financial Profile & Household Inputs */}
        <div className="space-y-4">
          {/* Buyer Status */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Buyer Category (First-Timer):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeProfile({ buyerStatus: 'first_timer_couple' })}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  profile.buyerStatus === 'first_timer_couple'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500/40'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <div>Married Couple / Family</div>
                  <div className="text-[10px] text-slate-500 font-normal">Eligible for Family Grant + EHG</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeProfile({ buyerStatus: 'first_timer_single' })}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  profile.buyerStatus === 'first_timer_single'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500/40'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <div>Single (Age 35+)</div>
                  <div className="text-[10px] text-slate-500 font-normal">Singles Scheme Grant</div>
                </div>
              </button>
            </div>
          </div>

          {/* Monthly Household Income */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700">Gross Monthly Household Income:</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatSgd(profile.monthlyHouseholdIncome)}
              </span>
            </div>
            <input
              type="range"
              min={2500}
              max={16000}
              step={250}
              value={profile.monthlyHouseholdIncome}
              onChange={(e) => onChangeProfile({ monthlyHouseholdIncome: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>S$2,500 (Max Grants)</span>
              <span>S$9,000 (EHG Ceiling)</span>
              <span>S$14,000 (Resale Grant Cap)</span>
            </div>
          </div>

          {/* Combined CPF OA Balance */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700">Combined CPF OA Savings Balance:</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatSgd(profile.cpfOaBalance)}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={250000}
              step={5000}
              value={profile.cpfOaBalance}
              onChange={(e) => onChangeProfile({ cpfOaBalance: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              Can be utilized 100% towards the downpayment and monthly installments.
            </p>
          </div>

          {/* Cash Savings Available */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700">Liquid Cash Savings for Housing:</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatSgd(profile.cashSavings)}
              </span>
            </div>
            <input
              type="range"
              min={5000}
              max={150000}
              step={5000}
              value={profile.cashSavings}
              onChange={(e) => onChangeProfile({ cashSavings: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Proximity Housing Grant (PHG) Toggles */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-slate-800 mb-2">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              Proximity Housing Grant (PHG) Eligibility:
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-xs">
                <input
                  type="checkbox"
                  checked={profile.nearParents}
                  onChange={(e) =>
                    onChangeProfile({
                      nearParents: e.target.checked,
                      livingWithParents: e.target.checked ? profile.livingWithParents : false,
                    })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Buying within 4km of parents or married child (+S$20,000 grant)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-xs ml-4">
                <input
                  type="checkbox"
                  checked={profile.livingWithParents}
                  disabled={!profile.nearParents}
                  onChange={(e) => onChangeProfile({ livingWithParents: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 disabled:opacity-40"
                />
                <span>Living together in the same flat with parents (+S$30,000 grant)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Loan Type, Preferred Flat Type & Live Calculation Summary */}
        <div className="space-y-4">
          {/* Preferred Flat Type */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Preferred Flat Size / Type:
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['2 ROOM', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE'] as FlatType[]).map((type) => {
                const isSelected = profile.preferredFlatType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChangeProfile({ preferredFlatType: type })}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">{type.split(' ')[0]}</span>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">
                      {type.includes('EXECUTIVE') ? 'Exec' : 'Room'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loan Configuration */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Housing Loan Type:
              </label>
              <select
                value={profile.loanType}
                onChange={(e) => onChangeProfile({ loanType: e.target.value as LoanType })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800"
              >
                <option value="hdb_concessionary">HDB Loan (2.6% p.a.)</option>
                <option value="bank_loan">Bank Loan (~3.1% p.a.)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Loan Tenure:
              </label>
              <select
                value={profile.loanTenureYears}
                onChange={(e) => onChangeProfile({ loanTenureYears: Number(e.target.value) })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-800"
              >
                <option value={15}>15 Years</option>
                <option value={20}>20 Years</option>
                <option value={25}>25 Years (Standard)</option>
                <option value={30}>30 Years (Bank max)</option>
              </select>
            </div>
          </div>

          {/* LIVE CPF BUDGET CARD */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold">
                  Maximum Affordable Housing Price
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {formatSgd(cpfResult.maxAffordablePrice)}
                </div>
              </div>
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${
                  cpfResult.financialHealth === 'Safe'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : cpfResult.financialHealth === 'Comfortable'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{cpfResult.financialHealth} MSR</span>
              </div>
            </div>

            {/* Grant Breakdown Chips */}
            <div className="py-3 border-b border-emerald-800/60">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">Total CPF Grants Unlocked:</span>
                <span className="text-emerald-300 font-bold text-sm">
                  {formatSgd(cpfResult.grants.totalGrants)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {cpfResult.grants.ehg > 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-800/80 text-emerald-100 border border-emerald-600/50">
                    EHG: {formatSgd(cpfResult.grants.ehg)}
                  </span>
                )}
                {cpfResult.grants.familyGrant > 0 && (
                  <span className="px-2 py-0.5 rounded bg-blue-800/80 text-blue-100 border border-blue-600/50">
                    Resale Grant: {formatSgd(cpfResult.grants.familyGrant)}
                  </span>
                )}
                {cpfResult.grants.phg > 0 && (
                  <span className="px-2 py-0.5 rounded bg-purple-800/80 text-purple-100 border border-purple-600/50">
                    PHG: {formatSgd(cpfResult.grants.phg)}
                  </span>
                )}
                {cpfResult.grants.totalGrants === 0 && (
                  <span className="text-slate-400 text-[11px]">
                    No grants (Household income exceeds ceilings)
                  </span>
                )}
              </div>
            </div>

            {/* Key Housing Figures */}
            <div className="pt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Max Loan (75% LTV):</span>
                <span className="font-semibold text-slate-100">
                  {formatSgd(cpfResult.maxLoanAmount)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Min Downpayment:</span>
                <span className="font-semibold text-slate-100">
                  {formatSgd(cpfResult.minDownpaymentRequired)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Monthly Installment:</span>
                <span className="font-semibold text-slate-100">
                  {formatSgd(cpfResult.monthlyInstallmentAtMaxLoan)}/mo
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Cash Top-Up Needed:</span>
                <span
                  className={`font-semibold ${
                    cpfResult.cashTopUpRequiredMonthly === 0
                      ? 'text-emerald-300'
                      : 'text-amber-300'
                  }`}
                >
                  {cpfResult.cashTopUpRequiredMonthly === 0
                    ? 'S$0 (100% CPF OA Covered!)'
                    : `${formatSgd(cpfResult.cashTopUpRequiredMonthly)}/mo`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
