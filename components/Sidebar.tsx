"use client";

import {
  CIRCLE_RADIUS_METERS,
  CONFIDENCE_LEVELS,
  GROUPING_RADIUS_KM,
  SOURCES,
  TIME_RANGE_OPTIONS,
} from "@/lib/config";
import type { Confidence, FiresApiError, Source, TimeRange } from "@/lib/types";
import { useLocale } from "./LocaleProvider";

interface SidebarProps {
  open: boolean;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  sources: Source[];
  onSourcesChange: (sources: Source[]) => void;
  circleRadiusMeters: number;
  onCircleRadiusChange: (value: number) => void;
  groupingRadiusKm: number;
  onGroupingRadiusChange: (value: number) => void;
  confidenceFilter: Confidence[];
  onConfidenceFilterChange: (confidence: Confidence[]) => void;
  errors: FiresApiError[];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
      {children}
    </h2>
  );
}

function SliderValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-semibold tabular-nums text-ember-600">
      {children}
    </span>
  );
}

export default function Sidebar({
  open,
  range,
  onRangeChange,
  sources,
  onSourcesChange,
  circleRadiusMeters,
  onCircleRadiusChange,
  groupingRadiusKm,
  onGroupingRadiusChange,
  confidenceFilter,
  onConfidenceFilterChange,
  errors,
}: SidebarProps) {
  const { t } = useLocale();

  if (!open) return null;

  function toggleSource(source: Source) {
    if (sources.includes(source)) {
      onSourcesChange(sources.filter((s) => s !== source));
    } else {
      onSourcesChange([...sources, source]);
    }
  }

  function toggleConfidence(confidence: Confidence) {
    if (confidenceFilter.includes(confidence)) {
      onConfidenceFilterChange(confidenceFilter.filter((c) => c !== confidence));
    } else {
      onConfidenceFilterChange([...confidenceFilter, confidence]);
    }
  }

  return (
    <aside className="absolute top-4 right-4 bottom-4 z-10 w-[21rem] max-w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white/85 shadow-xl backdrop-blur-xl">
      <div className="space-y-8 px-6 py-7">
        <section>
          <div className="mb-3">
            <SectionLabel>{t.sidebar.timeRange}</SectionLabel>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-neutral-100 p-1">
            {TIME_RANGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onRangeChange(option.id)}
                className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                  range === option.id
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {t.timeRange[option.id]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <SectionLabel>{t.sidebar.circleRadius}</SectionLabel>
            <SliderValue>{circleRadiusMeters} m</SliderValue>
          </div>
          <input
            type="range"
            min={CIRCLE_RADIUS_METERS.min}
            max={CIRCLE_RADIUS_METERS.max}
            step={CIRCLE_RADIUS_METERS.step}
            value={circleRadiusMeters}
            onChange={(e) => onCircleRadiusChange(Number(e.target.value))}
            className="w-full"
          />
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <SectionLabel>{t.sidebar.groupingRadius}</SectionLabel>
            <SliderValue>{groupingRadiusKm} km</SliderValue>
          </div>
          <input
            type="range"
            min={GROUPING_RADIUS_KM.min}
            max={GROUPING_RADIUS_KM.max}
            step={GROUPING_RADIUS_KM.step}
            value={groupingRadiusKm}
            onChange={(e) => onGroupingRadiusChange(Number(e.target.value))}
            className="w-full"
          />
        </section>

        <section>
          <div className="mb-2">
            <SectionLabel>{t.sidebar.sources}</SectionLabel>
          </div>
          <div>
            {SOURCES.map((source) => (
              <label
                key={source.id}
                className="-mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-[15px] text-neutral-800 hover:bg-neutral-100/80"
              >
                <input
                  type="checkbox"
                  checked={sources.includes(source.id)}
                  onChange={() => toggleSource(source.id)}
                  className="h-4 w-4"
                />
                {source.label}
              </label>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2">
            <SectionLabel>{t.sidebar.confidence}</SectionLabel>
          </div>
          <div>
            {CONFIDENCE_LEVELS.map((level) => (
              <label
                key={level.id}
                className="-mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-[15px] text-neutral-800 hover:bg-neutral-100/80"
              >
                <input
                  type="checkbox"
                  checked={confidenceFilter.includes(level.id)}
                  onChange={() => toggleConfidence(level.id)}
                  className="h-4 w-4"
                />
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: level.color }}
                />
                {t.confidence[level.id]}
              </label>
            ))}
          </div>
        </section>

        {errors.length > 0 && (
          <section>
            <div className="mb-3">
              <SectionLabel>{t.sidebar.fetchErrors}</SectionLabel>
            </div>
            <ul className="space-y-2">
              {errors.map((e) => (
                <li
                  key={e.source}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
                >
                  <span className="font-medium">{e.source}</span>: {e.message || t.errors.fetchFailed}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}
