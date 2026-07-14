import type { Confidence, FirePoint, MapPoint } from "./types";

const EARTH_RADIUS_KM = 6371;
const KM_PER_DEGREE_LAT = 111;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

const CONFIDENCE_SEVERITY: Record<Confidence, number> = { low: 0, medium: 1, high: 2 };

function dominantConfidence(points: FirePoint[]): Confidence {
  return points.reduce<Confidence>((dominant, p) => {
    return CONFIDENCE_SEVERITY[p.confidence] > CONFIDENCE_SEVERITY[dominant] ? p.confidence : dominant;
  }, "low");
}

function cellKey(lat: number, lon: number, cellSizeDeg: number): string {
  return `${Math.floor(lat / cellSizeDeg)}:${Math.floor(lon / cellSizeDeg)}`;
}

// Coarse grid pre-bucketing + greedy radius merge. Avoids O(n^2) comparisons
// across the full point set while staying simple (no external clustering
// library), appropriate for the hundreds-to-low-thousands of points expected
// per fetch.
export function groupFires(points: FirePoint[], groupingRadiusKm: number): MapPoint[] {
  if (points.length === 0) return [];

  const cellSizeDeg = groupingRadiusKm / KM_PER_DEGREE_LAT;
  const grid = new Map<string, FirePoint[]>();
  for (const point of points) {
    const key = cellKey(point.lat, point.lon, cellSizeDeg);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(point);
  }

  const visited = new Set<string>();
  const result: MapPoint[] = [];

  for (const point of points) {
    if (visited.has(point.id)) continue;
    visited.add(point.id);

    const [cellLat, cellLon] = cellKey(point.lat, point.lon, cellSizeDeg).split(":").map(Number);
    const members: FirePoint[] = [point];

    for (let dLat = -1; dLat <= 1; dLat++) {
      for (let dLon = -1; dLon <= 1; dLon++) {
        const neighborKey = `${cellLat + dLat}:${cellLon + dLon}`;
        const candidates = grid.get(neighborKey);
        if (!candidates) continue;
        for (const candidate of candidates) {
          if (visited.has(candidate.id)) continue;
          if (haversineDistanceKm(point, candidate) <= groupingRadiusKm) {
            visited.add(candidate.id);
            members.push(candidate);
          }
        }
      }
    }

    if (members.length === 1) {
      result.push({ kind: "single", point: members[0] });
    } else {
      const lat = members.reduce((sum, p) => sum + p.lat, 0) / members.length;
      const lon = members.reduce((sum, p) => sum + p.lon, 0) / members.length;
      result.push({
        kind: "cluster",
        cluster: {
          id: `cluster:${point.id}`,
          lat,
          lon,
          count: members.length,
          points: members,
          dominantConfidence: dominantConfidence(members),
        },
      });
    }
  }

  return result;
}
