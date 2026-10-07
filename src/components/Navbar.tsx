import React from 'react';
import { Home, MapPin, Calculator, Database, ShieldCheck, Compass } from 'lucide-react';
import { DataGovMetadata } from '../types/hdb';

interface NavbarProps {
  activeTab: 'matches' | 'map' | 'cpf' | 'live-data';
  setActiveTab: (tab: 'matches' | 'map' | 'cpf' | 'live-data') => void;
  metadata: DataGovMetadata | null;
  matchCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  metadata,
  matchCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Banner with Singapore HDB & Live Gov API Badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-950/40">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  SG First-Home Matcher
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  HDB First-Timer
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                3-Condition Match: Commute • CPF Budget • Amenities
              </p>
            </div>
          </div>

          {/* Data.gov.sg Live Indicator & Quick Actions */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setActiveTab('live-data')}
              className="cursor-pointer hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 transition-colors text-xs"
              title="Real-time HDB Resale Data from Data.gov.sg"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium">Data.gov.sg Live</span>
              <span className="text-emerald-400/80 text-[11px]">
                {metadata?.coverageEnd ? `(Updated: ${metadata.coverageEnd.slice(0, 7)})` : '242k Records'}
              </span>
            </div>

            {/* Match Counter Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium">
              <Compass className="w-3.5 h-3.5 text-rose-400" />
              <span>{matchCount} Towns Evaluated</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Mobile & Desktop) */}
        <div className="flex space-x-1 border-t border-slate-800/80 py-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'matches'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Top Matches</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'map'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Google Map View</span>
          </button>

          <button
            onClick={() => setActiveTab('cpf')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'cpf'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>CPF & Grants Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('live-data')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'live-data'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Live HDB Resale Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
