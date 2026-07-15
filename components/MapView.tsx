"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import {
  BASEMAPS,
  CLUSTER_CLICK_ZOOM,
  GROUPING_ZOOM_THRESHOLD,
  MAP_DEFAULTS,
  MARKER_STYLE,
} from "@/lib/config";
import { groupFires } from "@/lib/clustering";
import { toFeatureCollection } from "./FireMarker";
import type { Basemap, Confidence, FirePoint, MapPoint } from "@/lib/types";

const SOURCE_ID = "fires";
const LAYER_ID = "fires-circles";

interface MapViewProps {
  points: FirePoint[];
  confidenceFilter: Confidence[];
  circleRadiusMeters: number;
  groupingRadiusKm: number;
  basemap: Basemap;
}

function metersToPixels(meters: number, latitude: number, zoom: number): number {
  const metersPerPixel = (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;
  return meters / metersPerPixel;
}

function circleRadiusExpression(baseRadiusPx: number): maplibregl.ExpressionSpecification {
  return [
    "case",
    ["==", ["get", "kind"], "cluster"],
    [
      "min",
      MARKER_STYLE.clusterMaxRadiusPx,
      ["+", baseRadiusPx, ["*", MARKER_STYLE.clusterGrowthPx, ["sqrt", ["get", "count"]]]],
    ],
    baseRadiusPx,
  ];
}

export default function MapView({
  points,
  confidenceFilter,
  circleRadiusMeters,
  groupingRadiusKm,
  basemap,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mapPointsRef = useRef<MapPoint[]>([]);
  const circleRadiusMetersRef = useRef(circleRadiusMeters);
  useEffect(() => {
    circleRadiusMetersRef.current = circleRadiusMeters;
  }, [circleRadiusMeters]);

  const [isBelowGroupingThreshold, setIsBelowGroupingThreshold] = useState(
    MAP_DEFAULTS.zoom < GROUPING_ZOOM_THRESHOLD
  );

  const filteredPoints = useMemo(
    () => points.filter((p) => confidenceFilter.includes(p.confidence)),
    [points, confidenceFilter]
  );

  const mapPoints = useMemo(() => {
    return isBelowGroupingThreshold
      ? groupFires(filteredPoints, groupingRadiusKm)
      : filteredPoints.map((point): MapPoint => ({ kind: "single", point }));
  }, [filteredPoints, groupingRadiusKm, isBelowGroupingThreshold]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAPS[MAP_DEFAULTS.defaultBasemap],
      center: [MAP_DEFAULTS.center.lon, MAP_DEFAULTS.center.lat],
      zoom: MAP_DEFAULTS.zoom,
      minZoom: MAP_DEFAULTS.minZoom,
      maxZoom: MAP_DEFAULTS.maxZoom,
      hash: true,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
    setIsBelowGroupingThreshold(map.getZoom() < GROUPING_ZOOM_THRESHOLD);

    function updateRadiusPaint() {
      if (!map.getLayer(LAYER_ID)) return;
      const center = map.getCenter();
      const baseRadiusPx = metersToPixels(circleRadiusMetersRef.current, center.lat, map.getZoom());
      map.setPaintProperty(LAYER_ID, "circle-radius", circleRadiusExpression(baseRadiusPx));
    }

    function ensureSourceAndLayer() {
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
      }
      if (!map.getLayer(LAYER_ID)) {
        map.addLayer({
          id: LAYER_ID,
          type: "circle",
          source: SOURCE_ID,
          paint: {
            "circle-color": [
              "case",
              ["==", ["get", "kind"], "cluster"],
              MARKER_STYLE.clusterColor,
              MARKER_STYLE.color,
            ],
            "circle-opacity": MARKER_STYLE.opacity,
            "circle-stroke-color": MARKER_STYLE.strokeColor,
            "circle-stroke-width": 1,
          },
        });
        // Clicking a cluster zooms to fit its member points.
        map.on("click", LAYER_ID, (e) => {
          const feature = e.features?.[0];
          if (!feature || feature.properties?.kind !== "cluster") return;
          const mapPointId = feature.properties?.mapPointId;
          const mapPoint = mapPointsRef.current.find(
            (mp) => mp.kind === "cluster" && mp.cluster.id === mapPointId
          );
          if (!mapPoint || mapPoint.kind !== "cluster") return;
          const bounds = new maplibregl.LngLatBounds();
          for (const p of mapPoint.cluster.points) bounds.extend([p.lon, p.lat]);
          map.fitBounds(bounds, {
            padding: CLUSTER_CLICK_ZOOM.paddingPx,
            maxZoom: CLUSTER_CLICK_ZOOM.maxZoom,
            duration: CLUSTER_CLICK_ZOOM.durationMs,
          });
        });
        map.on("mouseenter", LAYER_ID, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", LAYER_ID, () => {
          map.getCanvas().style.cursor = "";
        });
      }
      const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      source?.setData(toFeatureCollection(mapPointsRef.current));
      updateRadiusPaint();
    }

    // Fires on the initial style load and again after every setStyle() call
    // (basemap toggle), which otherwise wipes custom sources/layers.
    map.on("style.load", ensureSourceAndLayer);
    map.on("zoom", updateRadiusPaint);
    map.on("move", updateRadiusPaint);
    map.on("zoomend", () => {
      setIsBelowGroupingThreshold(map.getZoom() < GROUPING_ZOOM_THRESHOLD);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Swap basemap style; source/layer are re-added by the "style.load" handler.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(BASEMAPS[basemap]);
  }, [basemap]);

  // Push updated data whenever the computed map points change.
  useEffect(() => {
    mapPointsRef.current = mapPoints;
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    source?.setData(toFeatureCollection(mapPoints));
  }, [mapPoints]);

  // Re-apply circle radius immediately when the slider changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer(LAYER_ID)) return;
    const center = map.getCenter();
    const baseRadiusPx = metersToPixels(circleRadiusMeters, center.lat, map.getZoom());
    map.setPaintProperty(LAYER_ID, "circle-radius", circleRadiusExpression(baseRadiusPx));
  }, [circleRadiusMeters]);

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0 }}
    />
  );
}
