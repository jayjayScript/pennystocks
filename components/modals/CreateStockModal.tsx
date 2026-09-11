"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateStock } from "@/hooks/queries/useAdminActions";
import { useAuth } from "@/context/AuthContext";

interface CreateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (ticker: string) => void;
}

const initialValues = {
  acronym: "",
  name: "",
  lastPrice: "",
  change24h: "0",
  rateOfChange: "0",
};

const initialState = {
  form: initialValues,
  errors: {} as Record<string, string>,
  status: "idle" as "idle" | "success" | "error",
  errorMessage: "",
};

export default function CreateStockModal({ isOpen, onClose, onSuccess }: CreateStockModalProps) {
  const qc = useQueryClient();
  const createMut = useCreateStock();
  const { user } = useAuth();
  const [{ form, errors, status, errorMessage }, setState] = useState(initialState);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const setForm = (next: typeof initialValues) => setState((p) => ({ ...p, form: next }));
  const setErrors = (next: Record<string, string>) => setState((p) => ({ ...p, errors: next }));
  const setStatus = (next: "idle" | "success" | "error", message = "") =>
    setState((p) => ({ ...p, status: next, errorMessage: message }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      const next = { ...errors };
      delete next[name];
      setErrors(next);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const acronym = form.acronym.trim();
    if (!acronym || acronym.length < 1 || acronym.length > 12) {
      errs.acronym = "Ticker must be 1–12 characters";
    }
    if (!form.name.trim() || form.name.trim().length < 1) {
      errs.name = "Company name is required";
    }
    const price = parseFloat(form.lastPrice);
    if (!form.lastPrice || isNaN(price) || price < 0) {
      errs.lastPrice = "Enter a valid listing price";
    }
    const change24h = parseFloat(form.change24h);
    if (isNaN(change24h)) {
      errs.change24h = "Enter a valid 24h change";
    }
    const rateOfChange = parseFloat(form.rateOfChange);
    if (isNaN(rateOfChange)) {
      errs.rateOfChange = "Enter a valid rate of change";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("idle");

    try {
      await createMut.mutateAsync({
        name: form.name.trim(),
        acronym: form.acronym.trim().toUpperCase(),
        lastPrice: parseFloat(form.lastPrice),
        change24h: parseFloat(form.change24h),
        rateOfChange: parseFloat(form.rateOfChange),
        currency: "USD",
        submittedBy: user?._id,
        isApproved: true,
      });
      qc.invalidateQueries({ queryKey: ["stocks"] });
      setStatus("success");
      onSuccess?.(form.acronym.trim().toUpperCase());
    } catch (err) {
      setStatus("error", err instanceof Error ? err.message : "Failed to create stock");
    }
  };

  const handleClose = () => {
    setState(initialState);
    onClose();
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  const inputStyles: React.CSSProperties = {
    background: "#0d1624",
    border: `1px solid #252f45`,
    color: "white",
    outline: "none",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center md:p-4 bg-black/80 backdrop-blur-md"
      onClick={handleBackdrop}
    >
      <div
        className="w-full h-screen md:h-auto md:max-h-[90vh] max-w-lg rounded-none md:rounded-3xl p-6 shadow-2xl relative overflow-y-auto"
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
              <Icon icon="mdi:chart-line" width={22} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Create New Stock</h2>
              <p className="text-xs text-penny-text-muted mt-0.5">
                Listed immediately in the marketplace
              </p>
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
            <h3 className="text-white font-bold text-lg mb-1">Stock Created &amp; Listed</h3>
            <p className="text-sm text-penny-text-muted max-w-sm leading-normal mb-6">
              <span className="text-white font-semibold">{form.acronym.toUpperCase()}</span>{" "}
              ({form.name}) is now live in the marketplace.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">
                  Ticker Symbol *
                </label>
                <input
                  type="text"
                  name="acronym"
                  value={form.acronym}
                  onChange={handleChange}
                  placeholder="e.g. AAPL"
                  maxLength={12}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={{ ...inputStyles, borderColor: errors.acronym ? "#F44336" : "#252f45" }}
                />
                {errors.acronym && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{errors.acronym}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Apple Inc."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={{ ...inputStyles, borderColor: errors.name ? "#F44336" : "#252f45" }}
                />
                {errors.name && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">
                  Listing Price ($) *
                </label>
                <input
                  type="number"
                  name="lastPrice"
                  value={form.lastPrice}
                  onChange={handleChange}
                  placeholder="e.g. 150.00"
                  step="0.00000001"
                  min="0"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={{ ...inputStyles, borderColor: errors.lastPrice ? "#F44336" : "#252f45" }}
                />
                {errors.lastPrice && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{errors.lastPrice}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">
                  24h Change ($)
                </label>
                <input
                  type="number"
                  name="change24h"
                  value={form.change24h}
                  onChange={handleChange}
                  step="0.00000001"
                  placeholder="e.g. 2.50"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={{ ...inputStyles, borderColor: errors.change24h ? "#F44336" : "#252f45" }}
                />
                {errors.change24h && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{errors.change24h}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5 text-penny-text-muted">
                  Rate of Change (%)
                </label>
                <input
                  type="number"
                  name="rateOfChange"
                  value={form.rateOfChange}
                  onChange={handleChange}
                  step="0.0001"
                  placeholder="e.g. 1.5"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                  style={{ ...inputStyles, borderColor: errors.rateOfChange ? "#F44336" : "#252f45" }}
                />
                {errors.rateOfChange && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{errors.rateOfChange}</p>}
              </div>
            </div>

            {status === "error" && errorMessage && (
              <div
                className="p-3 rounded-xl text-xs"
                style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.3)", color: "#F44336" }}
              >
                {errorMessage}
              </div>
            )}

            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={createMut.isPending}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white/5 border border-[#252f45] text-penny-text-muted hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMut.isPending}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#00d4a1] text-[#0d1624] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {createMut.isPending ? (
                  <>
                    <Icon icon="mdi:loading" width={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:plus" width={16} />
                    Create &amp; List Stock
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
