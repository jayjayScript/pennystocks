"use client";

import React, { useState } from "react";
import ProposeStockModal from "@/components/modals/ProposeStockModal";
import Link from "next/link";
import { Icon } from "@iconify/react";

const MOCK_STOCK_REQUESTS = [
  { id: "1", ticker: "NVDA", name: "NVIDIA Corporation",      exchange: "NASDAQ", initialPrice: 485.20, status: "approved",  type: "stock", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "2", ticker: "AMD",  name: "Advanced Micro Devices",  exchange: "NASDAQ", initialPrice: 102.75, status: "pending",   type: "stock", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "3", ticker: "INTC", name: "Intel Corporation",       exchange: "NASDAQ", initialPrice: 28.50,  status: "rejected",  type: "stock", createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "4", ticker: "PLTR", name: "Palantir Technologies",   exchange: "NYSE",   initialPrice: 22.10,  status: "pending",   type: "stock", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
];

export default function MyStocksScreen() {
  const stockRequests = MOCK_STOCK_REQUESTS;
  const [proposeOpen, setProposeOpen] = useState(false);

  const totalProposed = stockRequests.length;
  const approvedCount = stockRequests.filter((r) => r.status === "approved").length;
  const pendingCount = stockRequests.filter((r) => r.status === "pending").length;
  const rejectedCount = stockRequests.filter((r) => r.status === "rejected").length;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setProposeOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <Icon icon="mdi:plus" width={16} />
          Propose Stock
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl p-4 bg-[#151d2d] border border-[#252f45]">
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Total Proposed</p>
          <p className="text-xl font-bold text-white">{totalProposed}</p>
        </div>
        <div className="rounded-xl p-4 bg-[#151d2d] border border-[#252f45]">
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Approved</p>
          <p className="text-xl font-bold text-[#00d4a1]">{approvedCount}</p>
        </div>
        <div className="rounded-xl p-4 bg-[#151d2d] border border-[#252f45]">
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Pending</p>
          <p className="text-xl font-bold text-[#FFC107]">{pendingCount}</p>
        </div>
        <div className="rounded-xl p-4 bg-[#151d2d] border border-[#252f45]">
          <p className="text-xs mb-1" style={{ color: "#6b7785" }}>Rejected</p>
          <p className="text-xl font-bold text-[#F44336]">{rejectedCount}</p>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-3">
        {/* Desktop Table Header */}
        <div
          className="hidden md:grid grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_1.5fr] px-5 py-3 rounded-xl text-xs font-semibold tracking-wide"
          style={{ color: "#6b7785", background: "#151d2d" }}
        >
          <span>Asset</span>
          <span className="text-right">Exchange</span>
          <span className="text-right">Init. Price</span>
          <span className="text-right">Status</span>
          <span className="text-right">Proposed Date</span>
        </div>

        <div className="space-y-2.5">
          {stockRequests.map((req) => {
            const content = (
              <div
                className="flex flex-col gap-3 md:flex-row md:items-center
                    md:grid md:grid-cols-[2.5fr_1.2fr_1.2fr_1.2fr_1.5fr]
                    px-4 py-4 md:px-5 md:py-3.5 rounded-2xl border transition-all duration-150"
                style={{ background: "#151d2d", borderColor: "#1d2639" }}
              >
                {/* Asset Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-sm font-extrabold bg-white/5 text-[#00d4a1]">
                    {req.ticker[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white leading-tight truncate">{req.ticker}</p>
                    <p className="text-xs text-penny-text-muted mt-0.5 truncate">
                      {req.name} • <span className="text-[10px] uppercase font-bold">{req.type}</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between md:block md:text-right">
                  <span className="text-xs text-penny-text-muted md:hidden">Exchange:</span>
                  <span className="text-xs font-semibold text-white px-2 py-0.5 rounded bg-white/5 uppercase">{req.exchange}</span>
                </div>

                <div className="flex justify-between md:block md:text-right">
                  <span className="text-xs text-penny-text-muted md:hidden">Initial Price:</span>
                  <p className="text-sm font-bold text-white">${req.initialPrice.toFixed(2)}</p>
                </div>

                <div className="flex justify-between md:block md:text-right">
                  <span className="text-xs text-penny-text-muted md:hidden">Status:</span>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full inline-block"
                    style={{
                      background: req.status === "approved" ? "rgba(0, 212, 161, 0.12)" : req.status === "rejected" ? "rgba(244, 67, 54, 0.12)" : "rgba(255, 193, 7, 0.12)",
                      color: req.status === "approved" ? "#00d4a1" : req.status === "rejected" ? "#F44336" : "#FFC107",
                    }}
                  >
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>

                <div className="flex justify-between md:block md:text-right">
                  <span className="text-xs text-penny-text-muted md:hidden">Requested:</span>
                  <p className="text-xs text-penny-text-muted">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            );

            if (req.status === "approved") {
              return (
                <Link key={req.id} href={`/dashboard/marketplace/${req.ticker}`} className="block group">
                  {content}
                </Link>
              );
            }

            return <div key={req.id}>{content}</div>;
          })}
        </div>
      </div>

      {/* <ProposeStockModal isOpen={proposeOpen} onClose={() => setProposeOpen(false)} /> */}
    </div>
  );
}
