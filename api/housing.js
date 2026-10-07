import {
  DATASTORE_SEARCH_URL,
  FLAT_TYPES,
  RESALE_RESOURCE_ID,
  fetchWithTimeout,
  json,
} from './_lib/datagov.js';

const MAX_LIMIT = 100;
const TOWN_PATTERN = /^[A-Z/ '-]{2,40}$/;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function parseIntParam(value, fallback, min, max) {
  if (value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

/**
 * GET /api/housing
 * Query params (all optional):
 *   town       e.g. "PUNGGOL"
 *   flat_type  e.g. "4 ROOM"
 *   month      e.g. "2026-09"
 *   limit      1-100 (default 20)
 *   offset     >= 0 (default 0)
 */
export async function GET(request) {
  const params = new URL(request.url).searchParams;

  const town = params.get('town')?.trim().toUpperCase() || null;
  const flatType = params.get('flat_type')?.trim().toUpperCase() || null;
  const month = params.get('month')?.trim() || null;
  const limit = parseIntParam(params.get('limit'), 20, 1, MAX_LIMIT);
  const offset = parseIntParam(params.get('offset'), 0, 0, 1_000_000);

  const errors = [];
  if (town && !TOWN_PATTERN.test(town)) errors.push('town contains invalid characters');
  if (flatType && !FLAT_TYPES.includes(flatType)) errors.push(`flat_type must be one of: ${FLAT_TYPES.join(', ')}`);
  if (month && !MONTH_PATTERN.test(month)) errors.push('month must be in YYYY-MM format');
  if (limit === null) errors.push(`limit must be an integer between 1 and ${MAX_LIMIT}`);
  if (offset === null) errors.push('offset must be a non-negative integer');

  if (errors.length > 0) {
    return json({ success: false, errors }, { status: 400 });
  }

  const filters = {};
  if (town) filters.town = town;
  if (flatType) filters.flat_type = flatType;
  if (month) filters.month = month;

  const query = new URLSearchParams({
    resource_id: RESALE_RESOURCE_ID,
    limit: String(limit),
    offset: String(offset),
    sort: '_id desc',
  });
  if (Object.keys(filters).length > 0) query.set('filters', JSON.stringify(filters));

  try {
    const upstream = await fetchWithTimeout(`${DATASTORE_SEARCH_URL}?${query}`);
    if (!upstream.ok) {
      return json(
        { success: false, error: `Upstream responded with HTTP ${upstream.status}` },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    if (!data?.success || !Array.isArray(data?.result?.records)) {
      return json({ success: false, error: 'Unexpected upstream response shape' }, { status: 502 });
    }

    return json(
      {
        success: true,
        source: 'data.gov.sg',
        resourceId: RESALE_RESOURCE_ID,
        filters,
        limit,
        offset,
        total: data.result.total ?? data.result.records.length,
        records: data.result.records,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    return json(
      { success: false, error: timedOut ? 'Upstream request timed out' : 'Failed to reach upstream' },
      { status: timedOut ? 504 : 502 }
    );
  }
}
