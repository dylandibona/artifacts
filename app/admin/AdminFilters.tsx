"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Props = {
  mediaTypes: string[];
  locations: string[];
};

export function AdminFilters({ mediaTypes, locations }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMediaType = searchParams.get("mediaType") ?? "";
  const currentLocation = searchParams.get("location") ?? "";
  const hasFilter = !!(currentMediaType || currentLocation);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const selectClass =
    "bg-[#252542] border border-[#3d3d5c] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#cc5500] appearance-none pr-8 cursor-pointer";

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="relative">
        <select
          value={currentMediaType}
          onChange={(e) => updateFilter("mediaType", e.target.value)}
          className={selectClass}
        >
          <option value="">All media types</option>
          {mediaTypes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#888] text-xs">▾</span>
      </div>

      <div className="relative">
        <select
          value={currentLocation}
          onChange={(e) => updateFilter("location", e.target.value)}
          className={selectClass}
        >
          <option value="">All locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#888] text-xs">▾</span>
      </div>

      {hasFilter && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-[#888] hover:text-white transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
