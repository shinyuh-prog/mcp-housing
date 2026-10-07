import React from 'react';
import { School, ShoppingBag, Train, Utensils, Sparkles } from 'lucide-react';
import { BuyerProfile } from '../types/hdb';

interface AmenitiesFilterProps {
  amenityPriorities: BuyerProfile['amenityPriorities'];
  onChangePriorities: (updates: BuyerProfile['amenityPriorities']) => void;
}

export const AmenitiesFilter: React.FC<AmenitiesFilterProps> = ({
  amenityPriorities,
  onChangePriorities,
}) => {
  const updatePriority = (key: keyof BuyerProfile['amenityPriorities'], val: number) => {
    onChangePriorities({
      ...amenityPriorities,
      [key]: val,
    });
  };

  const amenityItems = [
    {
      key: 'primarySchools' as const,
      label: 'Primary Schools (1km - 2km)',
      subtitle: 'Critical for MOE Primary 1 balloting priority',
      icon: School,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      key: 'shoppingMalls' as const,
      label: 'Shopping Malls & Supermarkets',
      subtitle: 'Groceries (FairPrice/Cold Storage) & retail',
      icon: ShoppingBag,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      key: 'mrtProximity' as const,
      label: 'MRT Lines & Interchanges',
      subtitle: 'Fast transit access without feeder buses',
      icon: Train,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    {
      key: 'hawkerFood' as const,
      label: 'Hawker Centres & Wet Markets',
      subtitle: 'Affordable daily food options & markets',
      icon: Utensils,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              Neighborhood Amenities &amp; Lifestyle
              <span className="text-xs font-normal text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Condition 3
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Set your priorities for primary schools, shopping malls, and transport
            </p>
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {amenityItems.map((item) => {
          const Icon = item.icon;
          const currentVal = amenityPriorities[item.key];
          return (
            <div
              key={item.key}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg border ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800">
                    {currentVal === 5 ? 'High Priority' : currentVal >= 3 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-800 mb-0.5">{item.label}</div>
                <div className="text-[11px] text-slate-500 mb-3">{item.subtitle}</div>
              </div>

              <div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={currentVal}
                  onChange={(e) => updatePriority(item.key, Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Nice to have</span>
                  <span>Must-have</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
