"use client";

import { Icon } from "@iconify/react";

import { portfolioAssetsList } from "@/constants/data";
import Link from "next/link";

export default function AssetPortfolio() {
  return (
    <div
      className="rounded-2xl mx-4 p-6 bg-penny-bg-base border border-[#252f45] overflow-hidden flex flex-col h-auto"
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
        <div className="p-2 rounded-full border border-[#252f45] flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
          <Icon
            icon="mdi:arrow-top-right"
            className="text-penny-text-muted"
            width={20}
          />
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar"
        style={{ maxHeight: "250px" }}
      >
        {portfolioAssetsList.map((asset, index) => (
          <Link
            href={`/dashboard/portfolio/${asset.symbol}`}
            key={index}
            className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: asset.bgColor }}
              >
                {asset.icon && <Icon icon={asset.icon} width={24} />}
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
        ))}
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
