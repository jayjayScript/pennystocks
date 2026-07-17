"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { copyTradeSetups as initialSetups } from "@/constants/data";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCopyTrading } from "@/context/CopyTradingContext";

export default function CopyTradingAdminPage() {
  const [copyTradeSetups, setCopyTradeSetups] = useState(() => initialSetups);
  const [selectedSetup, setSelectedSetup] = useState<CopyTradeSetup | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { activeCopyTrades } = useCopyTrading();

  const openAddModal = () => {
    setSelectedSetup(null);
    setShowModal(true);
  };

  const openEditModal = (setup: CopyTradeSetup) => {
    setSelectedSetup(setup);
    setShowModal(true);
  };

  const handleDeleteSetup = (id: string) => {
    if (window.confirm("Are you sure you want to delete this setup?")) {
      setCopyTradeSetups((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const newSetup: CopyTradeSetup = {
      id: selectedSetup?.id || `setup-${Date.now()}`,
      traderId: data.get("traderId") as string || "",
      traderNickname: data.get("traderNickname") as string || "",
      countryFlag: data.get("countryFlag") as string || "",
      country: data.get("country") as string || "",
      leverage: Number(data.get("leverage")) || 1,
      coin: {
        symbol: data.get("coinSymbol") as string || "",
        name: data.get("coinName") as string || "",
        icon: data.get("coinIcon") as string || "",
        bgColor: data.get("coinBgColor") as string || "rgba(0,0,0,0.1)"
      },
      price: Number(data.get("price")) || 0,
      traderWinRate: Number(data.get("traderWinRate")) || 0,
    };

    if (selectedSetup) {
      // Editing existing setup
      setCopyTradeSetups((prev) => prev.map((s) => (s.id === newSetup.id ? newSetup : s)));
    } else {
      // Adding new setup
      setCopyTradeSetups((prev) => [...prev, newSetup]);
    }
    setShowModal(false);
  };

  const isSetupActive = (setupId: string) => {
    return activeCopyTrades.some((trade) => trade.setup.id === setupId);
  };

  const formFields = {
    traderNickname: selectedSetup?.traderNickname || "",
    countryFlag: selectedSetup?.countryFlag || "",
    coinSymbol: selectedSetup?.coin?.symbol || "",
    coinName: selectedSetup?.coin?.name || "",
    coinIcon: selectedSetup?.coin?.icon || "",
    coinBgColor: selectedSetup?.coin?.bgColor || "",
    leverage: selectedSetup?.leverage?.toString() || "1",
    traderWinRate: selectedSetup?.traderWinRate?.toString() || "0",
    price: selectedSetup?.price?.toString() || "0",
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Copy Trading</h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "#9aa3b0" }}>
            Manage expert traders and copy trade setups
          </p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2" style={{ background: "#00d4a1", color: "#0d1624" }}>
          <Icon icon="mdi:plus" width={16} />
          Add Setup
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Total Setups</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white mt-1">{copyTradeSetups.length}</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Active Copies</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white mt-1">{activeCopyTrades?.length || 0}</p>
        </div>
        <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1b2a40 100%)", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-sm" style={{ color: "#9aa3b0" }}>Revenue</p>
          <p className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white mt-1">$4,580</p>
        </div>
      </div>

      {/* Setups List */}
      <div className="rounded-xxl sm:rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4" style={{ borderBottom: "1px solid #1d2639" }}>
          <h2 className="text-base sm:text-lg font-bold text-white">Available Copy Trade Setups</h2>
        </div>
        <div className="divide-y" style={{ borderColor: "#1d2639" }}>
          {copyTradeSetups.map((setup) => (
            <Card key={setup.id} className="mb-4" variant="default" padding="md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Trader Info */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: setup.coin.bgColor }}>
                    {setup.traderNickname.substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-semibold text-white">{setup.traderNickname}</h3>
                      <span className="text-base">{setup.countryFlag}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>{setup.coin.symbol}</span>
                      <span className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>Win: {setup.traderWinRate}%</span>
                    </div>
                  </div>
                </div>
                {/* Stats */}
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>Leverage</p>
                    <p className="text-sm sm:text-base lg:text-lg font-bold text-white">{setup.leverage}x</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>Price</p>
                    <p className="text-sm sm:text-base lg:text-lg font-bold" style={{ color: "#F5C518" }}>{setup.price.toFixed(2)}</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>Active?</p>
                    {isSetupActive(setup.id) ? (
                      <span className="text-green-500 text-sm">●</span>
                    ) : (
                      <span className="text-gray-500 text-sm">○</span>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="mt-4 flex gap-2 sm:ml-4">
                  <Button
                    onClick={() => openEditModal(setup)}
                    className="p-2 rounded-lg"
                    style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
                  >
                    <Icon icon="mdi:pencil" width={16} />
                  </Button>
                  <Button
                    onClick={() => handleDeleteSetup(setup.id)}
                    className="p-2 rounded-lg"
                    style={{ background: "rgba(244,67,54,0.1)", color: "#F44336" }}
                    aria-label="Delete setup"
                  >
                    <Icon icon="mdi:delete" width={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/80" onClick={() => setShowModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] sm:w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {selectedSetup ? "Edit" : "Add"} Copy Trade Setup
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg" style={{ background: "#0d1624" }}>
                <Icon icon="mdi:close" width={18} style={{ color: "#9aa3b0" }} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Trader Nickname</label>
                  <input
                    name="traderNickname"
                    defaultValue={formFields.traderNickname}
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Country Flag (emoji)</label>
                  <input
                    name="countryFlag"
                    defaultValue={formFields.countryFlag}
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Coin Symbol</label>
                  <input
                    name="coinSymbol"
                    defaultValue={formFields.coinSymbol}
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Leverage</label>
                  <input
                    name="leverage"
                    defaultValue={formFields.leverage}
                    min="1"
                    max="100"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Win Rate (%)</label>
                  <input
                    name="traderWinRate"
                    defaultValue={formFields.traderWinRate}
                    min="0"
                    max="100"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "#6b7785" }}>Copy Price ($)</label>
                  <input
                    name="price"
                    defaultValue={formFields.price}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold"
                  style={{ background: "#0d1624", color: "#9aa3b0", border: "1px solid #252f45" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold"
                  style={{ background: "#00d4a1", color: "#0d1624" }}
                >
                  {selectedSetup ? "Update" : "Add"} Setup
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}