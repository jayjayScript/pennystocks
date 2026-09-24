"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { useCopyTrading } from "@/hooks/queries";
import type { CopyTrading } from "@/types/api";

function formatInitials(name?: string): string {
  if (!name) return "??";
  return (
    name
      .split(" ")
      .map((n) => n[0] ?? "")
      .join("")
      .substring(0, 2)
      .toUpperCase() || "??"
  );
}

// Country flags cycled for display — the backend trader record has no country field.
const COUNTRY_FLAGS = ["🇺🇸", "🇬🇧", "🇯🇵", "🇩🇪", "🇸🇬", "🇦🇪", "🇨🇦", "🇦🇺"];

/** Deterministic pseudo-random in [0, 1) seeded by a string — keeps mock stats stable across renders. */
function seededUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function flagFor(seed: string): string {
  return COUNTRY_FLAGS[Math.floor(seededUnit(seed) * COUNTRY_FLAGS.length) % COUNTRY_FLAGS.length];
}

/** Stable list of the last N trade profit percentages (as shown in the reference design). */
function mockTradeHistory(seed: string, count = 6): number[] {
  return Array.from({ length: count }, (_, i) => {
    const u = seededUnit(`${seed}-${i}`);
    return u > 0.85 ? -+(u * 4).toFixed(1) : +(1 + u * 35).toFixed(1);
  });
}

function winRateFor(seed: string): number {
  const u = seededUnit(`win-${seed}`);
  return Math.round(65 + u * 34);
}

// ─── Shared trading-card atoms (mirrors the reference design) ────────────────

function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{ width: 15, height: 15, background: "var(--penny-warning)" }}
      title="Verified trader"
    >
      <Icon icon="mdi:check-bold" width={10} style={{ color: "var(--penny-bg-base)" }} />
    </span>
  );
}

function TraderAvatar({ seed, label }: { seed: string; label: string }) {
  return (
    <div className="relative shrink-0">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-extrabold text-white shadow-inner"
        style={{ background: "var(--penny-surface-2)", border: "1px solid var(--penny-border-strong)" }}
      >
        {label}
      </div>
      <span
        className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-[13px]"
        style={{ background: "var(--penny-bg-base)", border: "1px solid var(--penny-border-strong)" }}
      >
        {flagFor(seed)}
      </span>
    </div>
  );
}

function TradePill({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className="text-[11px] font-bold px-1.5 py-1 rounded-md text-center"
      style={{
        background: up ? "rgba(0,212,161,0.10)" : "rgba(244,67,54,0.10)",
        color: up ? "var(--penny-accent)" : "var(--penny-error)",
        border: `1px solid ${up ? "rgba(0,212,161,0.35)" : "rgba(244,67,54,0.35)"}`,
      }}
    >
      {up ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export default function CopyTradingCarousel() {
  const { data: rawSetups, isLoading } = useCopyTrading();

  const traders: CopyTrading[] = useMemo(() => {
    const arr = Array.isArray(rawSetups)
      ? rawSetups
      : ((rawSetups as unknown as { data?: CopyTrading[] })?.data ?? []);
    return arr.filter((s) => s.isActive !== false);
  }, [rawSetups]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onInit = useCallback((api: EmblaCarouselType) => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const syncState = () => { onInit(emblaApi); onSelect(emblaApi); };
    emblaApi.on("reInit", syncState).on("select", onSelect);
    const animationFrame = requestAnimationFrame(syncState);
    return () => { cancelAnimationFrame(animationFrame); emblaApi.off("reInit", syncState).off("select", onSelect); };
  }, [emblaApi, onInit, onSelect]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="space-y-4 w-full relative px-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-penny-surface-2 border border-penny-border-subtle flex items-center justify-center shadow-inner">
            <Icon icon="mdi:chart-timeline-variant" width={18} className="text-penny-accent" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Copy Trading</span>
        </div>

        {traders.length > 1 && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`transition-all duration-300 rounded-full h-1.25 focus:outline-none ${
                    index === selectedIndex
                      ? "w-5 bg-penny-accent shadow-[0_0_8px_rgba(0,212,161,0.5)]"
                      : "w-1.25 bg-penny-border-default hover:bg-penny-text-muted"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  canScrollPrev
                    ? "bg-penny-surface-2 border border-penny-border-subtle text-white hover:border-penny-accent/40 active:scale-95"
                    : "bg-penny-surface-1 border border-penny-border-subtle/30 text-penny-text-disabled cursor-not-allowed"
                }`}
                aria-label="Previous slide"
              >
                <Icon icon="mdi:chevron-left" width={20} />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  canScrollNext
                    ? "bg-penny-surface-2 border border-penny-border-subtle text-white hover:border-penny-accent/40 active:scale-95"
                    : "bg-penny-surface-1 border border-penny-border-subtle/30 text-penny-text-disabled cursor-not-allowed"
                }`}
                aria-label="Next slide"
              >
                <Icon icon="mdi:chevron-right" width={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-[0_0_88%] sm:flex-[0_0_70%] lg:flex-[0_0_48%] h-56 rounded-2xl border border-penny-border-default bg-penny-bg-mid animate-pulse"
            />
          ))}
        </div>
      ) : traders.length === 0 ? (
        <div className="py-10 text-center">
          <Icon icon="mdi:chart-line-variant" width={40} className="mx-auto mb-2 text-penny-text-disabled" />
          <p className="text-penny-text-muted text-sm">No copy trades available yet. Check back soon.</p>
        </div>
      ) : (
        <div className="-mx-4 sm:-mx-6 md:-mx-8">
          <div className="overflow-hidden px-4 sm:px-6 md:px-8" ref={emblaRef}>
            <div className="flex">
              {traders.map((trader) => {
                return (
                  <div
                    key={trader._id}
                    className="flex-[0_0_88%] min-w-0 pr-4 sm:flex-[0_0_70%] lg:flex-[0_0_48%]"
                  >
                    <div className="h-full rounded-2xl border border-penny-border-default bg-penny-bg-mid p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-penny-accent/30 transition-colors duration-300">
                      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-penny-accent opacity-[0.03] blur-3xl pointer-events-none group-hover:opacity-10 transition-opacity" />

                      {/* Header: avatar + name + verified */}
                      <div className="flex items-center gap-3.5 relative z-10">
                        <TraderAvatar
                          seed={trader.traderName}
                          label={formatInitials(trader.traderName)}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-white font-bold text-lg leading-tight truncate">
                              {trader.traderName}
                            </p>
                            <VerifiedBadge />
                          </div>
                          <p className="text-xs mt-0.5 text-penny-text-muted">
                            Leverage{" "}
                            <span className="text-white font-semibold">
                              {Math.max(1, Math.round((trader.percentage ?? 0) * 5))}x
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Coin pill + win rate */}
                      <div className="flex items-center justify-between gap-3 relative z-10">
                        <span
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                          style={{ background: "var(--penny-bg-base)", border: "1px solid var(--penny-border-default)" }}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--penny-warning)" }} />
                          {trader.currency || "USD"}/USDT
                        </span>
                        <span className="text-sm font-bold text-penny-accent">
                          {winRateFor(trader.traderName)}% win rate
                        </span>
                      </div>

                      {/* Last trades */}
                      <div className="pt-4 border-t border-penny-border-subtle relative z-10">
                        <p className="text-penny-text-disabled text-[10px] font-bold uppercase tracking-widest mb-2.5">
                          Last 6 Trades
                        </p>
                        <div className="grid grid-cols-6 gap-1.5">
                          {mockTradeHistory(trader.traderName, 6).map((v, i) => (
                            <TradePill key={i} value={v} />
                          ))}
                        </div>
                      </div>

                      {/* Trade percent + copy */}
                      <div className="pt-4 border-t border-penny-border-subtle flex items-end justify-between gap-4 mt-auto relative z-10">
                        <div>
                          <p className="text-penny-text-disabled text-[10px] font-bold uppercase tracking-widest mb-1">
                            Trade Percent
                          </p>
                          <p className="text-2xl font-black text-white tracking-tight">
                            {Math.max(1, Math.round(trader.percentage ?? 0))}%
                          </p>
                        </div>
                        <Link
                          href="/dashboard/marketplace/copy-trading"
                          className="h-12 px-6 rounded-2xl bg-white text-black font-black text-sm hover:bg-gray-100 transition-all active:scale-[0.98] shadow-lg shadow-black/20 flex items-center"
                        >
                          Copy Trade
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
