// ── Copy-trade display helpers ────────────────────────────────────────────────
//
// The backend CopyTrading model now stores everything the copy-trading UI needs
// (traderName, riskLevel, leverage, winrate, country, currency, last_10_trades,
// duration, percentage), so this module only maps those fields to display values
// shared by the admin catalogue, the marketplace carousel and the user pages.

export interface CopyTradeMeta {
  countryCode?: string;
  coinSymbol?: string;
  leverage?: number;
  /** Last N trade results as profit percentages (e.g. 10 => +10%, -2 => -2%). */
  trades?: number[];
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
