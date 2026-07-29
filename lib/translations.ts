import type { Basemap, Confidence, Locale, TimeRange } from "./types";

export interface Translations {
  nav: {
    tagline: string;
    openOptions: string;
    closeOptions: string;
    switchToFrench: string;
    switchToEnglish: string;
  };
  sidebar: {
    timeRange: string;
    circleRadius: string;
    groupingRadius: string;
    sources: string;
    confidence: string;
    fetchErrors: string;
  };
  timeRange: Record<TimeRange, string>;
  confidence: Record<Confidence, string>;
  basemap: Record<Basemap, string>;
  points: {
    show: string;
    hide: string;
  };
  errors: {
    fetchFailed: string;
  };
  footer: {
    intro: string;
    madeBy: string;
    dataFrom: string;
  };
}

const EN: Translations = {
  nav: {
    tagline: "Live wildfires across France",
    openOptions: "Open options",
    closeOptions: "Close options",
    switchToFrench: "Passer en français",
    switchToEnglish: "Switch to english",
  },
  sidebar: {
    timeRange: "Time range",
    circleRadius: "Circle radius",
    groupingRadius: "Grouping radius",
    sources: "Sources",
    confidence: "Confidence",
    fetchErrors: "Fetch error",
  },
  timeRange: { "24h": "24h", "48h": "48h", "5d": "5 days" },
  confidence: { low: "Low", medium: "Medium", high: "High" },
  basemap: { plan: "Plan", satellite: "Satellite" },
  points: { show: "Show points", hide: "Hide points" },
  errors: {
    fetchFailed: "Failed to load data",
  },
  footer: {
    intro:
      "Live map of wildfires and forest fires across France, built from NASA FIRMS satellite data (VIIRS, MODIS, Landsat).",
    madeBy: "Made by",
    dataFrom: "Data from",
  },
};

const FR: Translations = {
  nav: {
    tagline: "Incendies et feux de forêt en direct en France",
    openOptions: "Ouvrir les options",
    closeOptions: "Fermer les options",
    switchToFrench: "Passer en français",
    switchToEnglish: "Switch to english",
  },
  sidebar: {
    timeRange: "Période",
    circleRadius: "Rayon des points",
    groupingRadius: "Rayon de regroupement",
    sources: "Sources",
    confidence: "Confiance",
    fetchErrors: "Erreur de chargement",
  },
  timeRange: { "24h": "24h", "48h": "48h", "5d": "5 jours" },
  confidence: { low: "Faible", medium: "Moyenne", high: "Élevée" },
  basemap: { plan: "Plan", satellite: "Satellite" },
  points: { show: "Afficher les points", hide: "Masquer les points" },
  errors: {
    fetchFailed: "Échec du chargement des données",
  },
  footer: {
    intro:
      "Carte en direct des feux de forêt et incendies en France, à partir des données satellite NASA FIRMS (VIIRS, MODIS, Landsat).",
    madeBy: "Développé par",
    dataFrom: "Données",
  },
};

export const TRANSLATIONS: Record<Locale, Translations> = { en: EN, fr: FR };
