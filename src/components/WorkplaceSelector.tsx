import React from 'react';
import { Briefcase, Train, Car, Clock, Navigation } from 'lucide-react';
import { SINGAPORE_WORKPLACES } from '../data/workplaces';
import { CommuteMode, Workplace } from '../types/hdb';

interface WorkplaceSelectorProps {
  selectedWorkplaceId: string;
  onSelectWorkplace: (id: string) => void;
  commuteMode: CommuteMode;
  onSelectCommuteMode: (mode: CommuteMode) => void;
  maxCommuteMinutes: number;
  onSetMaxCommuteMinutes: (minutes: number) => void;
}

export const WorkplaceSelector: React.FC<WorkplaceSelectorProps> = ({
  selectedWorkplaceId,
  onSelectWorkplace,
  commuteMode,
  onSelectCommuteMode,
  maxCommuteMinutes,
  onSetMaxCommuteMinutes,
}) => {
  const currentWorkplace =
    SINGAPORE_WORKPLACES.find((w) => w.id === selectedWorkplaceId) || SINGAPORE_WORKPLACES[0];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              Work Location & Commute
              <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Condition 1
              </span>
            </h3>
            <p className="text-xs text-slate-500">Shortest door-to-door transit to your workplace</p>
          </div>
        </div>

        {/* Transit vs Driving Toggle */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => onSelectCommuteMode('transit')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              commuteMode === 'transit'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>MRT / Bus</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectCommuteMode('driving')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              commuteMode === 'driving'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Driving</span>
          </button>
        </div>
      </div>

      {/* Workplace Selection Grid */}
      <div className="space-y-3">
        <label className="block text-xs font-medium text-slate-700">
          Select Workplace / Commercial District:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SINGAPORE_WORKPLACES.map((workplace) => {
            const isSelected = workplace.id === selectedWorkplaceId;
            return (
              <button
                key={workplace.id}
                type="button"
                onClick={() => onSelectWorkplace(workplace.id)}
                className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-medium ring-1 ring-blue-500/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold truncate pr-1">{workplace.name.split('/')[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {workplace.region}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{workplace.description}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Workplace info banner */}
        <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
          <Navigation className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-800">Target Destination:</strong> {currentWorkplace.address}
          </span>
        </div>

        {/* Max Commute Tolerance Slider */}
        <div className="pt-2">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Maximum Acceptable Commute Time:
            </span>
            <span className="font-bold text-blue-600 text-sm">
              &le; {maxCommuteMinutes} mins
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={75}
            step={5}
            value={maxCommuteMinutes}
            onChange={(e) => onSetMaxCommuteMinutes(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>20 mins (Ultra-close)</span>
            <span>45 mins (Typical SG Average)</span>
            <span>75 mins (Islandwide)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
