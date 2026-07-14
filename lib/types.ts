export type Confidence = "low" | "medium" | "high";

export type Source =
  | "LANDSAT"
  | "VIIRS_NOAA20"
  | "VIIRS_NOAA21"
  | "VIIRS_SNPP"
  | "MODIS_AQUA"
  | "MODIS_TERRA";

export type TimeRange = "24h" | "48h" | "7d";

export type Basemap = "plan" | "satellite";

export type Locale = "en" | "fr";

export interface FirePoint {
  id: string;
  source: Source;
  lat: number;
  lon: number;
  acquiredAt: string; // ISO 8601 UTC
  confidence: Confidence;
  rawConfidence: string | number;
  frp?: number;
}

export interface FiresApiError {
  source: Source;
  message: string;
}

export interface FiresApiResponse {
  points: FirePoint[];
  meta: {
    generatedAt: string;
    range: TimeRange;
    sources: Source[];
    errors: FiresApiError[];
  };
}

export interface FireCluster {
  id: string;
  lat: number;
  lon: number;
  count: number;
  points: FirePoint[];
  dominantConfidence: Confidence;
}

export type MapPoint =
  | { kind: "single"; point: FirePoint }
  | { kind: "cluster"; cluster: FireCluster };
