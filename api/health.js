import {
  DATASET_METADATA_URL,
  DATASTORE_SEARCH_URL,
  RESALE_RESOURCE_ID,
  fetchWithTimeout,
  json,
} from './_lib/datagov.js';

const startedAt = Date.now();

async function checkUpstream(name, url) {
  const start = Date.now();
  try {
    const response = await fetchWithTimeout(url, { timeoutMs: 5000 });
    return {
      name,
      status: response.ok ? 'up' : 'down',
      httpStatus: response.status,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      name,
      status: 'down',
      error: error?.name === 'AbortError' ? 'Timed out after 5000ms' : String(error?.message || error),
      latencyMs: Date.now() - start,
    };
  }
}

export async function GET() {
  const searchProbe = `${DATASTORE_SEARCH_URL}?${new URLSearchParams({
    resource_id: RESALE_RESOURCE_ID,
    limit: '1',
  })}`;

  const checks = await Promise.all([
    checkUpstream('data.gov.sg datastore_search', searchProbe),
    checkUpstream('data.gov.sg dataset metadata', DATASET_METADATA_URL),
  ]);

  const healthy = checks.every((check) => check.status === 'up');

  return json(
    {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      endpoints: [
        { method: 'GET', path: '/api/health' },
        { method: 'GET', path: '/api/housing' },
      ],
      checks,
    },
    {
      status: healthy ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}
