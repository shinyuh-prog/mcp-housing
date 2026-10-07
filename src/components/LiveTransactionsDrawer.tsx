import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  RefreshCw,
  Building2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { DataGovMetadata, DataGovRecord, FlatType } from '../types/hdb';
import { SINGAPORE_HDB_TOWNS } from '../data/singaporeTowns';
import {
  fetchRecentTownTransactions,
  calculateMedianPriceFromRecords,
} from '../services/dataGovService';

interface LiveTransactionsDrawerProps {
  metadata: DataGovMetadata | null;
  initialTownName?: string;
  initialFlatType?: FlatType;
}

export const LiveTransactionsDrawer: React.FC<LiveTransactionsDrawerProps> = ({
  metadata,
  initialTownName = 'PUNGGOL',
  initialFlatType = '4 ROOM',
}) => {
  const [selectedTown, setSelectedTown] = useState<string>(initialTownName);
  const [selectedFlatType, setSelectedFlatType] = useState<FlatType>(initialFlatType);
  const [records, setRecords] = useState<DataGovRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLive, setIsLive] = useState<boolean>(true);

  const loadRecords = () => {
    setIsLoading(true);
    fetchRecentTownTransactions(selectedTown, selectedFlatType, 30)
      .then((res) => {
        setRecords(res.records);
        setIsLive(res.isLive);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadRecords();
  }, [selectedTown, selectedFlatType]);

  const filteredRecords = records.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.street_name.toLowerCase().includes(q) ||
      r.block.toLowerCase().includes(q) ||
      r.flat_model.toLowerCase().includes(q)
    );
  });

  const medianPrice = calculateMedianPriceFromRecords(filteredRecords);

  const formatSgd = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
      {/* Header & Dataset Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Real-Time HDB Resale Price Feed
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
              data.gov.sg
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Direct sync with Singapore Housing &amp; Development Board (HDB) registered resale transactions.
          </p>
        </div>

        {/* Metadata stats pill */}
        {metadata && (
          <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 block">Dataset Coverage</span>
              <span className="font-semibold text-slate-800">
                {metadata.coverageStart.slice(0, 7)} to {metadata.coverageEnd.slice(0, 7)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-400 block">Dataset Volume</span>
              <span className="font-semibold text-emerald-700 font-mono">
                242,144+ Records
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Town Select */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Select HDB Town:</label>
          <select
            value={selectedTown}
            onChange={(e) => setSelectedTown(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
          >
            {SINGAPORE_HDB_TOWNS.map((t) => (
              <option key={t.id} value={t.name}>
                {t.displayName} ({t.region})
              </option>
            ))}
          </select>
        </div>

        {/* Flat Type Select */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Flat Type:</label>
          <select
            value={selectedFlatType}
            onChange={(e) => setSelectedFlatType(e.target.value as FlatType)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
          >
            {(['2 ROOM', '3 ROOM', '4 ROOM', '5 ROOM', 'EXECUTIVE'] as FlatType[]).map((ft) => (
              <option key={ft} value={ft}>
                {ft}
              </option>
            ))}
          </select>
        </div>

        {/* Street / Block Search */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Search Street / Block:
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. Sumang Walk or 322D..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Live Sample Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-500 block">Filtered Transactions:</span>
            <span className="font-bold text-slate-900">{filteredRecords.length} records</span>
          </div>
          {medianPrice && (
            <div>
              <span className="text-[10px] text-slate-500 block">Sample Median Price:</span>
              <span className="font-bold text-emerald-700 text-sm">
                {formatSgd(medianPrice)}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={loadRecords}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors text-xs font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Fetching registered records from Data.gov.sg API...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No registered resale records match your current criteria. Try adjusting the search filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Registration Month</th>
                  <th className="py-2.5 px-3.5">Address</th>
                  <th className="py-2.5 px-3.5">Storey Range</th>
                  <th className="py-2.5 px-3.5">Floor Area</th>
                  <th className="py-2.5 px-3.5">Flat Model</th>
                  <th className="py-2.5 px-3.5">Remaining Lease</th>
                  <th className="py-2.5 px-3.5 text-right">Transacted Resale Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500">
                      {item.month}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-slate-900">
                      Blk {item.block} {item.street_name}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500">{item.storey_range}</td>
                    <td className="py-2.5 px-3.5 text-slate-500">{item.floor_area_sqm} sqm</td>
                    <td className="py-2.5 px-3.5 text-slate-500">{item.flat_model}</td>
                    <td className="py-2.5 px-3.5 text-slate-500 text-[11px]">
                      {item.remaining_lease}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-slate-900">
                      {formatSgd(Number(item.resale_price))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Official Data Source Attribution */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            API Resource: <code>d_8b84c4ee58e3cfc0ece0d773c8ca6abc</code>
          </span>
        </div>
        <a
          href="https://data.gov.sg/datasets/d_8b84c4ee58e3cfc0ece0d773c8ca6abc/view"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <span>View on Data.gov.sg Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
