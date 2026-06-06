"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

const faqs = [
  {
    q: "How do I deposit funds into my account?",
    a: "Log in to your dashboard and navigate to the Deposit section. Select your preferred method (crypto or bank transfer), enter the amount, and confirm. Your balance updates within minutes.",
  },
  {
    q: "Is my investment secure on PennyStocks?",
    a: "Security is a priority. We use modern encryption, two-factor authentication, and cold storage for digital assets to protect your investments at all times.",
  },
  {
    q: "Can I withdraw my profits at any time?",
    a: "Yes. Funds movement is designed to be flexible. You can request a withdrawal at any time. Processing typically takes 1-3 business days depending on your withdrawal method.",
  },
  {
    q: "What assets are available to trade?",
    a: "Currently PennyStocks supports major digital assets including BTC, ETH, BNB, LTC, and NGN stablecoin pairs, with more being added regularly.",
  },
  {
    q: "What is Copy Trading and how does it work?",
    a: "Copy Trading allows you to automatically replicate the trades of experienced investors. Select an expert trader, set your allocation amount and risk level, then their trades mirror to your account in real time.",
  },
  {
    q: "How is my credit rate calculated?",
    a: "Your credit rate is based on your account activity, deposit history, trade frequency, and overall account health. A higher credit rate gives you access to additional features and benefits.",
  },
];

export default function FaqScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm" style={{ color: "#9aa3b0" }}>
          Have questions?
        </p>
        <h1 className="text-2xl font-bold text-white mt-0.5">FAQ</h1>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{ background: "#151d2d", border: "1px solid #252f45" }}
      >
        <Icon icon="mdi:magnify" width={18} style={{ color: "#9aa3b0" }} />
        <input
          type="text"
          placeholder="Search questions..."
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-[#6b7785]"
        />
      </div>

      {/* Intro card */}
      <div
        className="rounded-2xl p-5 flex items-start gap-4"
        style={{
          background: "rgba(0,212,161,0.06)",
          border: "1px solid rgba(0,212,161,0.18)",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(0,212,161,0.15)" }}
        >
          <Icon
            icon="mdi:help-circle-outline"
            width={22}
            style={{ color: "#00d4a1" }}
          />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Need more help?</p>
          <p className="text-xs mt-0.5" style={{ color: "#9aa3b0" }}>
            Can&apos;t find your answer here? Contact our support team anytime.
          </p>
        </div>
      </div>

      {/* Accordion — 2-col on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
            style={{
              background: "#151d2d",
              border:
                openIndex === i
                  ? "1px solid rgba(0,212,161,0.3)"
                  : "1px solid #1d2639",
            }}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <div className="flex items-center justify-between px-4 py-4 gap-3">
              <p
                className="text-sm font-semibold leading-snug"
                style={{ color: openIndex === i ? "#00d4a1" : "#c8d0dc" }}
              >
                {faq.q}
              </p>
              <Icon
                icon={openIndex === i ? "mdi:chevron-up" : "mdi:chevron-down"}
                width={18}
                className="flex-shrink-0 transition-transform duration-200"
                style={{ color: openIndex === i ? "#00d4a1" : "#6b7785" }}
              />
            </div>
            {openIndex === i && (
              <div className="px-4 pb-4">
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#9aa3b0" }}
                >
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
