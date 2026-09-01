"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { stocksApi } from "@/lib/api/backend";

const initialValues = {
  ticker: "",
  name: "",
  type: "",
  price: "",
  description: "",
  supply: "",
};

export default function StockEditorForm() {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.ticker || form.ticker.length < 2 || form.ticker.length > 5) {
      newErrors.ticker = "Ticker must be 2-5 characters";
    }

    if (!form.name || form.name.length < 2) {
      newErrors.name = "Stock name is required";
    }

    if (!form.type) {
      newErrors.type = "Stock type is required";
    }

    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!form.supply || isNaN(parseInt(form.supply)) || parseInt(form.supply) <= 0) {
      newErrors.supply = "Valid supply is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await stocksApi.create({
        name: form.name,
        acronym: form.ticker,
        lastPrice: parseFloat(form.price),
        change24h: 0,
        rateOfChange: 0,
        currency: "USD",
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setForm(initialValues);
        setErrors({});
      }, 2000);
    } catch (error) {
      console.error("Failed to create stock:", error);
      setErrors({ form: error instanceof Error ? error.message : "Failed to create stock" });
    }
  };

  const inputStyles = {
    background: "#0d1624",
    border: "1px solid #252f45",
    color: "white",
    outline: "none",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitted && (
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: "rgba(0,212,161,0.1)", border: "1px solid rgba(0,212,161,0.2)" }}>
          <Icon icon="mdi:check-circle" width={20} style={{ color: "#00d4a1" }} />
          <span className="text-sm font-medium" style={{ color: "#00d4a1" }}>
            Stock added successfully! It will appear in the marketplace.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#9aa3b0" }}>Ticker Symbol (2-5 chars)</label>
          <input type="text" name="ticker" value={form.ticker} onChange={handleChange} placeholder="e.g. AAPL" className="w-full px-4 py-3 rounded-xl text-sm" style={inputStyles} />
          {errors.ticker && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{errors.ticker}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#9aa3b0" }}>Stock Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Apple Inc." className="w-full px-4 py-3 rounded-xl text-sm" style={inputStyles} />
          {errors.name && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#9aa3b0" }}>Stock Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full px-4 py-3 rounded-xl text-sm" style={{ ...inputStyles, appearance: "none" }}>
            <option value="">Select type</option>
            <option value="Blue Chip">Blue Chip</option>
            <option value="Growth">Growth</option>
            <option value="Dividend">Dividend</option>
            <option value="Tech">Tech</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
          </select>
          {errors.type && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{errors.type}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#9aa3b0" }}>Initial Price ($)</label>
          <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="e.g. 100.00" step="0.01" min="0" className="w-full px-4 py-3 rounded-xl text-sm" style={inputStyles} />
          {errors.price && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{errors.price}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#9aa3b0" }}>Total Supply</label>
          <input type="number" name="supply" value={form.supply} onChange={handleChange} placeholder="e.g. 1000000" min="1" className="w-full px-4 py-3 rounded-xl text-sm" style={inputStyles} />
          {errors.supply && <p className="text-xs mt-1" style={{ color: "#F44336" }}>{errors.supply}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5" style={{ color: "#9aa3b0" }}>Description (Optional)</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief description of the stock..." rows={3} className="w-full px-4 py-3 rounded-xl text-sm resize-none" style={inputStyles} />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95" style={{ background: "#00d4a1", color: "#0d1624" }}>
          <Icon icon="mdi:add" width={16} className="inline mr-2" />
          Create Stock
        </button>
      </div>
    </form>
  );
}