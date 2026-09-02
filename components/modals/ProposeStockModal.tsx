"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useStockRequests } from "@/context/StockRequestContext";

interface ProposeStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialValues = {
  ticker: "",
  name: "",
  type: "Tech",
  exchange: "NASDAQ",
  initialPrice: "",
  description: "",
};

const initialModalState = {
  form: initialValues,
  errors: {} as Record<string, string>,
  status: "idle" as "idle" | "success",
};

export default function ProposeStockModal({ isOpen, onClose }: ProposeStockModalProps) {
  const { submitStockRequest } = useStockRequests();
  const [{ form, errors, status }, setModalState] = useState(initialModalState);

  const setForm = (form: typeof initialValues) =>
    setModalState((prev) => ({ ...prev, form }));
  const setErrors = (errors: Record<string, string>) =>
    setModalState((prev) => ({ ...prev, errors }));
  const setStatus = (status: "idle" | "success") =>
    setModalState((prev) => ({ ...prev, status }));

  // State is reset in handleClose so we don't call setState inside an effect body.

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.ticker || form.ticker.length < 2 || form.ticker.length > 5) {
      newErrors.ticker = "Ticker must be 2-5 characters";
    }
    if (!form.name || form.name.length < 2) {
      newErrors.name = "Company name is required";
    }
    const price = parseFloat(form.initialPrice);
    if (isNaN(price) || price <= 0) {
      newErrors.initialPrice = "Initial price must be a positive number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    submitStockRequest({
      ticker: form.ticker.toUpperCase(),
      name: form.name,
      type: form.type,
      exchange: form.exchange,
      initialPrice: parseFloat(form.initialPrice),
      description: form.description,
    });

    setStatus("success");
  };

  const handleClose = () => {
    setModalState(initialModalState);
    onClose();
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  const inputStyles = {
    background: "#0d1624",
    border: "1px solid #252f45",
    color: "white",
    outline: "none",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center md:p-4 bg-black/80 backdrop-blur-md"
      onClick={handleBackdrop}
    >
      <div
        className="w-full h-screen md:h-auto max-w-lg rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #141e30 0%, #0d1624 100%)",
          border: "1px solid #252f45",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1d2639] mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00d4a1]/15 text-[#00d4a1]">
              <Icon icon="mdi:bank-outline" width={22} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Propose New Stock</h2>
              <p className="text-xs text-penny-text-muted mt-0.5">Submit a stock request to the Admin for approval</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-penny-text-muted hover:text-white transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" width={18} />
          </button>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#00d4a1]/15 flex items-center justify-center mb-4">
              <Icon icon="mdi:check-circle" width={36} className="text-[#00d4a1]" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Proposal Submitted</h3>
            <p className="text-sm text-penny-text-muted max-w-xs leading-normal mb-6">
              Your proposal for {form.ticker.toUpperCase()} ({form.name}) has been sent to the Admin. It will be listed in the marketplace once approved.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Ticker Symbol</label>
                <input
                  type="text"
                  name="ticker"
                  value={form.ticker}
                  onChange={handleChange}
                  placeholder="e.g. AAPL"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={inputStyles}
                />
                {errors.ticker && <p className="text-xs text-[#F44336] mt-1">{errors.ticker}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Apple Inc."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={inputStyles}
                />
                {errors.name && <p className="text-xs text-[#F44336] mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Stock Category</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={{ ...inputStyles, appearance: "none" }}
                >
                  <option value="Blue Chip">Blue Chip</option>
                  <option value="Growth">Growth</option>
                  <option value="Dividend">Dividend</option>
                  <option value="Tech">Tech</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Stock Exchange</label>
                <select
                  name="exchange"
                  value={form.exchange}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={{ ...inputStyles, appearance: "none" }}
                >
                  <option value="NASDAQ">NASDAQ</option>
                  <option value="NYSE">NYSE</option>
                  <option value="LSE">LSE (London)</option>
                  <option value="JPX">JPX (Tokyo)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Initial Listing Price ($)</label>
              <input
                type="number"
                name="initialPrice"
                value={form.initialPrice}
                onChange={handleChange}
                placeholder="e.g. 150.00"
                step="0.01"
                min="0.01"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                style={inputStyles}
              />
              {errors.initialPrice && <p className="text-xs text-[#F44336] mt-1">{errors.initialPrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">Company Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Briefly describe what this company does..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
                style={inputStyles}
              />
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-penny-text-muted hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Submit Proposal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
