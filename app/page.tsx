import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TradingViewWidget } from "@/components/trading-view-widget";
import { NewsletterForm } from "@/components/newsletter-form";
import { getLatestStats, getStats24hAgo } from "@/lib/db";

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

async function getZcashStats() {
  try {
    const [stats, stats24h] = await Promise.all([
      getLatestStats(),
      getStats24hAgo(),
    ]);

    if (!stats) {
      // Return default values if no data in DB yet
      return {
        totalSupply: 0,
        shieldedSupply: 0,
        shieldedRatio: 0,
        difficulty: 0,
        blockHeight: 0,
        zecDominance: 0,
        totalSupplyChange24h: null,
        shieldedSupplyChange24h: null,
        shieldedRatioChange24h: null,
        difficultyChange24h: null,
        blockHeightChange24h: null,
        zecDominanceChange24h: null,
      };
    }

    // Calculate 24h % changes
    let totalSupplyChange24h = null;
    let shieldedSupplyChange24h = null;
    let shieldedRatioChange24h = null;
    let difficultyChange24h = null;
    let blockHeightChange24h = null;
    let zecDominanceChange24h = null;

    if (stats24h) {
      if (stats24h.total_supply > 0) {
        totalSupplyChange24h =
          ((stats.total_supply - stats24h.total_supply) / stats24h.total_supply) * 100;
      }
      if (stats24h.shielded_supply > 0) {
        shieldedSupplyChange24h =
          ((stats.shielded_supply - stats24h.shielded_supply) / stats24h.shielded_supply) * 100;
      }
      if (stats24h.shielded_ratio > 0) {
        shieldedRatioChange24h =
          ((stats.shielded_ratio - stats24h.shielded_ratio) / stats24h.shielded_ratio) * 100;
      }
      if (stats24h.difficulty > 0) {
        difficultyChange24h =
          ((stats.difficulty - stats24h.difficulty) / stats24h.difficulty) * 100;
      }
      if (stats24h.block_height > 0) {
        blockHeightChange24h =
          ((stats.block_height - stats24h.block_height) / stats24h.block_height) * 100;
      }
      if (stats24h.zec_dominance > 0) {
        zecDominanceChange24h =
          ((stats.zec_dominance - stats24h.zec_dominance) / stats24h.zec_dominance) * 100;
      }
    }

    return {
      totalSupply: stats.total_supply,
      shieldedSupply: stats.shielded_supply,
      shieldedRatio: stats.shielded_ratio,
      difficulty: stats.difficulty,
      blockHeight: stats.block_height,
      zecDominance: stats.zec_dominance,
      totalSupplyChange24h,
      shieldedSupplyChange24h,
      shieldedRatioChange24h,
      difficultyChange24h,
      blockHeightChange24h,
      zecDominanceChange24h,
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return {
      totalSupply: 0,
      shieldedSupply: 0,
      shieldedRatio: 0,
      difficulty: 0,
      blockHeight: 0,
      zecDominance: 0,
      totalSupplyChange24h: null,
      shieldedSupplyChange24h: null,
      shieldedRatioChange24h: null,
      difficultyChange24h: null,
      blockHeightChange24h: null,
      zecDominanceChange24h: null,
    };
  }
}

export default async function Home() {
  const stats = await getZcashStats();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-1">
          <h1 className="text-2xl md:text-4xl font-bold text-white">
            Only<span className="text-yellow-500">ZEC</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-0">Real-time Zcash Analytics</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* ZEC Supply */}
          <Card className="bg-gray-900/90 border-yellow-500/20">
            <CardHeader className="pb-0 text-center">
              <h3 className="text-lg font-bold text-white">Circulating ZEC Supply</h3>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <div className="text-3xl font-bold text-white">
                {stats.totalSupply === 0 ? "..." : Math.round(stats.totalSupply).toLocaleString()}
              </div>
              {stats.totalSupplyChange24h != null && (
                <div className={`text-sm mt-2 ${stats.totalSupplyChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.totalSupplyChange24h >= 0 ? '▲' : '▼'} {Math.abs(stats.totalSupplyChange24h).toFixed(2)}% (24h)
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shielded ZEC Supply */}
          <Card className="bg-gray-900/90 border-yellow-500/20">
            <CardHeader className="pb-0 text-center">
              <h3 className="text-lg font-bold text-white">Shielded ZEC Supply</h3>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <div className="text-3xl font-bold text-white">
                {stats.shieldedSupply === 0 ? "..." : Math.round(stats.shieldedSupply).toLocaleString()}
              </div>
              {stats.shieldedSupplyChange24h != null && (
                <div className={`text-sm mt-2 ${stats.shieldedSupplyChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.shieldedSupplyChange24h >= 0 ? '▲' : '▼'} {Math.abs(stats.shieldedSupplyChange24h).toFixed(2)}% (24h)
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shielded Ratio */}
          <Card className="bg-gray-900/90 border-yellow-500/20">
            <CardHeader className="pb-0 text-center">
              <h3 className="text-lg font-bold text-white">Shielded Ratio</h3>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <div className="text-3xl font-bold text-white">
                {stats.shieldedRatio === 0 ? "..." : `${stats.shieldedRatio.toFixed(2)}%`}
              </div>
              {stats.shieldedRatioChange24h != null && (
                <div className={`text-sm mt-2 ${stats.shieldedRatioChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.shieldedRatioChange24h >= 0 ? '▲' : '▼'} {Math.abs(stats.shieldedRatioChange24h).toFixed(2)}% (24h)
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Second Row of Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Network Difficulty */}
          <Card className="bg-gray-900/90 border-yellow-500/20">
            <CardHeader className="pb-0 text-center">
              <h3 className="text-lg font-bold text-white">Network Difficulty</h3>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <div className="text-3xl font-bold text-white">
                {stats.difficulty === 0 ? "..." : Math.round(stats.difficulty).toLocaleString()}
              </div>
              {stats.difficultyChange24h != null && (
                <div className={`text-sm mt-2 ${stats.difficultyChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.difficultyChange24h >= 0 ? '▲' : '▼'} {Math.abs(stats.difficultyChange24h).toFixed(2)}% (24h)
                </div>
              )}
            </CardContent>
          </Card>

          {/* Block Height */}
          <Card className="bg-gray-900/90 border-yellow-500/20">
            <CardHeader className="pb-0 text-center">
              <h3 className="text-lg font-bold text-white">Block Height</h3>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <div className="text-3xl font-bold text-white">
                {stats.blockHeight.toLocaleString()}
              </div>
              {stats.blockHeightChange24h != null && (
                <div className={`text-sm mt-2 ${stats.blockHeightChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.blockHeightChange24h >= 0 ? '▲' : '▼'} {Math.abs(stats.blockHeightChange24h).toFixed(2)}% (24h)
                </div>
              )}
            </CardContent>
          </Card>

          {/* ZEC Market Dominance */}
          <Card className="bg-gray-900/90 border-yellow-500/20">
            <CardHeader className="pb-0 text-center">
              <h3 className="text-lg font-bold text-white">ZEC Market Dominance</h3>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <div className="text-3xl font-bold text-white">
                {stats.zecDominance === 0 ? "..." : `${stats.zecDominance.toFixed(3)}%`}
              </div>
              {stats.zecDominanceChange24h != null && (
                <div className={`text-sm mt-2 ${stats.zecDominanceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.zecDominanceChange24h >= 0 ? '▲' : '▼'} {Math.abs(stats.zecDominanceChange24h).toFixed(2)}% (24h)
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <div className="bg-gray-900 rounded-lg p-4 md:p-8 border border-gray-800">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">ZEC Dominance</h2>
            <p className="text-sm text-gray-400">Market share of Zcash in the crypto ecosystem</p>
          </div>
          <div className="w-full h-[300px] md:h-[450px] rounded-lg overflow-hidden">
            <TradingViewWidget />
          </div>
        </div>

        {/* Coming Soon Teaser */}
        <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl p-6 border border-gray-800/50 backdrop-blur-sm mt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">More Metrics Coming Soon</h3>
            <p className="text-sm text-gray-500">Shielded pool data, transaction stats, and more...</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">OnlyZEC.com - Zcash Data Dashboard</p>
            <NewsletterForm />
          </div>
        </div>
      </footer>
    </div>
  );
}
