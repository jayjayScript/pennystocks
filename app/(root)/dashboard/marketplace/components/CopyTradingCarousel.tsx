"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { copyTraders } from "@/constants/data";

const riskColors: Record<string, string> = {
  Low: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  Medium: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  High: "text-penny-error bg-red-500/10 border-red-500/30",
};

export default function CopyTradingCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
  });

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

    const syncState = () => {
      onInit(emblaApi);
      onSelect(emblaApi);
    };

    emblaApi.on("reInit", syncState).on("select", onSelect);

    const animationFrame = requestAnimationFrame(syncState);

    return () => {
      cancelAnimationFrame(animationFrame);
      emblaApi.off("reInit", syncState).off("select", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi],
  );

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  return (
    <div className="space-y-4 w-full relative px-4">
      {/* Section header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-penny-surface-2 border border-penny-border-subtle flex items-center justify-center shadow-inner">
            <Icon
              icon="mdi:chart-timeline-variant"
              width={18}
              className="text-penny-accent"
            />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Copy Trading
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Dot indicators */}
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

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
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
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
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
      </div>

      {/* Carousel Container with Bleed */}
      <div className="-mx-4 sm:-mx-6 md:-mx-8">
        <div className="overflow-hidden px-4 sm:px-6 md:px-8" ref={emblaRef}>
          <div className="flex">
            {copyTraders.map((trader) => (
              <div
                key={trader.id}
                className="flex-[0_0_85%] min-w-0 pr-4 sm:flex-[0_0_46%] lg:flex-[0_0_31%]"
              >
                <div className="h-full rounded-2xl border border-penny-border-default bg-penny-bg-mid p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-penny-accent/30 transition-colors duration-300">
                  {/* Subtle gradient glow */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-penny-accent opacity-[0.03] blur-3xl pointer-events-none group-hover:opacity-10 transition-opacity" />

                  {/* Trader header */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-penny-surface-3 border border-penny-border-subtle flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-transparent group-hover:ring-penny-accent/20 transition-all">
                        {trader.avatarInitials}
                      </div>
                      <div>
                        <p className="text-white font-bold text-base leading-tight">
                          {trader.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-md border ${riskColors[trader.riskLevel]}`}
                          >
                            {trader.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    {trader.verified && (
                      <Icon
                        icon="mdi:check-decagram"
                        width={22}
                        className="text-amber-400 drop-shadow-sm"
                      />
                    )}
                  </div>

                  {/* Growth Stats */}
                  <div className="space-y-1 relative z-10">
                    <p className="text-penny-text-muted text-[10px] uppercase font-bold tracking-widest">
                      Performance Stats
                    </p>
                    <p
                      className="text-4xl font-black tracking-tighter"
                      style={{
                        color: trader.gainPositive
                          ? "var(--penny-accent)"
                          : "var(--penny-error)",
                      }}
                    >
                      {trader.gainPct}
                    </p>
                  </div>

                  {/* Period & Risk Controls (Visual decoration) */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-lg bg-penny-surface-2 border border-penny-border-subtle text-penny-text-muted">
                      {trader.period}
                    </span>

                    <div className="flex gap-1">
                      {(["Low", "Medium", "High"] as const).map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-1.5 h-1.5 rounded-full ${trader.riskLevel === lvl ? (lvl === "High" ? "bg-red-500" : lvl === "Medium" ? "bg-amber-400" : "bg-sky-400") : "bg-penny-surface-3"}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stats divider */}
                  <div className="grid grid-cols-2 gap-4 items-center pt-4 border-t border-penny-border-subtle relative z-10 mt-auto">
                    <div className="space-y-0.5">
                      <p className="text-penny-text-disabled text-[10px] font-medium leading-none">
                        Avg daily profit
                      </p>
                      <p className="text-white font-bold text-sm">
                        {trader.avgDailyProfit}
                      </p>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <p className="text-penny-text-disabled text-[10px] font-medium leading-none">
                        Purchases
                      </p>
                      <p className="text-white font-bold text-sm">
                        {trader.copies}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/dashboard/marketplace/copy-trading`}
                    className="w-full py-3 rounded-xl bg-penny-accent text-penny-bg-base text-sm font-black uppercase tracking-wider text-center transition-all hover:scale-[1.02] hover:shadow-[0_4px_12px_rgba(0,212,161,0.3)] active:scale-[0.98] relative z-10"
                  >
                    Copy Trade
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
