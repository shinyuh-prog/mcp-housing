import { DataGovMetadata, DataGovRecord, FlatType } from '../types/hdb';

const RESOURCE_ID = 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc';

// Cache objects
let cachedMetadata: DataGovMetadata | null = null;
const recordsCache: Record<string, { records: DataGovRecord[]; timestamp: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch dataset metadata from Data.gov.sg
 */
export async function fetchDataGovMetadata(): Promise<DataGovMetadata> {
  if (cachedMetadata) return cachedMetadata;

  const endpoints = [
    `/api/datagov-meta/v2/public/api/datasets/${RESOURCE_ID}/metadata`,
    `https://api-production.data.gov.sg/v2/public/api/datasets/${RESOURCE_ID}/metadata`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) continue;
      const json = await response.json();
      if (json && json.data) {
        cachedMetadata = {
          datasetId: json.data.datasetId,
          name: json.data.name,
          lastUpdatedAt: json.data.lastUpdatedAt,
          datasetSize: json.data.datasetSize,
          coverageStart: json.data.coverageStart,
          coverageEnd: json.data.coverageEnd,
        };
        return cachedMetadata;
      }
    } catch {
      // try next fallback
    }
  }

  // Graceful fallback if network fails
  return {
    datasetId: RESOURCE_ID,
    name: 'Resale flat prices based on registration date from Jan-2017 onwards',
    lastUpdatedAt: '2026-10-07T02:10:50+08:00',
    datasetSize: 23952445,
    coverageStart: '2017-01-01T08:00:00+08:00',
    coverageEnd: '2026-10-01T08:00:00+08:00',
    totalRecordsEstimate: 242144,
  };
}

/**
 * Fetch recent HDB resale records for a specific town and optional flat type
 */
export async function fetchRecentTownTransactions(
  townName: string,
  flatType?: FlatType,
  limit: number = 20
): Promise<{ records: DataGovRecord[]; total: number; isLive: boolean }> {
  const cacheKey = `${townName.toUpperCase()}_${flatType || 'ALL'}_${limit}`;
  const cached = recordsCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { records: cached.records, total: cached.records.length, isLive: true };
  }

  const filtersObj: Record<string, string> = {
    town: townName.toUpperCase(),
  };
  if (flatType) {
    filtersObj.flat_type = flatType.toUpperCase();
  }

  const queryParams = new URLSearchParams({
    resource_id: RESOURCE_ID,
    limit: String(limit),
    sort: '_id desc', // Newest first
    filters: JSON.stringify(filtersObj),
  });

  const endpoints = [
    `/api/datagov/api/action/datastore_search?${queryParams.toString()}`,
    `https://data.gov.sg/api/action/datastore_search?${queryParams.toString()}`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) continue;
      const data = await response.json();
      if (data && data.success && data.result && Array.isArray(data.result.records)) {
        const records = data.result.records as DataGovRecord[];
        recordsCache[cacheKey] = {
          records,
          timestamp: Date.now(),
        };
        return {
          records,
          total: data.result.total || records.length,
          isLive: true,
        };
      }
    } catch {
      // try next
    }
  }

  return {
    records: [],
    total: 0,
    isLive: false,
  };
}

/**
 * Compute real median resale price from Data.gov.sg records if available
 */
export function calculateMedianPriceFromRecords(records: DataGovRecord[]): number | null {
  if (!records || records.length === 0) return null;
  const prices = records
    .map((r) => Number(r.resale_price))
    .filter((p) => !isNaN(p) && p > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) return null;
  const mid = Math.floor(prices.length / 2);
  if (prices.length % 2 !== 0) {
    return prices[mid];
  }
  return Math.round((prices[mid - 1] + prices[mid]) / 2);
}
