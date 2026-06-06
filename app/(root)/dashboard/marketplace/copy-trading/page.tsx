"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";

import { motion, AnimatePresence } from "framer-motion";
import { copyTraders } from "@/constants/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function CopyTradingPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
    containScroll: false,
    startIndex: Math.floor(copyTraders.length / 2),
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(Math.floor(copyTraders.length / 2));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<typeof copyTraders[0] | null>(null);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    // Use requestAnimationFrame to sync initial state. This avoids the "cascading renders" 
    // lint error by deferring the state update until after the current render cycle.
    const syncInitialState = () => {
      onSelect(emblaApi);
    };
    
    requestAnimationFrame(syncInitialState);

    emblaApi.on("reInit", onSelect).on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = (index: number) => emblaApi && emblaApi.scrollTo(index);
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const openModal = (trader: typeof copyTraders[0]) => {
    setSelectedTrader(trader);
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0d1624] overflow-hidden selection:bg-penny-accent/30 font-britti-sans-trial">
      {/* ── BACKGROUND WAVY PATTERN ── */}
      <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
        <svg width="100%" height="100%" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 100C300 200 500 0 800 100C1100 200 1300 0 1440 100V800H0V100Z" fill="url(#paint0_linear)" />
          <defs>
            <linearGradient id="paint0_linear" x1="720" y1="0" x2="720" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00D4A1" stopOpacity="0.15" />
              <stop offset="1" stopColor="#0F1624" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Navigation */}
        <header className="px-4 md:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard/marketplace"
              className="w-10 h-10 rounded-full bg-penny-surface-2 border border-penny-border-subtle flex items-center justify-center text-white hover:bg-penny-surface-3 transition-all"
            >
              <Icon icon="mdi:arrow-left" width={20} />
            </Link>
            <span className="text-penny-text-secondary font-medium tracking-wide">UserID24</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-full bg-penny-surface-2 border border-penny-border-subtle flex items-center justify-center group">
              <Icon
                icon="mdi:bell-outline"
                width={20}
                className="text-penny-text-muted group-hover:text-white transition-colors"
              />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-penny-error border-2 border-penny-bg-base" />
            </button>
            <div className="w-10 h-10 rounded-full bg-penny-text-disabled border border-penny-border-subtle overflow-hidden flex items-center justify-center">
              <Icon icon="mdi:account" width={40} className="text-penny-bg-base" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 flex flex-col items-center justify-center mb-4 px-2">
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-5xl font-black text-white tracking-tighter">Copy Trading</h1>
            <p className="text-penny-text-muted text-sm max-w-sm mx-auto leading-relaxed">
              Follow proven traders, Copy their moves, Earn with strategy.
            </p>
          </div>

          {/* Indicators */}
          <div className="flex items-center justify-center gap-1.5 mb-10">
            {copyTraders.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`transition-all duration-300 rounded-full h-1.5 ${
                  (selectedIndex % copyTraders.length) === i ? "w-6 bg-penny-accent" : "w-1.5 bg-penny-border-strong opacity-40 hover:opacity-100"
                }`}
              />
            ))}
          </div>

          {/* Carousel */}
          <div className="w-full max-w-7xl relative group h-full">
            {/* Navigation Buttons */}
            <button
              onClick={scrollPrev}
              className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-[#1A2333]/90 border border-white/30 items-center justify-center text-white hover:bg-penny-accent hover:border-penny-accent hover:text-black transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl hidden md:flex group/btn"
            >
              <Icon icon="mdi:chevron-left" width={36} className="transition-transform group-hover/btn:-translate-x-0.5" />
            </button>

            <button
              onClick={scrollNext}
              className="absolute right-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-[#1A2333]/90 border border-white/30 items-center justify-center text-white hover:bg-penny-accent hover:border-penny-accent hover:text-black transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl hidden md:flex group/btn"
            >
              <Icon icon="mdi:chevron-right" width={36} className="transition-transform group-hover/btn:translate-x-0.5" />
            </button>

            <div className="overflow-visible" ref={emblaRef}>
              <div className="flex">
                {[...copyTraders, ...copyTraders].map((trader, index) => (
                  <div key={`${trader.id}-${index}`} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] px-4">
                    <Card
                      className={`p-0 border-penny-border-default/50 bg-[#0B101B]/90 backdrop-blur-sm relative overflow-hidden shadow-2xl transition-all duration-500 scale-[0.98] ${
                        copyTraders[selectedIndex % copyTraders.length]?.id === trader.id ? "ring-2 ring-penny-accent/30 scale-[1.02]" : "opacity-60"
                      }`}
                    >
                      <div className="p-6 space-y-6">
                        {/* Trader header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-penny-surface-3 border border-penny-border-default flex items-center justify-center text-lg font-extrabold text-white shadow-inner">
                              {trader.avatarInitials}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <p className="text-white font-bold text-lg">{trader.name}</p>
                                {trader.verified && (
                                  <Icon icon="mdi:check-decagram" width={22} className="text-[#FFD100]" />
                                )}
                              </div>
                              <p className="text-penny-text-disabled text-[10px] uppercase font-bold tracking-widest">Risk Level</p>
                            </div>
                          </div>
                        </div>

                        {/* Risk Levels Indicator */}
                        <div className="flex items-center gap-2">
                          {["Low", "Medium", "High"].map((lvl) => (
                            <div
                              key={lvl}
                              className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                                trader.riskLevel === lvl
                                  ? (lvl === "High" ? "bg-penny-error/10 border-penny-error text-penny-error" : 
                                     lvl === "Medium" ? "bg-penny-warning/10 border-penny-warning text-penny-warning" : 
                                     "bg-penny-accent/10 border-penny-accent text-penny-accent")
                                  : "bg-penny-surface-2/40 border-penny-border-subtle/50 text-penny-text-disabled"
                              }`}
                            >
                              {lvl}
                            </div>
                          ))}
                        </div>

                        {/* Large Gain Display */}
                        <div className="space-y-3">
                          <div
                            className="text-6xl font-black tracking-tighter"
                            style={{ color: trader.gainPositive ? "#00D4A1" : "#F44336" }}
                          >
                            {trader.gainPct}
                          </div>
                          <div className="inline-block px-4 py-1.5 rounded-full bg-penny-surface-2 border border-penny-border-subtle text-penny-text-secondary text-xs font-bold transition-colors">
                            {trader.period}
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-penny-border-subtle/30">
                          <div className="space-y-1">
                            <p className="text-penny-text-disabled text-[10px] font-medium leading-none">Average daily profit:</p>
                            <p className="text-white font-bold text-sm">{trader.avgDailyProfit}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-penny-text-disabled text-[10px] font-medium leading-none">Purchases</p>
                            <p className="text-white font-bold text-sm">{trader.copies} Copies</p>
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="space-y-3">
                          <Button
                            onClick={() => openModal(trader)}
                            className="w-full h-14 rounded-2xl bg-white text-black font-black text-lg hover:bg-gray-100 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
                          >
                            Copy Trade
                          </Button>
                          <p className="text-center text-penny-text-disabled text-[11px] font-medium opacity-60">
                            Total assets: {trader.totalAssets}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {isModalOpen && selectedTrader && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-penny-bg-base/90 backdrop-blur-lg"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-[420px] bg-[#141C2D] border border-white/5 rounded-[40px] p-8 space-y-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-penny-accent opacity-[0.05] blur-[80px] pointer-events-none" />

              {/* Modal Body */}
              <div className="text-center space-y-3 relative z-10">
                <h2 className="text-3xl font-black text-white tracking-tighter">Confirm Copy Trade</h2>
                <p className="text-penny-text-muted text-[15px] leading-relaxed px-2">
                  You are about to copy <span className="text-white font-black">{selectedTrader.name}&apos;s</span> active trade.
                </p>
              </div>

              {/* Stats Table */}
              <div className="space-y-5 px-1 relative z-10">
                {[
                  { label: "Copy Trade Price:", value: "$250.00", isBold: true },
                  { label: "Risk Level:", value: selectedTrader.riskLevel, colorClass: selectedTrader.riskLevel === "High" ? "text-penny-error" : selectedTrader.riskLevel === "Medium" ? "text-penny-warning" : "text-penny-accent" },
                  { label: "Current Profit:", value: selectedTrader.gainPct, colorClass: selectedTrader.gainPositive ? "text-penny-accent" : "text-penny-error" },
                  { label: "Duration:", value: selectedTrader.period },
                ].map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <span className="text-penny-text-muted font-medium text-[15px]">{row.label}</span>
                    <span className={`text-[15px] transition-colors font-bold ${row.colorClass || "text-white"}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 relative z-10">
                <Button 
                  className="w-full h-15 rounded-3xl bg-white text-black font-black text-lg hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)] transition-all active:scale-95"
                  onClick={() => setIsModalOpen(false)}
                >
                  Confirm
                </Button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full h-15 rounded-3xl bg-white/5 border border-white/10 font-bold text-penny-text-muted hover:text-white hover:bg-white/10 transition-all text-[15px]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
