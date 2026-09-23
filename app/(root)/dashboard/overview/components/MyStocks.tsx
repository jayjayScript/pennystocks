"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import ProposeStockModal from "@/components/modals/ProposeStockModal";
import { useQuery } from "@tanstack/react-query";
import { stockProposalsApi } from "@/lib/api/backend";
import type { StockProposal } from "@/types/api";

const MyStocks = ({ stocks: _stocks }: { stocks?: unknown[] }) => {
  void _stocks;
  const [proposeOpen, setProposeOpen] = useState(false);

  const { data: proposalsResponse, isLoading } = useQuery({
    queryKey: ["my-stock-proposals"],
    queryFn: () => stockProposalsApi.mine(1, 10),
    staleTime: 10 * 1000,
  });

  const stockRequests: StockProposal[] = Array.isArray(proposalsResponse)
    ? proposalsResponse
    : proposalsResponse?.data ?? [];

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
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all cursor-pointer"
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
        {isLoading ? (
          <div className="py-8 text-center text-xs text-penny-text-muted">
            <Icon icon="mdi:loading" width={24} className="mx-auto animate-spin mb-2" style={{ color: "#00d4a1" }} />
            Loading stock proposals...
          </div>
        ) : stockRequests.length === 0 ? (
          <div className="py-8 text-center text-xs text-penny-text-muted">
            <p className="font-semibold text-white">No proposed stocks yet</p>
            <p className="mt-1">Propose a company to list it in the marketplace.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {stockRequests.slice(0, 4).map((request) => {
              const isApproved = request.status === "completed";
              const content = (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5 text-white font-extrabold text-sm">
                      {request.ticker[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-penny-text-muted transition-colors">
                        {request.companyName || request.ticker}
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
                    <p className="text-sm font-bold text-white">
                      ${(request.initialListingPrice ?? 0).toFixed(2)}
                    </p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1"
                      style={{
                        background:
                          isApproved
                            ? "rgba(0, 212, 161, 0.15)"
                            : request.status === "rejected"
                            ? "rgba(244, 67, 54, 0.15)"
                            : "rgba(255, 193, 7, 0.15)",
                        color:
                          isApproved
                            ? "#00d4a1"
                            : request.status === "rejected"
                            ? "#F44336"
                            : "#FFC107",
                      }}
                    >
                      {isApproved ? "Approved" : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </>
              );

              if (isApproved) {
                return (
                  <Link
                    href={`/dashboard/marketplace/${request.ticker}`}
                    key={request._id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div key={request._id} className="flex items-center justify-between p-3 rounded-xl group">
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ProposeStockModal isOpen={proposeOpen} onClose={() => setProposeOpen(false)} />
    </div>
  );
};

export default MyStocks;
