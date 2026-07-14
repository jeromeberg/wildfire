"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import MapView from "@/components/MapView";
import { useLocale } from "@/components/LocaleProvider";
import {
  CIRCLE_RADIUS_METERS,
  DEFAULT_CONFIDENCE_FILTER,
  DEFAULT_TIME_RANGE,
  GROUPING_RADIUS_KM,
  MAP_DEFAULTS,
  SOURCES,
} from "@/lib/config";
import type { Basemap, Confidence, FirePoint, FiresApiError, Source, TimeRange } from "@/lib/types";

export default function Home() {
  const { t } = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [basemap, setBasemap] = useState<Basemap>(MAP_DEFAULTS.defaultBasemap);

  const [range, setRange] = useState<TimeRange>(DEFAULT_TIME_RANGE);
  const [sources, setSources] = useState<Source[]>(
    SOURCES.filter((s) => s.defaultEnabled).map((s) => s.id)
  );
  const [circleRadiusMeters, setCircleRadiusMeters] = useState(CIRCLE_RADIUS_METERS.default);
  const [groupingRadiusKm, setGroupingRadiusKm] = useState(GROUPING_RADIUS_KM.default);
  const [confidenceFilter, setConfidenceFilter] = useState<Confidence[]>(DEFAULT_CONFIDENCE_FILTER);

  const [points, setPoints] = useState<FirePoint[]>([]);
  const [errors, setErrors] = useState<FiresApiError[]>([]);

  useEffect(() => {
    const params = new URLSearchParams({ range, sources: sources.join(",") });
    let cancelled = false;
    fetch(`/api/fires?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setPoints(data.points ?? []);
        setErrors(data.meta?.errors ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setPoints([]);
        setErrors([{ source: sources[0], message: "" }]);
      });
    return () => {
      cancelled = true;
    };
  }, [range, sources]);

  return (
    <div className="flex flex-col h-screen">
      <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="relative flex-1 min-h-0">
        <MapView
          points={points}
          confidenceFilter={confidenceFilter}
          circleRadiusMeters={circleRadiusMeters}
          groupingRadiusKm={groupingRadiusKm}
          basemap={basemap}
        />
        <button
          type="button"
          onClick={() => setBasemap((b) => (b === "plan" ? "satellite" : "plan"))}
          className="absolute top-3 left-3 z-10 px-3.5 py-1.5 text-sm font-medium rounded-full bg-white/90 backdrop-blur-md border border-neutral-200 shadow-lg text-neutral-700 hover:border-ember-500 hover:text-ember-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-500"
        >
          {t.basemap[basemap === "plan" ? "satellite" : "plan"]}
        </button>
        <Sidebar
          open={sidebarOpen}
          range={range}
          onRangeChange={setRange}
          sources={sources}
          onSourcesChange={setSources}
          circleRadiusMeters={circleRadiusMeters}
          onCircleRadiusChange={setCircleRadiusMeters}
          groupingRadiusKm={groupingRadiusKm}
          onGroupingRadiusChange={setGroupingRadiusKm}
          confidenceFilter={confidenceFilter}
          onConfidenceFilterChange={setConfidenceFilter}
          errors={errors}
        />
      </div>
      <Footer />
    </div>
  );
}
