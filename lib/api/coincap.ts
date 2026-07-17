export interface CoinGeckoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

export interface CoinGeckoHistory {
  prices: [number, number][];
}

const BASE_URL = "https://api.coingecko.com/api/v3";

export async function fetchTopAssets(limit: number = 50): Promise<CoinGeckoAsset[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error(`Failed to fetch assets: ${res.status}`);
    return (await res.json()) as CoinGeckoAsset[];
  } catch (error) {
    console.error("Error fetching CoinGecko assets:", error);
    return [];
  }
}

export async function fetchAssetHistory(id: string, days: number = 1): Promise<[number, number][]> {
  try {
    const res = await fetch(
      `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) throw new Error(`Failed to fetch history: ${res.status}`);
    const data: CoinGeckoHistory = await res.json();
    return data.prices;
  } catch (error) {
    console.error(`Error fetching CoinGecko history for ${id}:`, error);
    return [];
  }
}
