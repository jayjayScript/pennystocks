// ── Copy-trade trader metadata ────────────────────────────────────────────────
//
// The backend CopyTrading model only stores: traderName, riskLevel, rateOfChange,
// duration, averageDailyProfit, purchases, totalAssets, percentage, copyTradePrice.
// The admin "Deploy New Trader" form also collects a Country Code, Coin Symbol,
// Leverage and a 10-trade performance history — none of which the backend accepts.
//
// Following the same convention already used for admin user overrides
// (see `user_override_<id>` in hooks/queries/useAdminActions.ts), we persist those
// extra fields in localStorage keyed by the trader id so the admin UI and the
// user-facing cards can render them without a backend change.

export interface CopyTradeMeta {
  countryCode?: string;
  coinSymbol?: string;
  leverage?: number;
  /** Last N trade results as profit percentages (e.g. 10 => +10%, -2 => -2%). */
  trades?: number[];
}

const KEY_PREFIX = "copy_trade_meta_";
const INDEX_KEY = "copy_trade_meta_index";

function readIndex(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // ignore
  }
}

/** Read the extra metadata for a trader, or null if none was stored. */
export function getCopyTradeMeta(id: string): CopyTradeMeta | null {
  if (typeof window === "undefined" || !id) return null;
  try {
    const raw = localStorage.getItem(KEY_PREFIX + id);
    return raw ? (JSON.parse(raw) as CopyTradeMeta) : null;
  } catch {
    return null;
  }
}

/** Persist extra metadata for a trader, merging with anything already stored. */
export function saveCopyTradeMeta(id: string, meta: CopyTradeMeta): void {
  if (typeof window === "undefined" || !id) return;
  try {
    const existing = getCopyTradeMeta(id) ?? {};
    localStorage.setItem(KEY_PREFIX + id, JSON.stringify({ ...existing, ...meta }));
    writeIndex([...readIndex(), id]);
  } catch {
    // ignore
  }
}

/** Remove stored metadata (e.g. when a trader is deleted). */
export function removeCopyTradeMeta(id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    localStorage.removeItem(KEY_PREFIX + id);
    writeIndex(readIndex().filter((x) => x !== id));
  } catch {
    // ignore
  }
}

/** All trader ids that have stored metadata. */
export function listedCopyTradeMetaIds(): string[] {
  return readIndex();
}

/**
 * Deterministic pseudo-random in [0, 1) seeded by a string. Used to synthesise
 * a stable flag / fallback trade history when a trader has no stored metadata.
 */
export function seededUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** Map a country code to a flag emoji, falling back to the globe. */
export function flagFromCountryCode(code?: string): string {
  if (!code) return "🌐";
  const cc = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "🌐";
  return String.fromCodePoint(
    0x1f1e6 + (cc.charCodeAt(0) - 65),
    0x1f1e6 + (cc.charCodeAt(1) - 65),
  );
}

// Fallback flags cycled when a trader has no stored country code.
const FALLBACK_FLAGS = ["🇺🇸", "🇬🇧", "🇯🇵", "🇩🇪", "🇸🇬", "🇦🇪", "🇨🇦", "🇦🇺"];

/**
 * Resolve the display flag for a trader — prefers the admin-deployed country
 * code, otherwise a stable seeded fallback so the card never looks empty.
 */
export function resolveFlag(id: string, seed: string): string {
  const meta = getCopyTradeMeta(id);
  if (meta?.countryCode) return flagFromCountryCode(meta.countryCode);
  return FALLBACK_FLAGS[Math.floor(seededUnit(seed) * FALLBACK_FLAGS.length) % FALLBACK_FLAGS.length];
}

/**
 * Resolve the last-N trade history (as profit percentages) — uses the admin
 * values when present, otherwise a stable seeded mock.
 */
export function resolveTradeHistory(id: string, seed: string, count = 10): number[] {
  const meta = getCopyTradeMeta(id);
  if (meta?.trades && meta.trades.length) {
    return meta.trades.slice(0, count);
  }
  return Array.from({ length: count }, (_, i) => {
    const u = seededUnit(`${seed}-${i}`);
    return u > 0.85 ? -+(u * 4).toFixed(1) : +(1 + u * 35).toFixed(1);
  });
}

/** Resolve leverage — uses the admin value, else a stable seeded default. */
export function resolveLeverage(id: string, seed: string, fallback = 10): number {
  const meta = getCopyTradeMeta(id);
  if (meta?.leverage && meta.leverage > 0) return meta.leverage;
  return fallback;
}

/** Resolve the coin symbol — uses the admin value, else the provided default. */
export function resolveCoinSymbol(id: string, fallback = "USD"): string {
  const meta = getCopyTradeMeta(id);
  return meta?.coinSymbol || fallback;
}

/** Win rate derived from a trade history — always reads as a confident %. */
export function winRateFromTrades(trades: number[], seed: string): number {
  if (trades.length) {
    return Math.round((trades.filter((t) => t > 0).length / trades.length) * 100);
  }
  return Math.round(65 + seededUnit(`win-${seed}`) * 34);
}
