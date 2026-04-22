import { sql } from "@vercel/postgres";
import { AdminFilters } from "./AdminFilters";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";

// Per-model cost per image (USD). Adjust to match actual billed rates.
//   recraft-v4: Replicate — verify at https://replicate.com/recraft-ai/recraft-v4
//   gpt-image-2: OpenAI 1024x1024 — verify at https://platform.openai.com/docs/pricing
//   unknown (pre-tracking rows): previously Ideogram V3 default at ~$0.08
const MODEL_COST: Record<string, number> = {
  "recraft-v4": 0.04,
  "gpt-image-2": 0.04,
  "ideogram-v3": 0.08,
  unknown: 0.08,
};

const MODEL_LABEL: Record<string, string> = {
  "recraft-v4": "Node Ξ · Recraft V4",
  "gpt-image-2": "Node ∅ · gpt-image-2",
  "ideogram-v3": "Legacy · Ideogram V3",
  unknown: "Legacy · Unknown",
};

function formatCentralTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface Generation {
  id: number;
  created_at: string;
  ip_address: string;
  city: string | null;
  country: string | null;
  phrase: string;
  subtitle: string | null;
  media_type: string;
  vibe: string | null;
  movie_genre: string | null;
  flyer_style: string | null;
  image_url: string;
  model_used: string | null;
}

type Filters = {
  mediaType: string;
  location: string;
};

async function getGenerations(filters: Filters): Promise<Generation[]> {
  const { mediaType, location } = filters;
  try {
    if (mediaType && location) {
      const { rows } = await sql<Generation>`
        SELECT * FROM generations
        WHERE media_type = ${mediaType}
          AND (CASE
                 WHEN city IS NOT NULL AND country IS NOT NULL THEN city || ', ' || country
                 WHEN country IS NOT NULL THEN country
                 WHEN city IS NOT NULL THEN city
                 ELSE 'Unknown'
               END) = ${location}
        ORDER BY created_at DESC
      `;
      return rows;
    }
    if (mediaType) {
      const { rows } = await sql<Generation>`
        SELECT * FROM generations WHERE media_type = ${mediaType} ORDER BY created_at DESC
      `;
      return rows;
    }
    if (location) {
      const { rows } = await sql<Generation>`
        SELECT * FROM generations
        WHERE (CASE
                 WHEN city IS NOT NULL AND country IS NOT NULL THEN city || ', ' || country
                 WHEN country IS NOT NULL THEN country
                 WHEN city IS NOT NULL THEN city
                 ELSE 'Unknown'
               END) = ${location}
        ORDER BY created_at DESC
      `;
      return rows;
    }
    const { rows } = await sql<Generation>`
      SELECT * FROM generations ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error("Failed to fetch generations:", error);
    return [];
  }
}

async function getModelBreakdown(filters: Filters): Promise<{ model: string; count: number }[]> {
  const { mediaType, location } = filters;
  try {
    if (mediaType && location) {
      const { rows } = await sql<{ model: string; count: string }>`
        SELECT COALESCE(model_used, 'unknown') as model, COUNT(*)::text as count
        FROM generations
        WHERE media_type = ${mediaType}
          AND (CASE
                 WHEN city IS NOT NULL AND country IS NOT NULL THEN city || ', ' || country
                 WHEN country IS NOT NULL THEN country
                 WHEN city IS NOT NULL THEN city
                 ELSE 'Unknown'
               END) = ${location}
        GROUP BY COALESCE(model_used, 'unknown')
      `;
      return rows.map((r) => ({ model: r.model, count: Number(r.count) }));
    }
    if (mediaType) {
      const { rows } = await sql<{ model: string; count: string }>`
        SELECT COALESCE(model_used, 'unknown') as model, COUNT(*)::text as count
        FROM generations
        WHERE media_type = ${mediaType}
        GROUP BY COALESCE(model_used, 'unknown')
      `;
      return rows.map((r) => ({ model: r.model, count: Number(r.count) }));
    }
    if (location) {
      const { rows } = await sql<{ model: string; count: string }>`
        SELECT COALESCE(model_used, 'unknown') as model, COUNT(*)::text as count
        FROM generations
        WHERE (CASE
                 WHEN city IS NOT NULL AND country IS NOT NULL THEN city || ', ' || country
                 WHEN country IS NOT NULL THEN country
                 WHEN city IS NOT NULL THEN city
                 ELSE 'Unknown'
               END) = ${location}
        GROUP BY COALESCE(model_used, 'unknown')
      `;
      return rows.map((r) => ({ model: r.model, count: Number(r.count) }));
    }
    const { rows } = await sql<{ model: string; count: string }>`
      SELECT COALESCE(model_used, 'unknown') as model, COUNT(*)::text as count
      FROM generations
      GROUP BY COALESCE(model_used, 'unknown')
    `;
    return rows.map((r) => ({ model: r.model, count: Number(r.count) }));
  } catch (error) {
    // Fallback when the model_used column doesn't exist yet — bucket everything as unknown
    console.error("Model breakdown failed, falling back to total count:", error);
    try {
      if (mediaType && location) {
        const { rows } = await sql<{ count: string }>`
          SELECT COUNT(*)::text as count FROM generations
          WHERE media_type = ${mediaType}
            AND (CASE
                   WHEN city IS NOT NULL AND country IS NOT NULL THEN city || ', ' || country
                   WHEN country IS NOT NULL THEN country
                   WHEN city IS NOT NULL THEN city
                   ELSE 'Unknown'
                 END) = ${location}
        `;
        const total = Number(rows[0]?.count || 0);
        return total > 0 ? [{ model: "unknown", count: total }] : [];
      }
      if (mediaType) {
        const { rows } = await sql<{ count: string }>`
          SELECT COUNT(*)::text as count FROM generations WHERE media_type = ${mediaType}
        `;
        const total = Number(rows[0]?.count || 0);
        return total > 0 ? [{ model: "unknown", count: total }] : [];
      }
      if (location) {
        const { rows } = await sql<{ count: string }>`
          SELECT COUNT(*)::text as count FROM generations
          WHERE (CASE
                   WHEN city IS NOT NULL AND country IS NOT NULL THEN city || ', ' || country
                   WHEN country IS NOT NULL THEN country
                   WHEN city IS NOT NULL THEN city
                   ELSE 'Unknown'
                 END) = ${location}
        `;
        const total = Number(rows[0]?.count || 0);
        return total > 0 ? [{ model: "unknown", count: total }] : [];
      }
      const { rows } = await sql<{ count: string }>`SELECT COUNT(*)::text as count FROM generations`;
      const total = Number(rows[0]?.count || 0);
      return total > 0 ? [{ model: "unknown", count: total }] : [];
    } catch (fallbackError) {
      console.error("Fallback count also failed:", fallbackError);
      return [];
    }
  }
}

async function getDistinctMediaTypes(): Promise<string[]> {
  try {
    const { rows } = await sql<{ media_type: string }>`
      SELECT DISTINCT media_type FROM generations
      WHERE media_type IS NOT NULL
      ORDER BY media_type
    `;
    return rows.map((r) => r.media_type);
  } catch (error) {
    console.error("Failed to fetch distinct media types:", error);
    return [];
  }
}

async function getDistinctLocations(): Promise<string[]> {
  try {
    const { rows } = await sql<{ location: string }>`
      SELECT DISTINCT (CASE
        WHEN city IS NOT NULL AND country IS NOT NULL THEN city || ', ' || country
        WHEN country IS NOT NULL THEN country
        WHEN city IS NOT NULL THEN city
        ELSE 'Unknown'
      END) as location
      FROM generations
      ORDER BY location
    `;
    return rows.map((r) => r.location);
  } catch (error) {
    console.error("Failed to fetch distinct locations:", error);
    return [];
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ mediaType?: string; location?: string }>;
}) {
  const params = await searchParams;
  const filters: Filters = {
    mediaType: params.mediaType ?? "",
    location: params.location ?? "",
  };
  const hasFilter = !!(filters.mediaType || filters.location);

  const [generations, breakdown, mediaTypes, locations] = await Promise.all([
    getGenerations(filters),
    getModelBreakdown(filters),
    getDistinctMediaTypes(),
    getDistinctLocations(),
  ]);

  const totalCount = breakdown.reduce((sum, b) => sum + b.count, 0);
  const totalSpend = breakdown.reduce(
    (sum, b) => sum + b.count * (MODEL_COST[b.model] ?? MODEL_COST.unknown),
    0,
  );

  return (
    <main className="min-h-screen bg-[#1a1a2e] text-[#eaeaea] p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-[#cc5500] mb-2">Artifacts Admin</h1>
          <p className="text-[#888]">
            Usage tracking and image archive
            {hasFilter && (
              <span className="ml-2 text-[#cc5500]">
                · filtered by
                {filters.mediaType && ` ${filters.mediaType}`}
                {filters.mediaType && filters.location && " in"}
                {filters.location && ` ${filters.location}`}
              </span>
            )}
          </p>
        </header>

        <AdminFilters mediaTypes={mediaTypes} locations={locations} />

        {/* Top-line stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#252542] rounded-lg p-6 border border-[#3d3d5c]">
            <p className="text-sm text-[#888] uppercase tracking-wide mb-1">
              {hasFilter ? "Matching Artifacts" : "Total Artifacts"}
            </p>
            <p className="text-4xl font-bold text-white">{totalCount}</p>
          </div>
          <div className="bg-[#252542] rounded-lg p-6 border border-[#3d3d5c]">
            <p className="text-sm text-[#888] uppercase tracking-wide mb-1">
              {hasFilter ? "Matching Spend" : "Estimated Spend"}
            </p>
            <p className="text-4xl font-bold text-white">${totalSpend.toFixed(2)}</p>
            <p className="text-xs text-[#666] mt-1">Summed across models — see breakdown below</p>
          </div>
        </div>

        {/* Per-model breakdown */}
        <div className="bg-[#252542] rounded-lg p-6 border border-[#3d3d5c] mb-6">
          <p className="text-sm text-[#888] uppercase tracking-wide mb-4">By Model</p>
          {breakdown.length === 0 ? (
            <p className="text-[#666] text-sm">
              {hasFilter ? "No artifacts match these filters." : "No generations yet."}
            </p>
          ) : (
            <div className="space-y-3">
              {breakdown
                .slice()
                .sort((a, b) => b.count - a.count)
                .map(({ model, count }) => {
                  const rate = MODEL_COST[model] ?? MODEL_COST.unknown;
                  const spend = count * rate;
                  const label = MODEL_LABEL[model] ?? model;
                  return (
                    <div
                      key={model}
                      className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#3d3d5c] last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="text-white font-semibold">{label}</p>
                        <p className="text-xs text-[#666]">
                          {count} {count === 1 ? "image" : "images"} @ ${rate.toFixed(3)}/image
                        </p>
                      </div>
                      <p className="text-xl font-semibold text-white tabular-nums">
                        ${spend.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Provider balance links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-[#252542] rounded-lg p-6 border border-[#3d3d5c]">
            <p className="text-sm text-[#888] uppercase tracking-wide mb-1">Replicate</p>
            <p className="text-xs text-[#666] mb-3">Recraft V4 lives here</p>
            <a
              href="https://replicate.com/account/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-[#cc5500] text-white rounded hover:bg-[#dd6611] transition-colors text-sm"
            >
              Check Balance →
            </a>
          </div>
          <div className="bg-[#252542] rounded-lg p-6 border border-[#3d3d5c]">
            <p className="text-sm text-[#888] uppercase tracking-wide mb-1">OpenAI</p>
            <p className="text-xs text-[#666] mb-3">gpt-image-2 lives here</p>
            <a
              href="https://platform.openai.com/usage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-[#cc5500] text-white rounded hover:bg-[#dd6611] transition-colors text-sm"
            >
              Check Usage →
            </a>
          </div>
        </div>

        {/* Generations Grid */}
        {generations.length === 0 ? (
          <div className="bg-[#252542] rounded-lg p-10 border border-[#3d3d5c] text-center">
            <p className="text-[#888]">
              {hasFilter ? "No artifacts match these filters." : "No artifacts generated yet."}
            </p>
            {!hasFilter && (
              <p className="text-sm text-[#666] mt-2">
                Make sure the database is initialized at{" "}
                <code className="bg-[#1a1a2e] px-2 py-1 rounded">/api/admin/init-db</code>
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.map((gen) => {
              const modelLabel = gen.model_used
                ? MODEL_LABEL[gen.model_used] ?? gen.model_used
                : null;
              return (
                <div
                  key={gen.id}
                  className="bg-[#252542] rounded-lg overflow-hidden border border-[#3d3d5c] hover:border-[#cc5500] transition-colors"
                >
                  {/* Image */}
                  <div className="aspect-square relative bg-[#1a1a2e]">
                    <img
                      src={gen.image_url}
                      alt={gen.phrase}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate" title={gen.phrase}>
                      {gen.phrase}
                    </h3>
                    <p className="text-sm text-[#cc5500] mt-1">{gen.media_type}</p>

                    {gen.vibe && (
                      <p className="text-xs text-[#888] mt-2 truncate" title={gen.vibe}>
                        {gen.vibe}
                      </p>
                    )}

                    {modelLabel && (
                      <p className="text-xs text-[#666] mt-2">{modelLabel}</p>
                    )}

                    <div className="mt-3 pt-3 border-t border-[#3d3d5c] text-xs text-[#666]">
                      <div className="flex justify-between">
                        <span>
                          {gen.city && gen.country
                            ? `${gen.city}, ${gen.country}`
                            : gen.country || "Unknown location"}
                        </span>
                        <span>{gen.ip_address}</span>
                      </div>
                      <div className="mt-1 text-[#555]">
                        {formatCentralTime(gen.created_at)} CT
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
