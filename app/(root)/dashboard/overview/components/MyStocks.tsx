"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ProposeStockModal from "@/components/modals/ProposeStockModal";

const MOCK_STOCK_REQUESTS = [
  { id: "1", ticker: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", initialPrice: 485.20, status: "approved",  createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "2", ticker: "AMD",  name: "Advanced Micro Devices", exchange: "NASDAQ", initialPrice: 102.75, status: "pending",   createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "3", ticker: "INTC", name: "Intel Corporation",   exchange: "NASDAQ", initialPrice: 28.50,  status: "rejected", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
];

const MyStocks = ({ stocks }: { stocks?: unknown[] }) => {
  void stocks;
  const [proposeOpen, setProposeOpen] = useState(false);

  return (
    <div
      className="rounded-2xl p-6 h-full border border-[#252f45] flex flex-col"
      style={{ background: "linear-gradient(180deg, #111b2c 0%, #0d1624 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full border border-[#252f45] flex items-center justify-center">
            <Icon icon="mdi:trending-up" className="text-white" width={18} />
          </div>
          <h2 className="text-base font-semibold text-white">My Stocks</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setProposeOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all"
          >
            <Icon icon="mdi:plus" width={14} />
            Propose Stock
          </button>
          <Link href="/dashboard/my-stocks">
            <div className="p-2 rounded-full border border-[#252f45] flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
              <Icon
                icon="mdi:arrow-top-right"
                className="text-penny-text-muted"
                width={18}
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Stock rows */}
      <div className="flex flex-col gap-2 flex-1 justify-center">
        <div className="flex flex-col gap-2">
          {MOCK_STOCK_REQUESTS.map((request, i) => {
            const content = (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5 text-white font-extrabold text-sm">
                    {request.ticker[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-penny-text-muted transition-colors">
                      {request.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-penny-text-muted font-bold px-1.5 py-0.5 rounded bg-white/5 uppercase">
                        {request.exchange}
                      </span>
                      <span className="text-xs text-penny-text-muted">{request.ticker}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">${request.initialPrice.toFixed(2)}</p>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1"
                    style={{
                      background:
                        request.status === "approved"
                          ? "rgba(0, 212, 161, 0.15)"
                          : request.status === "rejected"
                          ? "rgba(244, 67, 54, 0.15)"
                          : "rgba(255, 193, 7, 0.15)",
                      color:
                        request.status === "approved"
                          ? "#00d4a1"
                          : request.status === "rejected"
                          ? "#F44336"
                          : "#FFC107",
                    }}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </>
            );

            if (request.status === "approved") {
              return (
                <Link
                  href={`/dashboard/marketplace/${request.ticker}`}
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl group">
                {content}
              </div>
            );
          })}
        </div>
      </div>

      <ProposeStockModal isOpen={proposeOpen} onClose={() => setProposeOpen(false)} />
    </div>
  );
};

export default MyStocks;
