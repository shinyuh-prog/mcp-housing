import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Train,
  School,
  ShoppingBag,
  DollarSign,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Building,
} from 'lucide-react';
import { HDBTown, FlatType, DataGovRecord, CommuteMode } from '../types/hdb';
import {
  fetchRecentTownTransactions,
  calculateMedianPriceFromRecords,
} from '../services/dataGovService';

interface TownDetailModalProps {
  town: HDBTown | null;
  onClose: () => void;
  preferredFlatType: FlatType;
  commuteMode: CommuteMode;
  workplaceName: string;
  onFocusOnMap: (townId: string) => void;
}

export const TownDetailModal: React.FC<TownDetailModalProps> = ({
  town,
  onClose,
  preferredFlatType,
  commuteMode,
  workplaceName,
  onFocusOnMap,
}) => {
  const [selectedType, setSelectedType] = useState<FlatType>(preferredFlatType);
  const [records, setRecords] = useState<DataGovRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [liveMedian, setLiveMedian] = useState<number | null>(null);

  useEffect(() => {
    setSelectedType(preferredFlatType);
  }, [preferredFlatType]);

  useEffect(() => {
    if (!town) return;
    let isMounted = true;
    setIsLoading(true);

    fetchRecentTownTransactions(town.name, selectedType, 20)
      .then((res) => {
        if (!isMounted) return;
        setRecords(res.records);
        setIsLive(res.isLive);
        const computed = calculateMedianPriceFromRecords(res.records);
        setLiveMedian(computed);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [town, selectedType]);

  if (!town) return null;

  const formatSgd = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const commuteData = town.baseCommutesMinutes[workplaceName] ||
    town.baseCommutesMinutes['cbd_raffles'] || { transit: 35, driving: 22 };
  const commuteTime = commuteMode === 'driving' ? commuteData.driving : commuteData.transit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded bg-rose-600 font-bold tracking-wide uppercase">
                {town.region} Region
              </span>
              <h3 className="text-xl font-bold tracking-tight">{town.displayName}</h3>
            </div>
            <p className="text-xs text-slate-300">{town.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Work Commute</span>
              <span className="font-bold text-slate-900 text-sm">
                {commuteTime} mins
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                via {commuteMode === 'driving' ? 'Expressway' : 'MRT / Bus'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px]">
                {selectedType} Baseline Median
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {formatSgd(town.medianPrices[selectedType])}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
                Official HDB Benchmark
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Live Sample Median</span>
              <span className="font-bold text-slate-900 text-sm">
                {liveMedian ? formatSgd(liveMedian) : 'Analyzing...'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                From recent transactions
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px]">MRT Connectivity</span>
              <span className="font-bold text-slate-900 text-sm">
                {town.mrtLines.join(', ')}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                {town.mrtStations.join(', ')}
              </span>
            </div>
          </div>

          {/* Amenities Details (Schools & Malls) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Schools */}
            <div className="p-4 rounded-xl border border-slate-200 bg-amber-50/30">
              <div className="flex items-center gap-2 mb-2 text-amber-900 font-semibold text-xs">
                <School className="w-4 h-4 text-amber-600" />
                <span>Primary Schools within 1km - 2km (P1 Balloting)</span>
              </div>
              <ul className="space-y-1.5 text-xs">
                {town.notableSchools.map((school, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-200/60"
                  >
                    <span className="font-medium text-slate-800">{school.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {school.distanceEstimate}
                      </span>
                      {school.category === 'Popular' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          Popular
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shopping Malls & Supermarkets */}
            <div className="p-4 rounded-xl border border-slate-200 bg-purple-50/30">
              <div className="flex items-center gap-2 mb-2 text-purple-900 font-semibold text-xs">
                <ShoppingBag className="w-4 h-4 text-purple-600" />
                <span>Major Shopping Malls &amp; Retail</span>
              </div>
              <ul className="space-y-1.5 text-xs">
                {town.shoppingMalls.map((mall, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-purple-200/60"
                  >
                    <span className="font-medium text-slate-800">{mall.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        mall.mrtConnected
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {mall.mrtConnected ? 'Direct MRT Link' : 'Town Centre'}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[11px] text-slate-500">
                {town.supermarketsCount}+ Supermarkets &amp; {town.hawkerCentresCount} Hawker Centres
              </div>
            </div>
          </div>

          {/* REAL-TIME DATA.GOV.SG RESALE TRANSACTIONS SECTION */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  Live Data.gov.sg Resale Transactions
                </h4>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  (resource: d_8b84c4ee58e3cfc0ece0d773c8ca6abc)
                </span>
              </div>

              {/* Flat Type Filter within modal */}
              <div className="flex items-center gap-1">
                {(['2 ROOM', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE'] as FlatType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedType(t)}
                    className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                      selectedType === t
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Table of records */}
            <div className="overflow-x-auto max-h-72">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Fetching registered HDB resale prices from Data.gov.sg...</span>
                </div>
              ) : records.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No recent resale records found for this flat type in {town.displayName}.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Month</th>
                      <th className="py-2.5 px-3">Block &amp; Street</th>
                      <th className="py-2.5 px-3">Storey</th>
                      <th className="py-2.5 px-3">Floor Area</th>
                      <th className="py-2.5 px-3">Remaining Lease</th>
                      <th className="py-2.5 px-3 text-right">Transacted Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {records.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                          {record.month}
                        </td>
                        <td className="py-2 px-3 font-medium">
                          Blk {record.block} {record.street_name}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{record.storey_range}</td>
                        <td className="py-2 px-3 text-slate-500">{record.floor_area_sqm} sqm</td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">
                          {record.remaining_lease}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {formatSgd(Number(record.resale_price))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Singapore HDB Resale Registration API</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onFocusOnMap(town.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-medium text-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Explore on Google Map</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
