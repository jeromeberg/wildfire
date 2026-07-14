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
  errors: {
    fetchFailed: string;
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
  timeRange: { "24h": "24h", "48h": "48h", "7d": "7 days" },
  confidence: { low: "Low", medium: "Medium", high: "High" },
  basemap: { plan: "Plan", satellite: "Satellite" },
  errors: {
    fetchFailed: "Failed to load data",
  },
};

const FR: Translations = {
  nav: {
    tagline: "Incendies en direct en France",
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
  timeRange: { "24h": "24h", "48h": "48h", "7d": "7 jours" },
  confidence: { low: "Faible", medium: "Moyenne", high: "Élevée" },
  basemap: { plan: "Plan", satellite: "Satellite" },
  errors: {
    fetchFailed: "Échec du chargement des données",
  },
};

export const TRANSLATIONS: Record<Locale, Translations> = { en: EN, fr: FR };
