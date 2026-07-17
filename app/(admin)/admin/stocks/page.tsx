"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import StocksList from "./components/StocksList";
import StockEditorForm from "./components/StockEditorForm";
import StockRequestsList from "./components/StockRequestsList";

export default function StockManagementPage() {
  const [activeTab, setActiveTab] = useState<"listed" | "requests">("listed");
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Stocks</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>
            Manage stocks and user listing proposals
          </p>
        </div>
        {activeTab === "listed" && (
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
            style={{
              background: showEditor ? "#151d2d" : "#00d4a1",
              color: showEditor ? "#9aa3b0" : "#0d1624",
              border: showEditor ? "1px solid #252f45" : "1px solid transparent",
            }}
          >
            <Icon icon={showEditor ? "mdi:close" : "mdi:add"} width={16} />
            {showEditor ? "Cancel" : "Add Stock"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl p-1 gap-1" style={{ background: "#0d1624", border: "1px solid #1d2639" }}>
        <button
          onClick={() => { setActiveTab("listed"); setShowEditor(false); }}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            background: activeTab === "listed" ? "rgba(0, 212, 161, 0.12)" : "transparent",
            color: activeTab === "listed" ? "#00d4a1" : "#6b7785",
            border: activeTab === "listed" ? "1px solid rgba(0, 212, 161, 0.3)" : "1px solid transparent",
          }}
        >
          Listed Stocks
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
          style={{
            background: activeTab === "requests" ? "rgba(245, 197, 24, 0.12)" : "transparent",
            color: activeTab === "requests" ? "#F5C518" : "#6b7785",
            border: activeTab === "requests" ? "1px solid rgba(245, 197, 24, 0.3)" : "1px solid transparent",
          }}
        >
          Stock Requests
        </button>
      </div>

      {activeTab === "listed" ? (
        <>
          {showEditor && (
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
              <h2 className="text-base sm:text-lg font-bold text-white mb-4">Create New Stock</h2>
              <StockEditorForm />
            </div>
          )}
          <StocksList />
        </>
      ) : (
        <StockRequestsList />
      )}
    </div>
  );
}