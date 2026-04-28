"use client";

import { Button, Label, Radio, RadioGroup, SearchField, Separator, Slider } from "@heroui/react";
import { RotateCcw } from "lucide-react";
import type { CourseFiltersState, CourseSort } from "../types";

const SORT_OPTIONS: { id: CourseSort; label: string }[] = [
  { id: "relevance", label: "Best match" },
  { id: "price-asc", label: "Price ↑" },
  { id: "price-desc", label: "Price ↓" },
  { id: "title-asc", label: "Title A–Z" },
];

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function countSecondaryFilters(filters: CourseFiltersState, priceMax: number): number {
  let n = 0;
  if (filters.category) n += 1;
  if (filters.maxPrice < priceMax) n += 1;
  return n;
}

function countNonDefaultFilters(filters: CourseFiltersState, catalogMaxPrice: number): number {
  let n = 0;
  if (filters.query.trim()) n += 1;
  if (filters.category) n += 1;
  if (filters.maxPrice < catalogMaxPrice) n += 1;
  if (filters.sort !== "relevance") n += 1;
  return n;
}

export interface CourseFilterProps {
  filters: CourseFiltersState;
  onFiltersChange: (next: CourseFiltersState) => void;
  categories: string[];
  priceBounds: { min: number; max: number };
  onReset: () => void;
  /** When the catalog failed to load or is empty, filters are non-interactive. */
  disabled?: boolean;
}

export default function CourseFilter({
  filters,
  onFiltersChange,
  categories,
  priceBounds,
  onReset,
  disabled = false,
}: CourseFilterProps) {
  const secondaryActive = countSecondaryFilters(filters, priceBounds.max);
  const anyActive = countNonDefaultFilters(filters, priceBounds.max) > 0;
  const categoryKey = filters.category ?? "all";

  return (
    <fieldset
      disabled={disabled}
      className={`flex w-full min-w-0 flex-col gap-5 border-0 p-0 ${disabled ? "opacity-55" : ""}`}
    >
      <legend className="sr-only">Course filters</legend>
      <div className="flex items-start justify-between gap-3 border-b border-(--lms-border) pb-3 dark:border-(--lms-border)">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Refine
          </p>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">Narrow results</p>
        </div>
        {secondaryActive > 0 ? (
          <span className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 px-2 text-xs font-semibold text-white">
            {secondaryActive}
          </span>
        ) : null}
      </div>

      <SearchField.Root
        value={filters.query}
        onChange={(value) => onFiltersChange({ ...filters, query: value })}
        aria-label="Search courses"
        className="w-full"
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Search courses…" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField.Root>

      <div className="space-y-2">
        <Label.Root className="text-xs mt-4 mb-2 font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Sort
        </Label.Root>
        <div className="flex flex-col gap-2 mt-4" role="group" aria-label="Sort courses">
          {SORT_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              size="sm"
              variant={filters.sort === opt.id ? "primary" : "outline"}
              className="w-full justify-center"
              onPress={() => onFiltersChange({ ...filters, sort: opt.id })}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator.Root className="bg-(--lms-separator)" />

      <div className="space-y-3">
        <Label.Root className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Topic
        </Label.Root>
        <RadioGroup.Root
          value={categoryKey}
          onChange={(key) =>
            onFiltersChange({
              ...filters,
              category: key === "all" ? null : String(key),
            })
          }
          className="grid gap-2"
        >
          <Radio.Root
            value="all"
            className="flex items-start gap-3 rounded-lg border border-(--lms-border) bg-(--lms-surface) p-2.5 data-[selected]:border-(--lms-accent) data-[selected]:bg-white data-[selected]:ring-1 data-[selected]:ring-(--lms-accent)/35 dark:border-(--lms-border) dark:bg-(--lms-surface-elevated) dark:data-[selected]:border-(--lms-accent-muted) dark:data-[selected]:bg-(--lms-surface-elevated) dark:data-[selected]:ring-(--lms-accent-muted)/40"
          >
            <Radio.Control className="mt-0.5">
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content className="text-sm">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">All topics</span>
            </Radio.Content>
          </Radio.Root>
          {categories.map((cat) => (
            <Radio.Root
              key={cat}
              value={cat}
              className="flex items-start gap-3 rounded-lg border border-(--lms-border) bg-(--lms-surface) p-2.5 data-[selected]:border-(--lms-accent) data-[selected]:bg-white data-[selected]:ring-1 data-[selected]:ring-(--lms-accent)/35 dark:border-(--lms-border) dark:bg-(--lms-surface-elevated) dark:data-[selected]:border-(--lms-accent-muted) dark:data-[selected]:bg-(--lms-surface-elevated) dark:data-[selected]:ring-(--lms-accent-muted)/40"
            >
              <Radio.Control className="mt-0.5">
                <Radio.Indicator />
              </Radio.Control>
              <Radio.Content className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {cat}
              </Radio.Content>
            </Radio.Root>
          ))}
        </RadioGroup.Root>
      </div>

      <Separator.Root className="bg-(--lms-separator)" />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label.Root className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Max price
          </Label.Root>
          <span className="text-sm font-semibold tabular-nums text-(--lms-accent) dark:text-(--lms-accent-muted)">
            {formatUsd(filters.maxPrice)}
          </span>
        </div>
        <Slider.Root
          minValue={priceBounds.min}
          maxValue={priceBounds.max}
          step={5}
          value={filters.maxPrice}
          onChange={(v) => {
            const next = Array.isArray(v) ? v[0] : v;
            onFiltersChange({ ...filters, maxPrice: next ?? priceBounds.max });
          }}
        >
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb aria-label="Maximum course price" />
          </Slider.Track>
          <div className="mt-1 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{formatUsd(priceBounds.min)}</span>
            <span>{formatUsd(priceBounds.max)}</span>
          </div>
        </Slider.Root>
      </div>

      <div className="flex flex-col gap-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-center text-zinc-600 dark:text-zinc-400"
          onPress={() =>
            onFiltersChange({
              ...filters,
              category: null,
              maxPrice: priceBounds.max,
            })
          }
        >
          Clear topic and price
        </Button>
        {anyActive ? (
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-center"
            onPress={onReset}
            aria-label="Reset all filters"
          >
            <RotateCcw className="size-4" />
            Reset all
          </Button>
        ) : null}
      </div>
    </fieldset>
  );
}
