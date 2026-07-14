import type { NextRequest } from "next/server";
import { fetchAllFires } from "@/lib/firms";
import { DEFAULT_TIME_RANGE, SOURCES, TIME_RANGE_OPTIONS } from "@/lib/config";
import type { Source, TimeRange } from "@/lib/types";

const VALID_RANGES = new Set(TIME_RANGE_OPTIONS.map((o) => o.id));
const VALID_SOURCES = new Set(SOURCES.map((s) => s.id));
const DEFAULT_SOURCES = SOURCES.filter((s) => s.defaultEnabled).map((s) => s.id);

function parseRange(value: string | null): TimeRange {
  if (value && VALID_RANGES.has(value as TimeRange)) return value as TimeRange;
  return DEFAULT_TIME_RANGE;
}

function parseSources(value: string | null): Source[] {
  if (!value) return DEFAULT_SOURCES;
  const requested = value
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is Source => VALID_SOURCES.has(s as Source));
  return requested.length > 0 ? requested : DEFAULT_SOURCES;
}

export async function GET(request: NextRequest) {
  const range = parseRange(request.nextUrl.searchParams.get("range"));
  const sources = parseSources(request.nextUrl.searchParams.get("sources"));

  const { points, errors } = await fetchAllFires(sources, range);

  return Response.json({
    points,
    meta: {
      generatedAt: new Date().toISOString(),
      range,
      sources,
      errors,
    },
  });
}
