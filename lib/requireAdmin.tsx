"use client";

import { ReactNode } from "react";

/**
 * Admin guard — in a production app this would check a real session.
 * For now it renders children directly since auth is handled at the server level.
 */
export default function RequireAdmin({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
