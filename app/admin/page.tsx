import { sql } from "@vercel/postgres";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";

const COST_PER_IMAGE = 0.08; // ideogram-v3-quality approximate cost

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
}

async function getGenerations(): Promise<Generation[]> {
  try {
    const { rows } = await sql<Generation>`
      SELECT * FROM generations ORDER BY created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error("Failed to fetch generations:", error);
    return [];
  }
}

async function getStats() {
  try {
    const { rows } = await sql`SELECT COUNT(*) as count FROM generations`;
    return { count: Number(rows[0]?.count || 0) };
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return { count: 0 };
  }
}

export default async function AdminPage() {
  const [generations, stats] = await Promise.all([
    getGenerations(),
    getStats(),
  ]);

  const estimatedSpend = (stats.count * COST_PER_IMAGE).toFixed(2);

  return (
    <main className="min-h-screen bg-[#1a1a2e] text-[#eaeaea] p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-[#cc5500] mb-2">Artifacts Admin</h1>
          <p className="text-[#888]">Usage tracking and image archive</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-[#252542] rounded-lg p-6 border border-[#3d3d5c]">
            <p className="text-sm text-[#888] uppercase tracking-wide mb-1">Total Artifacts</p>
            <p className="text-4xl font-bold text-white">{stats.count}</p>
          </div>
          <div className="bg-[#252542] rounded-lg p-6 border border-[#3d3d5c]">
            <p className="text-sm text-[#888] uppercase tracking-wide mb-1">Estimated Spend</p>
            <p className="text-4xl font-bold text-white">${estimatedSpend}</p>
            <p className="text-xs text-[#666] mt-1">@ ${COST_PER_IMAGE}/image</p>
          </div>
          <div className="bg-[#252542] rounded-lg p-6 border border-[#3d3d5c]">
            <p className="text-sm text-[#888] uppercase tracking-wide mb-1">Replicate Balance</p>
            <a
              href="https://replicate.com/account/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-4 py-2 bg-[#cc5500] text-white rounded hover:bg-[#dd6611] transition-colors text-sm"
            >
              Check Balance →
            </a>
          </div>
        </div>

        {/* Generations Table/Grid */}
        {generations.length === 0 ? (
          <div className="bg-[#252542] rounded-lg p-10 border border-[#3d3d5c] text-center">
            <p className="text-[#888]">No artifacts generated yet.</p>
            <p className="text-sm text-[#666] mt-2">
              Make sure the database is initialized at{" "}
              <code className="bg-[#1a1a2e] px-2 py-1 rounded">/api/admin/init-db</code>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.map((gen) => (
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
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
