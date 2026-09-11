"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import ListedStocksList from "./components/ListedStocksList";
import PendingProposalsList from "./components/PendingProposalsList";
import RejectedProposalsList from "./components/RejectedProposalsList";
import { useStocks } from "@/hooks/queries";

type TabKey = "listed" | "pending" | "rejected";

export default function StockManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("listed");
  const { data: stocksData } = useStocks(1, 100);

  const allStocks = stocksData?.data ?? [];
  const listedCount = allStocks.filter((s) => s.isApproved === true).length;
  const pendingCount = allStocks.filter((s) => s.isApproved === null || s.isApproved === undefined).length;
  const rejectedCount = allStocks.filter((s) => s.isApproved === false).length;

  const tabs: { key: TabKey; label: string; color: string; count?: number }[] = [
    { key: "listed",   label: "Listed Stocks",     color: "#00d4a1", count: listedCount },
    { key: "pending",  label: "Pending Proposals", color: "#F5C518", count: pendingCount },
    { key: "rejected", label: "Rejected",          color: "#F44336", count: rejectedCount },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Stock Management</h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>
          Review user proposals and manage all stock listings
        </p>
        <p className="text-xs mt-2" style={{ color: "#6b7785" }}>
          To create your own stock, visit{" "}
          <a href="/admin/my-stocks" className="font-semibold hover:underline" style={{ color: "#00d4a1" }}>
            My Stocks
          </a>
          .
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
              style={{
                background: isActive ? `${tab.color}18` : "#151d2d",
                color: isActive ? tab.color : "#9aa3b0",
                border: `1px solid ${isActive ? `${tab.color}44` : "#252f45"}`,
              }}
            >
              {tab.key === "listed" ? (
                <Icon icon="mdi:chart-line" width={14} />
              ) : tab.key === "pending" ? (
                <Icon icon="mdi:clock-outline" width={14} />
              ) : (
                <Icon icon="mdi:close-circle-outline" width={14} />
              )}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: isActive ? `${tab.color}33` : "#252f45",
                    color: isActive ? tab.color : "#9aa3b0",
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "listed" && <ListedStocksList />}
      {activeTab === "pending" && <PendingProposalsList />}
      {activeTab === "rejected" && <RejectedProposalsList />}
    </div>
  );
}
