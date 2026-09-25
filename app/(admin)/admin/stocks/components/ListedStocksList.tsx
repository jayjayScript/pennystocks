"use client";

import React, { useState } from "react";

import { Icon } from "@iconify/react";

import { useStocks, useDeleteStock, useUpdateStock } from "@/hooks/queries";
import type { Stock } from "@/types/api";

const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);

type EditForm = {
  name: string;
  acronym: string;
  lastPrice: string;
  change24h: string;
  rateOfChange: string;
  category: string;
  exchange: string;
  initialListingPrice: string;
};

export default function ListedStocksList() {
  const { data: stocksData, isLoading } = useStocks(1, 50);

  const deleteMut = useDeleteStock();
  const updateMut = useUpdateStock();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Edit modal state
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "",
    acronym: "",
    lastPrice: "",
    change24h: "",
    rateOfChange: "",
    category: "",
    exchange: "",
    initialListingPrice: "",
  });
  const [editError, setEditError] = useState("");

  const openEdit = (stock: Stock) => {
    setEditForm({
      name: stock.name ?? "",
      acronym: stock.acronym ?? "",
      lastPrice: String(stock.lastPrice ?? ""),
      change24h: String(stock.change24h ?? ""),
      rateOfChange: String(stock.rateOfChange ?? ""),
      category: stock.category ?? "",
      exchange: stock.exchange ?? "",
      initialListingPrice:
        stock.initialListingPrice !== undefined
          ? String(stock.initialListingPrice)
          : "",
    });
    setEditError("");
    setEditingStock(stock);
  };

  const handleLastPriceChange = (val: string) => {
    const newPrice = parseFloat(val);
    const prevPrice = editingStock?.lastPrice;

    if (!isNaN(newPrice) && prevPrice !== undefined && prevPrice > 0) {
      const diff = newPrice - prevPrice;
      const roc = ((newPrice - prevPrice) / prevPrice) * 100;
      setEditForm((f) => ({
        ...f,
        lastPrice: val,
        change24h: diff.toFixed(2),
        rateOfChange: roc.toFixed(2),
      }));
    } else if (!isNaN(newPrice) && (prevPrice === undefined || prevPrice === 0)) {
      setEditForm((f) => ({
        ...f,
        lastPrice: val,
        change24h: "0.00",
        rateOfChange: "0.00",
      }));
    } else {
      setEditForm((f) => ({
        ...f,
        lastPrice: val,
      }));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingStock) return;
    setEditError("");

    // Only send fields with a usable value; PATCH accepts a partial payload.
    const data: Parameters<typeof updateMut.mutateAsync>[0]["data"] = {};
    if (editForm.name.trim()) data.name = editForm.name.trim();
    if (editForm.acronym.trim()) data.acronym = editForm.acronym.trim();
    if (editForm.lastPrice.trim() !== "")
      data.lastPrice = Number(editForm.lastPrice);
    if (editForm.change24h.trim() !== "")
      data.change24h = Number(editForm.change24h);
    if (editForm.rateOfChange.trim() !== "")
      data.rateOfChange = Number(editForm.rateOfChange);
    if (editForm.category.trim()) data.category = editForm.category.trim();
    if (editForm.exchange.trim()) data.exchange = editForm.exchange.trim();
    if (editForm.initialListingPrice.trim() !== "")
      data.initialListingPrice = Number(editForm.initialListingPrice);

    if (Object.keys(data).length === 0) {
      setEditError("Nothing to update.");
      return;
    }

    try {
      await updateMut.mutateAsync({ id: editingStock._id, data });
      setEditingStock(null);
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to update stock.",
      );
    }
  };

  const stocks = stocksData?.data ?? [];

  const filtered = stocks.filter((s) => {
    if (!search) return true;

    const q = search.toLowerCase();

    return (
      s.name?.toLowerCase().includes(q) ||
      s.acronym?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      setDeleteConfirm(null);
    } catch {
      // Mutation error handled by React Query / UI
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-5">
      {/* Search */}
      <div className="relative w-full min-w-0">
        <Icon
          icon="mdi:magnify"
          width={18}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#6b7785" }}
        />

        <input
          type="text"
          placeholder="Search by name or ticker..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="box-border w-full min-w-0 max-w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-penny-text-muted outline-none"
          style={{
            background: "#151d2d",
            border: "1px solid #252f45",
          }}
        />
      </div>

      {/* Stocks Table */}
      <div
        className="w-full min-w-0 overflow-hidden rounded-xl sm:rounded-2xl"
        style={{
          background: "#151d2d",
          border: "1px solid #252f45",
        }}
      >
        <div
          className="min-w-0 px-4 py-3 sm:px-6 sm:py-4"
          style={{
            borderBottom: "1px solid #1d2639",
          }}
        >
          <h2 className="text-base font-bold text-white sm:text-lg">
            All Listed Stocks
          </h2>

          <p
            className="mt-0.5 text-[10px] sm:text-xs"
            style={{ color: "#6b7785" }}
          >
            Stocks currently visible in the marketplace
          </p>
        </div>

        {isLoading ? (
          <div
            className="py-16 text-center"
            style={{ color: "#6b7785" }}
          >
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="px-4 py-16 text-center"
            style={{ color: "#6b7785" }}
          >
            <Icon
              icon="mdi:chart-line-variant"
              width={48}
              className="mx-auto"
            />

            <p className="mt-3 text-sm font-medium">
              No listed stocks yet
            </p>

            <p
              className="mt-1 text-xs"
              style={{ color: "#4a5568" }}
            >
              Approve a pending proposal or create a new stock from the
              &quot;Create Stock&quot; tab.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table Header */}
            <div
              className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-x-4 px-6 py-3 text-xs font-semibold"
              style={{
                background: "#0d1624",
                color: "#6b7785",
              }}
            >
              <span>Stock</span>
              <span className="text-right">Price</span>
              <span className="text-right">24h Change</span>
              <span className="text-right">Actions</span>
            </div>

            <div
              className="min-w-0 divide-y"
              style={{ borderColor: "#1d2639" }}
            >
              {filtered.map((stock) => {
                const isPositive = (stock.rateOfChange ?? 0) >= 0;

                return (
                  <div
                    key={stock._id}
                    className="w-full min-w-0 overflow-hidden px-4 py-3 sm:px-6 sm:py-4 space-y-2.5 md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center md:gap-x-4 md:space-y-0"
                    style={{
                      borderColor: "#1d2639",
                    }}
                  >
                    {/* Stock Info */}
                    <div className="flex min-w-0 max-w-full items-center gap-2 sm:gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold sm:h-10 sm:w-10 sm:rounded-xl sm:text-sm"
                        style={{
                          background: "rgba(0,212,161,0.1)",
                          color: "#00d4a1",
                        }}
                      >
                        {stock.acronym?.[0] ?? "?"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-white sm:text-sm">
                          {stock.acronym}
                        </p>

                        <p
                          className="hidden truncate text-[10px] sm:block sm:text-xs"
                          style={{ color: "#6b7785" }}
                        >
                          {stock.name}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex w-full items-center justify-between gap-2 md:block md:text-right">
                      <span
                        className="shrink-0 text-[10px] sm:text-xs md:hidden"
                        style={{ color: "#6b7785" }}
                      >
                        Price
                      </span>
                      <p className="truncate text-right text-xs font-semibold text-white sm:text-sm">
                        {formatUSD(stock.lastPrice)}
                      </p>
                    </div>

                    {/* Change */}
                    <div className="flex w-full items-center justify-between gap-2 md:block md:text-right">
                      <span
                        className="shrink-0 text-[10px] sm:text-xs md:hidden"
                        style={{ color: "#6b7785" }}
                      >
                        Change
                      </span>
                      <p
                        className="truncate text-right text-xs font-semibold sm:text-sm"
                        style={{ color: isPositive ? "#4CAF50" : "#F44336" }}
                      >
                        {isPositive ? "+" : ""}{stock.rateOfChange?.toFixed(2) ?? "0.00"}%
                      </p>
                    </div>

                    {/* Volume */}
                    <div className="flex w-full items-center justify-between gap-2 md:hidden">
                      <span
                        className="shrink-0 text-[10px] sm:text-xs"
                        style={{ color: "#6b7785" }}
                      >
                        Volume
                      </span>
                      <p className="text-right text-xs font-semibold text-white sm:text-sm">—</p>
                    </div>

                    {/* Actions */}
                    <div className="flex w-full min-w-0 items-center gap-2 pt-1 md:w-auto md:justify-end md:pt-0">
                      <button
                        onClick={() => openEdit(stock)}
                        className="w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer md:w-auto"
                        style={{
                          background: "rgba(0,212,161,0.1)",
                          color: "#00d4a1",
                          border: "1px solid rgba(0,212,161,0.2)",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(stock._id)}
                        className="w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer md:w-auto"
                        style={{
                          background: "rgba(244,67,54,0.1)",
                          color: "#F44336",
                          border: "1px solid rgba(244,67,54,0.2)",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Edit Stock Modal */}
      {editingStock && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/80"
            onClick={() => (updateMut.isPending ? null : setEditingStock(null))}
          />

          <div
            className="fixed left-1/2 top-1/2 z-[60] max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-5 sm:p-6"
            style={{
              background: "#151d2d",
              border: "1px solid #252f45",
            }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Stock</h3>
              <button
                onClick={() => setEditingStock(null)}
                className="rounded-lg p-2"
                style={{ background: "#0d1624" }}
              >
                <Icon icon="mdi:close" width={18} style={{ color: "#9aa3b0" }} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSaveEdit();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold sm:text-xs" style={{ color: "#6b7785" }}>
                    Name
                  </label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl px-4 py-2.5 text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold sm:text-xs" style={{ color: "#6b7785" }}>
                    Ticker
                  </label>
                  <input
                    value={editForm.acronym}
                    onChange={(e) => setEditForm((f) => ({ ...f, acronym: e.target.value }))}
                    className="w-full rounded-xl px-4 py-2.5 text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold sm:text-xs" style={{ color: "#6b7785" }}>
                    Last Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.lastPrice}
                    onChange={(e) => handleLastPriceChange(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold sm:text-xs" style={{ color: "#6b7785" }}>
                    Initial Listing Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.initialListingPrice}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, initialListingPrice: e.target.value }))
                    }
                    className="w-full rounded-xl px-4 py-2.5 text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold sm:text-xs" style={{ color: "#6b7785" }}>
                      24h Change ($)
                    </label>
                    <span className="text-[10px] font-medium" style={{ color: "#00d4a1" }}>auto-derived</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    readOnly
                    tabIndex={-1}
                    value={editForm.change24h}
                    className="w-full rounded-xl px-4 py-2.5 text-sm cursor-not-allowed opacity-80"
                    style={{ background: "#0a101d", border: "1px solid #1d2639", color: "#00d4a1" }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold sm:text-xs" style={{ color: "#6b7785" }}>
                      Rate of Change (%)
                    </label>
                    <span className="text-[10px] font-medium" style={{ color: "#00d4a1" }}>auto-derived</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    readOnly
                    tabIndex={-1}
                    value={editForm.rateOfChange}
                    className="w-full rounded-xl px-4 py-2.5 text-sm cursor-not-allowed opacity-80"
                    style={{ background: "#0a101d", border: "1px solid #1d2639", color: "#00d4a1" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold sm:text-xs" style={{ color: "#6b7785" }}>
                    Category
                  </label>
                  <input
                    value={editForm.category}
                    onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl px-4 py-2.5 text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold sm:text-xs" style={{ color: "#6b7785" }}>
                    Exchange
                  </label>
                  <input
                    value={editForm.exchange}
                    onChange={(e) => setEditForm((f) => ({ ...f, exchange: e.target.value }))}
                    className="w-full rounded-xl px-4 py-2.5 text-sm"
                    style={{ background: "#0d1624", border: "1px solid #252f45", color: "white" }}
                  />
                </div>
              </div>

              {editError && (
                <div
                  className="flex items-start gap-2 rounded-xl p-3 text-xs"
                  style={{
                    background: "rgba(244,67,54,0.1)",
                    border: "1px solid rgba(244,67,54,0.3)",
                    color: "#F44336",
                  }}
                >
                  <Icon icon="mdi:alert-circle" width={16} className="mt-0.5 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStock(null)}
                  className="flex-1 rounded-xl py-3 font-bold"
                  style={{
                    background: "#0d1624",
                    color: "#9aa3b0",
                    border: "1px solid #252f45",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMut.isPending}
                  className="flex-1 rounded-xl py-3 font-bold"
                  style={{ background: "#00d4a1", color: "#0d1624" }}
                >
                  {updateMut.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/80"
            onClick={() => setDeleteConfirm(null)}
          />

          <div
            className="fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6"
            style={{
              background: "#151d2d",
              border: "1px solid #252f45",
            }}
          >
            <h3 className="mb-3 text-lg font-bold text-white">
              Remove Stock?
            </h3>

            <p className="mb-5 text-sm text-penny-text-muted">
              This will remove the stock from the marketplace. This action
              cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-xl py-3 font-bold"
                style={{
                  background: "#0d1624",
                  color: "#9aa3b0",
                  border: "1px solid #252f45",
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                className="flex-1 rounded-xl py-3 font-bold"
                style={{
                  background: "#F44336",
                  color: "#fff",
                }}
              >
                {deleteMut.isPending ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}