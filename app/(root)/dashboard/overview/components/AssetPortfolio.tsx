"use client";

import { Icon } from "@iconify/react";
import { usePortfolio } from "@/context/PortfolioContext";
import Link from "next/link";

export default function AssetPortfolio() {
  const { portfolio } = usePortfolio();

  return (
    <div
      className="rounded-2xl p-6 bg-penny-bg-base border border-[#252f45] overflow-hidden flex flex-col h-full"
      style={{
        background: "linear-gradient(180deg, #111b2c 0%, #0d1624 100%)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full border border-[#252f45] flex items-center justify-center">
            <Icon icon="mdi:chart-line" className="text-white" width={20} />
          </div>
          <h2 className="text-xl font-semibold text-white">Asset Portfolio</h2>
        </div>
        <Link href="/dashboard/portfolio">
          <div className="p-2 rounded-full border border-[#252f45] flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
            <Icon
              icon="mdi:arrow-top-right"
              className="text-penny-text-muted"
              width={20}
            />
          </div>
        </Link>
      </div>

      <div
        className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar"
        style={{ maxHeight: "250px" }}
      >
        {portfolio.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center h-full">
            <Icon icon="mdi:briefcase-outline" className="text-penny-text-muted mb-2" width={28} />
            <p className="text-xs text-penny-text-muted">No assets purchased yet</p>
          </div>
        ) : (
          portfolio.map((asset, index) => (
            <Link
              href={`/dashboard/portfolio/${asset.symbol}`}
              key={index}
              className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: asset.bgColor || "rgba(0, 212, 161, 0.1)",
                    color: asset.bgColor
                      ? asset.bgColor.replace("0.1)", "1)")
                      : "var(--penny-accent)",
                  }}
                >
                  {asset.icon ? (
                    <Icon icon={asset.icon} width={24} />
                  ) : (
                    <span className="text-sm font-bold">{asset.symbol[0]}</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{asset.name}</p>
                  <p className="text-penny-text-muted text-sm">{asset.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{asset.amount}</p>
                <p className="text-penny-text-muted text-sm">{asset.value}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
