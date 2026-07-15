import type { Confidence, Basemap, Locale, Source, TimeRange } from "./types";
import type { StyleSpecification } from "maplibre-gl";

// Falls back to localhost so `next build` works before a production domain
// is configured; set NEXT_PUBLIC_SITE_URL on Vercel once the domain is known.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE = {
  url: SITE_URL,
  name: "Fires",
  defaultLocale: "fr" as Locale,
  title: {
    fr: "Fires - Carte des feux de forêt et incendies en France en direct",
    en: "Fires - Live Wildfire Map of France",
  },
  description: {
    fr: "Carte en direct des feux de forêt et incendies en France à partir des données satellite NASA FIRMS (VIIRS, MODIS, Landsat).",
    en: "Live map of wildfires and forest fires across France from NASA FIRMS satellite data (VIIRS, MODIS, Landsat).",
  },
  keywords: {
    fr: [
      "feux de forêt",
      "incendies",
      "forêt",
      "fontainebleau",
      "feux de forêt France",
      "carte des incendies",
      "incendies en direct",
      "feux de forêt en temps réel",
    ],
    en: ["wildfires France", "forest fires", "wildfire map", "live fire tracker"],
  },
};

export const MAP_DEFAULTS = {
  center: { lat: 46.6, lon: 2.2 },
  zoom: 5.5,
  minZoom: 3,
  maxZoom: 18,
  defaultBasemap: "plan" as Basemap,
};

function rasterStyle(
  tiles: string[],
  attribution: string,
  maxzoom: number
): StyleSpecification {
  return {
    version: 8,
    sources: {
      "raster-tiles": {
        type: "raster",
        tiles,
        tileSize: 256,
        attribution,
        maxzoom,
      },
    },
    layers: [
      {
        id: "raster-tiles",
        type: "raster",
        source: "raster-tiles",
      },
    ],
  };
}

export const BASEMAPS: Record<Basemap, StyleSpecification> = {
  plan: rasterStyle(
    ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    "&copy; OpenStreetMap contributors",
    19
  ),
  satellite: rasterStyle(
    [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    "Esri, Maxar, Earthstar Geographics",
    19
  ),
};

export const TIME_RANGE_OPTIONS: { id: TimeRange; dayRange: number }[] = [
  { id: "24h", dayRange: 1 },
  { id: "48h", dayRange: 2 },
  { id: "7d", dayRange: 5 },
];
export const DEFAULT_TIME_RANGE: TimeRange = "48h";

export const CIRCLE_RADIUS_METERS = { min: 100, max: 2000, step: 100, default: 700 };

export const GROUPING_RADIUS_KM = { min: 1, max: 20, step: 0.5, default: 13 };

// At/above this zoom level, points render ungrouped as individuals.
export const GROUPING_ZOOM_THRESHOLD = 9;

// Clicking a cluster zooms the map to fit its member points.
export const CLUSTER_CLICK_ZOOM = {
  paddingPx: 64,
  maxZoom: 12,
  durationMs: 600,
};

export const SOURCES: { id: Source; label: string; firmsProduct: string; defaultEnabled: boolean }[] = [
  { id: "LANDSAT", label: "Landsat", firmsProduct: "LANDSAT_NRT", defaultEnabled: true },
  { id: "VIIRS_NOAA20", label: "VIIRS NOAA-20", firmsProduct: "VIIRS_NOAA20_NRT", defaultEnabled: true },
  { id: "VIIRS_NOAA21", label: "VIIRS NOAA-21", firmsProduct: "VIIRS_NOAA21_NRT", defaultEnabled: true },
  { id: "VIIRS_SNPP", label: "VIIRS Suomi NPP", firmsProduct: "VIIRS_SNPP_NRT", defaultEnabled: true },
  { id: "MODIS_AQUA", label: "MODIS Aqua", firmsProduct: "MODIS_NRT", defaultEnabled: true },
  { id: "MODIS_TERRA", label: "MODIS Terra", firmsProduct: "MODIS_NRT", defaultEnabled: true },
];

export const CONFIDENCE_LEVELS: { id: Confidence; color: string }[] = [
  { id: "low", color: "#fbbf24" },
  { id: "medium", color: "#f97316" },
  { id: "high", color: "#dc2626" },
];
export const DEFAULT_CONFIDENCE_FILTER: Confidence[] = ["low", "medium", "high"];

// MODIS/Landsat confidence is a 0-100 number; VIIRS confidence is already a
// low/nominal/high category and does not use these thresholds.
export const MODIS_LANDSAT_CONFIDENCE_THRESHOLDS = { low: 30, high: 80 };

export const CACHE = { revalidateSeconds: 900 };

export const MARKER_STYLE = {
  color: "#ef4444",
  opacity: 0.55,
  strokeColor: "#b91c1c",
  clusterColor: "#7f1d1d",
  // cap cluster
  clusterGrowthPx: 4,
  clusterMaxRadiusPx: 36,
};

export const FIRMS_AREA = {
  baseUrl: "https://firms.modaps.eosdis.nasa.gov/api/area/csv",
  // west,south,east,north
  // Mainly France
  franceBoundingBox: "-5.5,41,10,51.5",
};
