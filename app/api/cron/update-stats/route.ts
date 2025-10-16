import { NextResponse } from 'next/server';
import { saveStats, initDatabase } from '@/lib/db';

const GETBLOCK_URL = process.env.GETBLOCK_ACCESS_TOKEN;

export async function GET(request: Request) {
  try {
    // Verify authorization from cron-job.org
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET?.trim();

    if (!expectedSecret) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Extract token, handle "Bearer" prefix case-insensitively, trim whitespace
    const receivedToken = authHeader?.replace(/^Bearer\s+/i, '').trim();

    if (receivedToken !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure table exists
    await initDatabase();

    // Fetch data from GetBlock
    const response = await fetch(GETBLOCK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getblockchaininfo',
        params: [],
        id: 'getblock.io',
      }),
    });

    if (!response.ok) {
      throw new Error(`GetBlock API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    // Extract value pools from response
    const valuePools = data.result?.valuePools || [];

    // Calculate total shielded supply (sum of Sprout, Sapling, Orchard)
    const shieldedSupply = valuePools.reduce((total: number, pool: any) => {
      if (pool.id !== 'transparent' && pool.chainValue) {
        return total + pool.chainValue;
      }
      return total;
    }, 0);

    // Get total supply from chainSupply
    const totalSupply = data.result?.chainSupply?.chainValue || 21000000;

    // Calculate shielded ratio
    const shieldedRatio = ((shieldedSupply / totalSupply) * 100);

    // Get difficulty and block height
    const difficulty = data.result?.difficulty || 0;
    const blockHeight = data.result?.blocks || 0;

    // Fetch ZEC market dominance from CoinGecko
    let zecDominance = 0;
    try {
      const [coinGeckoResponse, globalResponse] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/coins/zcash'),
        fetch('https://api.coingecko.com/api/v3/global')
      ]);

      const zecData = await coinGeckoResponse.json();
      const globalData = await globalResponse.json();

      console.log('CoinGecko responses:', {
        zecStatus: coinGeckoResponse.status,
        globalStatus: globalResponse.status,
        zecHasMarketData: !!zecData.market_data,
        globalHasData: !!globalData.data
      });

      const zecMarketCap = zecData.market_data?.market_cap?.usd || 0;
      const totalMarketCap = globalData.data?.total_market_cap?.usd || 1;

      zecDominance = (zecMarketCap / totalMarketCap) * 100;
    } catch (error) {
      console.error('Failed to fetch ZEC dominance:', error);
      // Keep zecDominance as 0 if API fails
    }

    console.log('Extracted from GetBlock:', { difficulty, blockHeight, zecDominance });

    // Save to database
    const timestamp = await saveStats({
      total_supply: totalSupply,
      shielded_supply: shieldedSupply,
      shielded_ratio: shieldedRatio,
      difficulty,
      block_height: blockHeight,
      zec_dominance: zecDominance,
    });

    return NextResponse.json({
      success: true,
      timestamp,
      data: {
        totalSupply,
        shieldedSupply,
        shieldedRatio,
        difficulty,
        blockHeight,
        zecDominance,
      },
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
