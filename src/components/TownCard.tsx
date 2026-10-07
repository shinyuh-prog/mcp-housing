import React from 'react';
import {
  Train,
  School,
  ShoppingBag,
  DollarSign,
  Compass,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { TownMatchScore, FlatType, CommuteMode } from '../types/hdb';

interface TownCardProps {
  score: TownMatchScore;
  rank: number;
  preferredFlatType: FlatType;
  commuteMode: CommuteMode;
  workplaceName: string;
  onViewTownDetail: (townId: string) => void;
  onFocusOnMap: (townId: string) => void;
}

export const TownCard: React.FC<TownCardProps> = ({
  score,
  rank,
  preferredFlatType,
  commuteMode,
  workplaceName,
  onViewTownDetail,
  onFocusOnMap,
}) => {
  const { town, overallScore, commuteMinutes, medianPrice, priceDiffFromBudget, isWithinBudget, highlightBadges } =
    score;

  const formatSgd = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Color coding based on overall score
  const scoreBadgeBg =
    overallScore >= 85
      ? 'bg-emerald-600 text-white'
      : overallScore >= 70
      ? 'bg-blue-600 text-white'
      : 'bg-slate-700 text-white';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div>
        {/* Top Header: Rank, Town Name, Match Score */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-400">#{rank}</span>
              <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                {town.displayName}
              </h4>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {town.region}
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">{town.vibe}</p>
          </div>

          <div className="flex flex-col items-end">
            <div
              className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs ${scoreBadgeBg}`}
            >
              <span>{overallScore}% Match</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">3-Condition Score</span>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {highlightBadges.map((badge, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60 font-medium"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* The 3 Core Conditions Summary Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4 text-xs">
          {/* Commute Box */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100/70 text-blue-700 shrink-0">
              <Train className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Work Commute</span>
              <span className="font-semibold text-slate-800">
                {commuteMinutes} mins {commuteMode === 'driving' ? 'drive' : 'transit'}
              </span>
            </div>
          </div>

          {/* Budget Box */}
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                isWithinBudget ? 'bg-emerald-100/70 text-emerald-700' : 'bg-amber-100/70 text-amber-700'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">
                Median {preferredFlatType}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{formatSgd(medianPrice)}</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                    isWithinBudget
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isWithinBudget ? 'Within Budget' : 'Slight Stretch'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Highlights (Schools, Malls, MRT) */}
        <div className="space-y-2 mb-4 text-xs text-slate-600">
          {/* Schools */}
          <div className="flex items-start gap-2">
            <School className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            <div className="truncate">
              <strong className="text-slate-700 font-medium">Schools:</strong>{' '}
              {town.notableSchools.slice(0, 2).map((s) => s.name).join(', ')}
            </div>
          </div>

          {/* Malls */}
          <div className="flex items-start gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
            <div className="truncate">
              <strong className="text-slate-700 font-medium">Malls:</strong>{' '}
              {town.shoppingMalls.map((m) => m.name).join(', ')}
            </div>
          </div>

          {/* MRT */}
          <div className="flex items-start gap-2">
            <Train className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
            <div className="truncate">
              <strong className="text-slate-700 font-medium">Lines:</strong>{' '}
              {town.mrtLines.join(' • ')} ({town.mrtStations.slice(0, 3).join(', ')})
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onFocusOnMap(town.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-600" />
          <span>View on Map</span>
        </button>

        <button
          type="button"
          onClick={() => onViewTownDetail(town.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Gov Resale Records</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
