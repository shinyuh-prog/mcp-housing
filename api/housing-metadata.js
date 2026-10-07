import { DATASET_METADATA_URL, RESALE_RESOURCE_ID, fetchWithTimeout, json } from './_lib/datagov.js';

/**
 * GET /api/housing-metadata
 * Proxies the data.gov.sg v2 dataset metadata for the HDB resale dataset.
 */
export async function GET() {
  try {
    const upstream = await fetchWithTimeout(DATASET_METADATA_URL);
    if (!upstream.ok) {
      return json(
        { success: false, error: `Upstream responded with HTTP ${upstream.status}` },
        { status: 502 }
      );
    }

    const body = await upstream.json();
    const data = body?.data;
    if (!data || typeof data !== 'object') {
      return json({ success: false, error: 'Unexpected upstream response shape' }, { status: 502 });
    }

    return json(
      {
        success: true,
        source: 'data.gov.sg',
        resourceId: RESALE_RESOURCE_ID,
        metadata: {
          datasetId: data.datasetId ?? RESALE_RESOURCE_ID,
          name: data.name ?? null,
          description: data.description ?? null,
          format: data.format ?? null,
          managedBy: data.managedBy ?? null,
          lastUpdatedAt: data.lastUpdatedAt ?? null,
          createdAt: data.createdAt ?? null,
          datasetSize: data.datasetSize ?? null,
          coverageStart: data.coverageStart ?? null,
          coverageEnd: data.coverageEnd ?? null,
          frequency: data.frequency ?? null,
          license: data.license ?? null,
          columns: data.columnMetadata?.order ?? null,
        },
        raw: data,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    return json(
      { success: false, error: timedOut ? 'Upstream request timed out' : 'Failed to reach upstream' },
      { status: timedOut ? 504 : 502 }
    );
  }
}
