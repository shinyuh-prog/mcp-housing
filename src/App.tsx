import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  MapPin,
  Calculator,
  Database,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  CheckCircle2,
  TrendingDown,
  Building,
  Filter,
} from 'lucide-react';
import { BuyerProfile, DataGovMetadata, FlatType, CommuteMode } from './types/hdb';
import { SINGAPORE_HDB_TOWNS } from './data/singaporeTowns';
import { SINGAPORE_WORKPLACES } from './data/workplaces';
import { calculateCpfBudget } from './services/cpfCalculator';
import { matchTowns } from './services/matcherService';
import { fetchDataGovMetadata } from './services/dataGovService';
import { Navbar } from './components/Navbar';
import { WorkplaceSelector } from './components/WorkplaceSelector';
import { CpfCalculatorPanel } from './components/CpfCalculatorPanel';
import { AmenitiesFilter } from './components/AmenitiesFilter';
import { TownCard } from './components/TownCard';
import { TownDetailModal } from './components/TownDetailModal';
import { GoogleHdbMap } from './components/GoogleHdbMap';
import { LiveTransactionsDrawer } from './components/LiveTransactionsDrawer';

export default function App() {
  // Google Maps Quota event listener
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Google Maps API Key
  const mapsApiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDZOiICUX5IGf-mMoTD2dCbksqk2orbIn8';

  // State: Navigation tabs
  const [activeTab, setActiveTab] = useState<'matches' | 'map' | 'cpf' | 'live-data'>('matches');

  // State: Buyer Profile (The 3 Conditions)
  const [profile, setProfile] = useState<BuyerProfile>({
    buyerStatus: 'first_timer_couple',
    monthlyHouseholdIncome: 7500,
    cpfOaBalance: 70000,
    cashSavings: 40000,
    monthlyOaContributionRate: 0.23,
    nearParents: true,
    livingWithParents: false,
    loanType: 'hdb_concessionary',
    loanTenureYears: 25,
    preferredFlatType: '4 ROOM',
    selectedWorkplaceId: 'cbd_raffles',
    maxCommuteMinutes: 45,
    commuteMode: 'transit',
    amenityPriorities: {
      primarySchools: 4,
      shoppingMalls: 3,
      mrtProximity: 4,
      hawkerFood: 3,
    },
  });

  const updateProfile = (updates: Partial<BuyerProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  // State: Filter towns by region or affordability
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [affordableOnly, setAffordableOnly] = useState<boolean>(false);

  // State: Modals & Focused Map Items
  const [focusedTownId, setFocusedTownId] = useState<string | null>(null);
  const [detailTownId, setDetailTownId] = useState<string | null>(null);

  // State: Collapsible condition configurator
  const [isConfigExpanded, setIsConfigExpanded] = useState<boolean>(true);

  // State: Data.gov.sg metadata
  const [metadata, setMetadata] = useState<DataGovMetadata | null>(null);

  useEffect(() => {
    fetchDataGovMetadata().then((data) => setMetadata(data));
  }, []);

  // Compute CPF Budget results
  const cpfResult = useMemo(() => {
    return calculateCpfBudget(profile);
  }, [profile]);

  // Compute Town Match Scores
  const townScores = useMemo(() => {
    return matchTowns(SINGAPORE_HDB_TOWNS, profile, cpfResult);
  }, [profile, cpfResult]);

  // Filtered town scores based on user filter chips
  const filteredTownScores = useMemo(() => {
    return townScores.filter((item) => {
      if (regionFilter !== 'ALL' && item.town.region !== regionFilter) {
        return false;
      }
      if (affordableOnly && !item.isWithinBudget) {
        return false;
      }
      return true;
    });
  }, [townScores, regionFilter, affordableOnly]);

  const selectedWorkplace =
    SINGAPORE_WORKPLACES.find((w) => w.id === profile.selectedWorkplaceId) ||
    SINGAPORE_WORKPLACES[0];

  const detailTown = SINGAPORE_HDB_TOWNS.find((t) => t.id === detailTownId) || null;

  const formatSgd = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Quota Exceeded Sticky Notice (Case A compliance) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metadata={metadata}
        matchCount={SINGAPORE_HDB_TOWNS.length}
      />

      {/* Hero / Quick Status Banner */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                  Singapore First-Time Buyer Navigator
                </span>
                <span className="text-xs text-slate-500">
                  Targeting: <strong>{profile.preferredFlatType}</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                HDB 3-Condition Home Matcher
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Balancing <strong>Work Commute (&le;{profile.maxCommuteMinutes}m)</strong>,{' '}
                <strong>Housing Budget ({formatSgd(cpfResult.maxAffordablePrice)})</strong>, and{' '}
                <strong>Nearby Amenities</strong> with real Data.gov.sg resale prices.
              </p>
            </div>

            {/* Quick Metrics Pill Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Workplace:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[130px] block">
                    {selectedWorkplace.name.split('/')[0]}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <div>
                  <span className="text-[10px] text-emerald-700 block">Max Budget:</span>
                  <span className="font-bold text-emerald-950">
                    {formatSgd(cpfResult.maxAffordablePrice)}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <div>
                  <span className="text-[10px] text-rose-700 block">Eligible Grants:</span>
                  <span className="font-bold text-rose-950">
                    {formatSgd(cpfResult.grants.totalGrants)}
                  </span>
                </div>
              </div>

              {activeTab === 'matches' && (
                <button
                  type="button"
                  onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                  className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isConfigExpanded ? 'Hide Criteria' : 'Edit Criteria'}</span>
                  {isConfigExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* VIEW 1: TOP MATCHES & LIST */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            {/* The 3 Conditions Accordion / Config Panels */}
            {isConfigExpanded && (
              <div className="space-y-5 transition-all">
                {/* Condition 1: Commute to Work */}
                <WorkplaceSelector
                  selectedWorkplaceId={profile.selectedWorkplaceId}
                  onSelectWorkplace={(id) => updateProfile({ selectedWorkplaceId: id })}
                  commuteMode={profile.commuteMode}
                  onSelectCommuteMode={(mode) => updateProfile({ commuteMode: mode })}
                  maxCommuteMinutes={profile.maxCommuteMinutes}
                  onSetMaxCommuteMinutes={(mins) => updateProfile({ maxCommuteMinutes: mins })}
                />

                {/* Condition 2: Budget & CPF Calculator */}
                <CpfCalculatorPanel
                  profile={profile}
                  onChangeProfile={updateProfile}
                  cpfResult={cpfResult}
                />

                {/* Condition 3: Amenities Filters */}
                <AmenitiesFilter
                  amenityPriorities={profile.amenityPriorities}
                  onChangePriorities={(priorities) =>
                    updateProfile({ amenityPriorities: priorities })
                  }
                />
              </div>
            )}

            {/* Results Filter & Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <h2 className="text-base font-bold text-slate-900">
                  Best Matching HDB Towns ({filteredTownScores.length})
                </h2>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Ranked by 3-Condition composite score
                </span>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {['ALL', 'North-East', 'East', 'West', 'Central', 'North'].map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setRegionFilter(reg)}
                    className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                      regionFilter === reg
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {reg === 'ALL' ? 'All Regions' : reg}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setAffordableOnly(!affordableOnly)}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-medium border flex items-center gap-1 ${
                    affordableOnly
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Within Budget Only</span>
                </button>
              </div>
            </div>

            {/* Towns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTownScores.map((score, index) => (
                <TownCard
                  key={score.town.id}
                  score={score}
                  rank={index + 1}
                  preferredFlatType={profile.preferredFlatType}
                  commuteMode={profile.commuteMode}
                  workplaceName={selectedWorkplace.name}
                  onViewTownDetail={(id) => setDetailTownId(id)}
                  onFocusOnMap={(id) => {
                    setFocusedTownId(id);
                    setActiveTab('map');
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: INTERACTIVE GOOGLE MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Google Maps HDB Explorer
                </h2>
                <p className="text-xs text-slate-500">
                  Click any estate pin to see match details, work commute duration, and live resale records.
                </p>
              </div>

              {/* Quick workplace switcher right on map */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 font-medium">Workplace:</span>
                <select
                  value={profile.selectedWorkplaceId}
                  onChange={(e) => updateProfile({ selectedWorkplaceId: e.target.value })}
                  className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
                >
                  {SINGAPORE_WORKPLACES.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name.split('/')[0]} ({w.region})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-[620px] w-full">
              <GoogleHdbMap
                apiKey={mapsApiKey}
                towns={SINGAPORE_HDB_TOWNS}
                scores={townScores}
                workplace={selectedWorkplace}
                commuteMode={profile.commuteMode}
                preferredFlatType={profile.preferredFlatType}
                focusedTownId={focusedTownId}
                onSelectTown={(id) => setFocusedTownId(id)}
                onViewTownDetail={(id) => setDetailTownId(id)}
              />
            </div>
          </div>
        )}

        {/* VIEW 3: DEDICATED CPF & GRANTS CALCULATOR */}
        {activeTab === 'cpf' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Singapore CPF Housing Grant &amp; Affordability Calculator
              </h2>
              <p className="text-xs text-slate-500">
                Official formulas incorporating Enhanced CPF Housing Grant (EHG), Family Grant / Singles Grant, Proximity Housing Grant (PHG), and 30% MSR.
              </p>
            </div>

            <CpfCalculatorPanel
              profile={profile}
              onChangeProfile={updateProfile}
              cpfResult={cpfResult}
            />

            {/* Educational Grant Guide for First-Timers */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500" />
                Singapore First-Timer HDB Housing Grant Guide
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    Enhanced CPF Housing Grant (EHG)
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Up to <strong>S$80,000</strong> for first-timer families (or S$40,000 for singles). Tiered based on monthly household income up to S$9,000.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    CPF Housing Grant (Family / Singles)
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Up to <strong>S$80,000</strong> for 2-to-4 room resale flats (S$50,000 for 5-room+). Income ceiling is S$14,000 for couples.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">
                    Proximity Housing Grant (PHG)
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Up to <strong>S$30,000</strong> if living with parents or children, or <strong>S$20,000</strong> if living within 4km radius. No income ceiling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: LIVE DATA.GOV.SG RESALE FEED */}
        {activeTab === 'live-data' && (
          <div className="space-y-4">
            <LiveTransactionsDrawer
              metadata={metadata}
              initialTownName="PUNGGOL"
              initialFlatType={profile.preferredFlatType}
            />
          </div>
        )}
      </main>

      {/* Town Detail Modal */}
      {detailTown && (
        <TownDetailModal
          town={detailTown}
          onClose={() => setDetailTownId(null)}
          preferredFlatType={profile.preferredFlatType}
          commuteMode={profile.commuteMode}
          workplaceName={profile.selectedWorkplaceId}
          onFocusOnMap={(townId) => {
            setFocusedTownId(townId);
            setActiveTab('map');
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-xs text-slate-500 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-800">
              Singapore First-Home Public Housing Matcher
            </div>
            <p className="text-[11px] text-slate-500">
              Designed for first-time HDB buyers • Powered by Google Maps Platform &amp; Data.gov.sg
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>Data source: Housing &amp; Development Board (data.gov.sg)</span>
            <span>•</span>
            <span>MSR 30% / LTV 75% Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
