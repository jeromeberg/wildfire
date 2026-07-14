// Converts clustered map points into GeoJSON for
// MapLibre's source/layer rendering.
//
// Deliberately not a per-point React component: with hundreds to thousands
// of points, a MapLibre `Marker` per point (React-managed DOM) would cause
// reconciliation jank on every pan/zoom. A GeoJSON source + circle layer is
// GPU-composited and updates via a single `setData` call instead.
import type { Confidence, MapPoint } from "@/lib/types";
import type { FeatureCollection, Point } from "geojson";

export interface FireFeatureProperties {
  mapPointId: string;
  kind: "single" | "cluster";
  count: number;
  confidence: Confidence;
}

export function toFeatureCollection(
  mapPoints: MapPoint[]
): FeatureCollection<Point, FireFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: mapPoints.map((mp) => {
      const id = mp.kind === "single" ? mp.point.id : mp.cluster.id;
      const lat = mp.kind === "single" ? mp.point.lat : mp.cluster.lat;
      const lon = mp.kind === "single" ? mp.point.lon : mp.cluster.lon;
      const confidence = mp.kind === "single" ? mp.point.confidence : mp.cluster.dominantConfidence;
      const count = mp.kind === "single" ? 1 : mp.cluster.count;
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: { mapPointId: id, kind: mp.kind, count, confidence },
      };
    }),
  };
}
