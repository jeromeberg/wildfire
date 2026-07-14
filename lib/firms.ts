import { FIRMS_AREA, SOURCES, TIME_RANGE_OPTIONS, CACHE, MODIS_LANDSAT_CONFIDENCE_THRESHOLDS } from "./config";
import type { Confidence, FirePoint, FiresApiError, Source, TimeRange } from "./types";

interface ProductFetchResult {
  firmsProduct: string;
  rows: Record<string, string>[];
}

function buildUrl(firmsProduct: string, range: TimeRange): string {
  const apiKey = process.env.FIRMS_API_KEY;
  if (!apiKey) throw new Error("FIRMS_API_KEY is not configured");
  const option = TIME_RANGE_OPTIONS.find((o) => o.id === range) ?? TIME_RANGE_OPTIONS[0];
  return `${FIRMS_AREA.baseUrl}/${apiKey}/${firmsProduct}/${FIRMS_AREA.franceBoundingBox}/${option.dayRange}`;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  if (!headers.includes("latitude") || !headers.includes("longitude")) {
    throw new Error(`Unexpected FIRMS response: ${text.slice(0, 200)}`);
  }
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
}

async function fetchFirmsProduct(firmsProduct: string, range: TimeRange): Promise<ProductFetchResult> {
  const url = buildUrl(firmsProduct, range);
  const res = await fetch(url, {
    cache: "force-cache",
    next: { revalidate: CACHE.revalidateSeconds, tags: [`firms:${firmsProduct}:${range}`] },
  });
  if (!res.ok) {
    throw new Error(`FIRMS request for ${firmsProduct} failed with status ${res.status}`);
  }
  const text = await res.text();
  return { firmsProduct, rows: parseCsv(text) };
}

function toIsoTimestamp(acqDate: string, acqTime: string): string {
  const time = acqTime.padStart(4, "0");
  const hh = time.slice(0, 2);
  const mm = time.slice(2, 4);
  return `${acqDate}T${hh}:${mm}:00Z`;
}

function bucketNumericConfidence(value: number): Confidence {
  if (value < MODIS_LANDSAT_CONFIDENCE_THRESHOLDS.low) return "low";
  if (value > MODIS_LANDSAT_CONFIDENCE_THRESHOLDS.high) return "high";
  return "medium";
}

function normalizeConfidence(
  source: Source,
  raw: string
): { confidence: Confidence; rawConfidence: string | number } {
  if (source.startsWith("VIIRS")) {
    const letter = raw.trim().toLowerCase().charAt(0);
    const confidence: Confidence = letter === "l" ? "low" : letter === "h" ? "high" : "medium";
    return { confidence, rawConfidence: raw };
  }
  const numeric = Number(raw);
  if (!Number.isNaN(numeric)) {
    return { confidence: bucketNumericConfidence(numeric), rawConfidence: numeric };
  }
  // Defensive fallback in case a product returns L/M/H letters instead of 0-100.
  const letter = raw.trim().toLowerCase().charAt(0);
  const confidence: Confidence = letter === "l" ? "low" : letter === "h" ? "high" : "medium";
  return { confidence, rawConfidence: raw };
}

function normalizeRow(row: Record<string, string>, source: Source): FirePoint {
  const lat = Number(row.latitude);
  const lon = Number(row.longitude);
  const { confidence, rawConfidence } = normalizeConfidence(source, row.confidence ?? "");
  const frpValue = Number.parseFloat(row.frp ?? "");
  return {
    id: `${source}:${row.latitude}:${row.longitude}:${row.acq_date}:${row.acq_time}`,
    source,
    lat,
    lon,
    acquiredAt: toIsoTimestamp(row.acq_date, row.acq_time),
    confidence,
    rawConfidence,
    frp: Number.isNaN(frpValue) ? undefined : frpValue,
  };
}

// Resolve a fetched product's rows to the requested source(s). Most products
// map 1:1 to a Source, but MODIS_NRT covers both MODIS_AQUA and MODIS_TERRA —
// disambiguated here via the CSV `satellite` column.
function resolveRowSource(row: Record<string, string>, candidateSources: Source[]): Source | null {
  if (candidateSources.length === 1) return candidateSources[0];
  const satellite = (row.satellite ?? "").toLowerCase();
  if (satellite.includes("aqua") && candidateSources.includes("MODIS_AQUA")) return "MODIS_AQUA";
  if (satellite.includes("terra") && candidateSources.includes("MODIS_TERRA")) return "MODIS_TERRA";
  return null;
}

export async function fetchAllFires(
  requestedSources: Source[],
  range: TimeRange
): Promise<{ points: FirePoint[]; errors: FiresApiError[] }> {
  const requestedSet = new Set(requestedSources);

  // Group all configured sources by their upstream FIRMS product, so a
  // shared product (MODIS_NRT) is only fetched once even if both of its
  // sources are requested.
  const productToSources = new Map<string, Source[]>();
  for (const s of SOURCES) {
    if (!productToSources.has(s.firmsProduct)) productToSources.set(s.firmsProduct, []);
    productToSources.get(s.firmsProduct)!.push(s.id);
  }

  const productsToFetch = [...productToSources.entries()].filter(([, sources]) =>
    sources.some((s) => requestedSet.has(s))
  );

  const settled = await Promise.allSettled(
    productsToFetch.map(([firmsProduct]) => fetchFirmsProduct(firmsProduct, range))
  );

  const points: FirePoint[] = [];
  const errors: FiresApiError[] = [];

  settled.forEach((result, i) => {
    const [, candidateSources] = productsToFetch[i];
    if (result.status === "rejected") {
      const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
      for (const source of candidateSources) {
        if (requestedSet.has(source)) errors.push({ source, message });
      }
      return;
    }
    for (const row of result.value.rows) {
      const source = resolveRowSource(row, candidateSources);
      if (!source || !requestedSet.has(source)) continue;
      points.push(normalizeRow(row, source));
    }
  });

  return { points, errors };
}
