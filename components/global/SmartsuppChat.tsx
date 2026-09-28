// components/global/SmartsuppChat.tsx — client component
"use client";

import { useEffect } from "react";

const SMARTSUPP_KEY = "450021e96fb6956c8550fd62e414d909b538753b";

type SmartsuppApi = {
  _: unknown[];
  [key: string]: unknown;
};

declare global {
  interface Window {
    _smartsupp?: Record<string, unknown>;
    smartsupp?: SmartsuppApi;
  }
}

/**
 * Loads the Smartsupp live chat widget for the user-facing dashboard.
 * Guards against double-injection (React StrictMode / client-side navigation).
 */
export default function SmartsuppChat() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("smartsupp-loader")) return;

    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = SMARTSUPP_KEY;

    const script = document.createElement("script");
    script.id = "smartsupp-loader";
    script.type = "text/javascript";
    script.charset = "utf-8";
    script.async = true;
    script.src = "https://www.smartsuppchat.com/loader.js?";

    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(script, first);
  }, []);

  return null;
}