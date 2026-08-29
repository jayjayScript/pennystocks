"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockUsersData: Record<string, UserProfile> = {
  "USR-1024": {
    id: "USR-1024",
    name: "John Smith",
    email: "john@example.com",
    phone: "+1 555-0101",
    avatar: "JS",
    balance: 24500,
    stocks: 5,
    joinDate: "2024-01-15",
    lastActive: "2024-06-28",
    status: "active",
    kycStatus: "verified",
    notificationPreferences: { email: true, sms: false, push: true },
    security: {
      twoFactorEnabled: true,
      lastPasswordChange: "2024-03-15",
      loginHistory: [
        { date: "2024-06-28 14:32", ip: "192.168.1.1", device: "Chrome on Windows" },
        { date: "2024-06-27 09:15", ip: "10.0.0.5", device: "Safari on iPhone" },
        { date: "2024-06-25 18:45", ip: "192.168.1.1", device: "Chrome on Windows" },
      ],
    },
    orders: [
      { id: "ORD-7821", type: "buy", symbol: "AAPL", units: 10, price: 178.50, total: 1785, date: "2024-06-25", status: "completed" },
      { id: "ORD-7890", type: "sell", symbol: "TSLA", units: 5, price: 245.00, total: 1225, date: "2024-06-27", status: "pending" },
    ],
    portfolio: [
      { symbol: "AAPL", name: "Apple Inc.", shares: 50, avgPrice: 165.20, currentPrice: 178.50, value: 8925 },
      { symbol: "GOOGL", name: "Alphabet Inc.", shares: 10, avgPrice: 140.00, currentPrice: 152.30, value: 1523 },
    ],
  },
  "USR-1025": {
    id: "USR-1025",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 555-0102",
    avatar: "SJ",
    balance: 83200,
    stocks: 12,
    joinDate: "2024-01-18",
    lastActive: "2024-06-29",
    status: "active",
    kycStatus: "verified",
    notificationPreferences: { email: true, sms: true, push: true },
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: "2024-05-20",
      loginHistory: [{ date: "2024-06-29 08:00", ip: "172.16.0.3", device: "Firefox on Linux" }],
    },
    orders: [{ id: "ORD-7850", type: "buy", symbol: "MSFT", units: 25, price: 420.00, total: 10500, date: "2024-06-20", status: "completed" }],
    portfolio: [],
  },
  "USR-1026": {
    id: "USR-1026",
    name: "Michael Chen",
    email: "michael@example.com",
    phone: "+1 555-0103",
    avatar: "MC",
    balance: 15200,
    stocks: 3,
    joinDate: "2024-02-01",
    lastActive: "2024-06-15",
    status: "active",
    kycStatus: "pending",
    notificationPreferences: { email: true, sms: false, push: false },
    security: { twoFactorEnabled: false, lastPasswordChange: "2024-02-01", loginHistory: [] },
    orders: [],
    portfolio: [],
  },
  "USR-1027": {
    id: "USR-1027",
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+1 555-0104",
    avatar: "ED",
    balance: 45800,
    stocks: 8,
    joinDate: "2024-02-10",
    lastActive: "2024-06-01",
    status: "frozen",
    kycStatus: "verified",
    notificationPreferences: { email: true, sms: true, push: false },
    security: { twoFactorEnabled: true, lastPasswordChange: "2024-04-10", loginHistory: [] },
    orders: [],
    portfolio: [],
  },
  "USR-1028": {
    id: "USR-1028",
    name: "Robert Wilson",
    email: "robert@example.com",
    phone: "+1 555-0105",
    avatar: "RW",
    balance: 9800,
    stocks: 2,
    joinDate: "2024-02-15",
    lastActive: "2024-06-28",
    status: "active",
    kycStatus: "verified",
    notificationPreferences: { email: false, sms: false, push: true },
    security: { twoFactorEnabled: false, lastPasswordChange: "2024-05-01", loginHistory: [] },
    orders: [],
    portfolio: [],
  },
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LoginEntry { date: string; ip: string; device: string; }
interface Order { id: string; type: "buy" | "sell"; symbol: string; units: number; price: number; total: number; date: string; status: "completed" | "pending" | "rejected"; }
interface PortfolioHolding { symbol: string; name: string; shares: number; avgPrice: number; currentPrice: number; value: number; }
interface UserProfile {
  id: string; name: string; email: string; phone: string; avatar: string;
  balance: number; stocks: number; joinDate: string; lastActive: string;
  status: "active" | "frozen" | "suspended"; kycStatus: "pending" | "verified" | "rejected";
  notificationPreferences: { email: boolean; sms: boolean; push: boolean; };
  security: { twoFactorEnabled: boolean; lastPasswordChange: string; loginHistory: LoginEntry[]; };
  orders: Order[]; portfolio: PortfolioHolding[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Inline Edit Input Component ───────────────────────────────────────────────

function EditableField({
  label,
  value,
  onSave,
  type = "text",
  prefix,
  suffix,
}: {
  label: string;
  value: string | number;
  onSave: (newValue: string | number) => void;
  type?: "text" | "email" | "tel" | "number" | "select";
  prefix?: string;
  suffix?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleSave = () => {
    onSave(type === "number" ? parseFloat(inputValue as string) || 0 : inputValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-1">
        <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>{label}</label>
        <div className="flex items-center gap-1 sm:gap-2">
          {prefix && <span className="text-[10px] sm:text-sm" style={{ color: "#6b7785" }}>{prefix}</span>}
          <input
            type={type}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-white outline-none min-w-0"
            style={{ background: "#0d1624", border: "1px solid #00d4a1" }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          {suffix && <span className="text-[10px] sm:text-sm" style={{ color: "#6b7785" }}>{suffix}</span>}
          <button onClick={handleSave} className="p-1.5 rounded-lg shrink-0" style={{ background: "#00d4a1", color: "#0d1624" }}>
            <Icon icon="mdi:check" width={14} />
          </button>
          <button onClick={handleCancel} className="p-1.5 rounded-lg shrink-0" style={{ background: "#252f45", color: "#9aa3b0" }}>
            <Icon icon="mdi:close" width={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 group">
      <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>{label}</label>
      <div className="flex items-center gap-2">
        <p className="flex-1 text-xs sm:text-sm font-medium text-white truncate">
          {prefix}{typeof value === "number" ? formatCurrency(value) : value}{suffix}
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 rounded sm:opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "#6b7785" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#00d4a1")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7785")}
        >
          <Icon icon="mdi:pencil" width={12} className="sm:w-[14px] sm:h-[14px]" />
        </button>
      </div>
    </div>
  );
}

// ─── Section Card Component ───────────────────────────────────────────────────

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Icon icon={icon} width={16} className="sm:w-[18px]" style={{ color: "#00d4a1" }} />
        <h3 className="text-sm sm:text-base font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Status Badge Component ───────────────────────────────────────────────────

function StatusBadge({ status, type = "status" }: { status: string; type?: "status" | "kyc" | "order" }) {
  const colors = {
    status: {
      active: { bg: "rgba(76,175,80,0.12)", text: "#4CAF50" },
      frozen: { bg: "rgba(245,197,24,0.12)", text: "#F5C518" },
      suspended: { bg: "rgba(244,67,54,0.12)", text: "#F44336" },
      pending: { bg: "rgba(245,197,24,0.12)", text: "#F5C518" },
      completed: { bg: "rgba(76,175,80,0.12)", text: "#4CAF50" },
      rejected: { bg: "rgba(244,67,54,0.12)", text: "#F44336" },
    },
    kyc: {
      verified: { bg: "rgba(76,175,80,0.12)", text: "#4CAF50" },
      pending: { bg: "rgba(245,197,24,0.12)", text: "#F5C518" },
      rejected: { bg: "rgba(244,67,54,0.12)", text: "#F44336" },
    },
    order: {
      buy: { bg: "rgba(0,212,161,0.12)", text: "#00d4a1" },
      sell: { bg: "rgba(244,67,54,0.12)", text: "#F44336" },
    },
  };

  const style = (type === "kyc" ? colors.kyc : type === "order" ? colors.order : colors.status) as Record<string, { bg: string; text: string }>;
  const color = style[status] || { bg: "rgba(107,119,133,0.12)", text: "#6b7785" };

  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: color.bg, color: color.text }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Portfolio Holding Card ───────────────────────────────────────────────────

function HoldingCard({ holding, onUpdate, onRemove }: { holding: PortfolioHolding; onUpdate: (updated: PortfolioHolding) => void; onRemove: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editable, setEditable] = useState<Partial<PortfolioHolding>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const updateField = (field: keyof PortfolioHolding, value: number) => {
    setEditable((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const saveChanges = () => {
    const newShares = editable.shares ?? holding.shares;
    const newCurrentPrice = editable.currentPrice ?? holding.currentPrice;
    onUpdate({
      ...holding,
      ...editable,
      value: newShares * newCurrentPrice,
    });
    setEditable({});
    setHasChanges(false);
  };

  const discardChanges = () => {
    setEditable({});
    setHasChanges(false);
  };

  const getValue = (field: keyof PortfolioHolding, fallback: number) => editable[field] ?? holding[field] ?? fallback;

  const liveValue = (editable.shares ?? holding.shares) * (editable.currentPrice ?? holding.currentPrice);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "#0d1624", border: "1px solid #252f45" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer active:opacity-80 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
            {holding.symbol.slice(0, 2)}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-white">{holding.symbol}</p>
            <p className="text-[10px] sm:text-xs hidden sm:block" style={{ color: "#6b7785" }}>{holding.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right">
            <p className="text-xs sm:text-sm font-bold" style={{ color: "#00d4a1" }}>{formatCurrency(liveValue)}</p>
            <p className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>{getValue("shares", holding.shares)} shares</p>
          </div>
          <Icon icon={isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"} width={16} className="sm:w-5 sm:h-5" style={{ color: "#6b7785" }} />
        </div>
      </div>

      {/* Expanded Editable Fields */}
      {isExpanded && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4" style={{ borderTop: "1px solid #252f45" }}>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Shares</label>
              <input
                type="number"
                value={editable.shares ?? holding.shares}
                onChange={(e) => updateField("shares", parseFloat(e.target.value) || 0)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-white outline-none"
                style={{ background: "#151d2d", border: "1px solid #252f45" }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Avg Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={editable.avgPrice ?? holding.avgPrice}
                onChange={(e) => updateField("avgPrice", parseFloat(e.target.value) || 0)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-white outline-none"
                style={{ background: "#151d2d", border: "1px solid #252f45" }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Current Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={editable.currentPrice ?? holding.currentPrice}
                onChange={(e) => updateField("currentPrice", parseFloat(e.target.value) || 0)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-white outline-none"
                style={{ background: "#151d2d", border: "1px solid #252f45" }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>Total Value</label>
              <p className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold" style={{ color: "#00d4a1" }}>
                {formatCurrency(liveValue)}
              </p>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-semibold transition-colors w-full xs:w-auto justify-center"
              style={{ background: "rgba(244,67,54,0.1)", color: "#F44336" }}
            >
              <Icon icon="mdi:delete" width={12} className="sm:w-3.5 sm:h-3.5" />
              Remove
            </button>
            <div className="flex items-center gap-2 w-full xs:w-auto">
              {hasChanges && (
                <>
                  <button onClick={discardChanges} className="flex-1 xs:flex-none px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm" style={{ background: "#252f45", color: "#9aa3b0" }}>
                    Discard
                  </button>
                  <button onClick={saveChanges} className="flex-1 xs:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-sm font-semibold" style={{ background: "#00d4a1", color: "#0d1624" }}>
                    <Icon icon="mdi:content-save" width={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [users, setUsers] = useState(mockUsersData);
  const user = users[userId];
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUsers((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], ...updates },
    }));
    showToast("Changes saved successfully");
  }, [userId, showToast]);

  if (!user) {
    return (
      <div className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Icon icon="mdi:account-off" width={48} className="sm:w-16 sm:h-16 mb-4" style={{ color: "#6b7785" }} />
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-xs sm:text-sm mb-6" style={{ color: "#6b7785" }}>The user ID &quot;{userId}&quot; does not exist.</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
        >
          <Icon icon="mdi:arrow-left" width={16} />
          Go Back
        </button>
      </div>
    );
  }

  const updateHolding = (index: number, updated: PortfolioHolding) => {
    const newPortfolio = [...user.portfolio];
    newPortfolio[index] = updated;
    updateUser({ portfolio: newPortfolio, stocks: newPortfolio.length });
  };

  const removeHolding = (index: number) => {
    const newPortfolio = user.portfolio.filter((_, i) => i !== index);
    updateUser({ portfolio: newPortfolio, stocks: newPortfolio.length });
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 md:top-4 right-4 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl z-50 shadow-lg" style={{ background: "#00d4a1", color: "#0d1624" }}>
          <Icon icon="mdi:check-circle" width={16} className="sm:w-[18px]" />
          <span className="text-xs sm:text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors"
        style={{ color: "#6b7785" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#00d4a1")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7785")}
      >
        <Icon icon="mdi:arrow-left" width={14} className="sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Back to Users</span>
        <span className="sm:hidden">Back</span>
      </button>

      {/* Header Card */}
      <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6" style={{ background: "linear-gradient(135deg, #151d2d 0%, #1a2538 100%)", border: "1px solid #252f45" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-base sm:text-xl font-bold" style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}>
              {user.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{user.name}</h1>
                <StatusBadge status={user.status} />
              </div>
              <p className="text-xs sm:text-sm" style={{ color: "#6b7785" }}>{user.id}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                const newStatus = user.status === "active" ? "frozen" : "active";
                updateUser({ status: newStatus });
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
              style={{ background: user.status === "active" ? "rgba(244,67,54,0.1)" : "rgba(76,175,80,0.1)", color: user.status === "active" ? "#F44336" : "#4CAF50" }}
            >
              <Icon icon={user.status === "active" ? "mdi:account-off" : "mdi:account-check"} width={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{user.status === "active" ? "Freeze" : "Activate"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row - Now shows only what's relevant: Cash Balance, KYC, Last Active */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Cash Balance */}
        <div className="group rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-xs mb-2" style={{ color: "#6b7785" }}>Cash Balance</p>
          <div className="flex items-center justify-between">
            <p className="text-base sm:text-lg lg:text-xl font-bold" style={{ color: "#00d4a1" }}>{formatCurrency(user.balance)}</p>
            <button
              onClick={() => {
                const newBalance = prompt("Enter new balance:", String(user.balance));
                if (newBalance && !isNaN(parseFloat(newBalance))) {
                  updateUser({ balance: parseFloat(newBalance) });
                }
              }}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,212,161,0.1)", color: "#00d4a1" }}
            >
              <Icon icon="mdi:pencil" width={14} />
            </button>
          </div>
          <div className="flex gap-1.5 mt-2">
            <button onClick={() => updateUser({ balance: user.balance + 100 })} className="flex-1 py-1 rounded text-[10px] sm:text-xs font-medium" style={{ background: "rgba(76,175,80,0.1)", color: "#4CAF50" }}>+$100</button>
            <button onClick={() => updateUser({ balance: user.balance + 1000 })} className="flex-1 py-1 rounded text-[10px] sm:text-xs font-medium" style={{ background: "rgba(76,175,80,0.1)", color: "#4CAF50" }}>+$1K</button>
            <button onClick={() => updateUser({ balance: Math.max(0, user.balance - 100) })} className="flex-1 py-1 rounded text-[10px] sm:text-xs font-medium" style={{ background: "rgba(244,67,54,0.1)", color: "#F44336" }}>-$100</button>
          </div>
        </div>
 
        {/* KYC Status */}
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-xs mb-2" style={{ color: "#6b7785" }}>KYC Status</p>
          <StatusBadge status={user.kycStatus} type="kyc" />
        </div>
 
        {/* Last Active */}
        <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 xs:col-span-2 sm:col-span-1" style={{ background: "#151d2d", border: "1px solid #252f45" }}>
          <p className="text-[10px] sm:text-xs mb-2" style={{ color: "#6b7785" }}>Last Active</p>
          <p className="text-sm sm:text-base font-bold text-white">{formatDate(user.lastActive)}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Section */}
          <SectionCard title="Profile Information" icon="mdi:account">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <EditableField
                label="Full Name"
                value={user.name}
                onSave={(val) => updateUser({ name: val as string })}
              />
              <div className="space-y-1">
                <label className="text-[10px] sm:text-xs font-semibold" style={{ color: "#6b7785" }}>User ID</label>
                <p className="text-xs sm:text-sm font-medium text-white">{user.id}</p>
              </div>
              <EditableField
                label="Email"
                value={user.email}
                type="email"
                onSave={(val) => updateUser({ email: val as string })}
              />
              <EditableField
                label="Phone"
                value={user.phone}
                type="tel"
                onSave={(val) => updateUser({ phone: val as string })}
              />
            </div>
          </SectionCard>

          {/* Account Settings */}
          <SectionCard title="Account Settings" icon="mdi:cog">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-[10px] sm:text-xs font-semibold mb-1.5 sm:mb-2 block" style={{ color: "#6b7785" }}>Account Status</label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {["active", "frozen", "suspended"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateUser({ status: s as any })}
                      className="py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors capitalize"
                      style={{
                        background: user.status === s ? "rgba(0,212,161,0.15)" : "#0d1624",
                        color: user.status === s ? "#00d4a1" : "#6b7785",
                        border: `1px solid ${user.status === s ? "#00d4a1" : "#252f45"}`,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] sm:text-xs font-semibold mb-1.5 sm:mb-2 block" style={{ color: "#6b7785" }}>KYC Verification</label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {["pending", "verified", "rejected"].map((k) => (
                    <button
                      key={k}
                      onClick={() => updateUser({ kycStatus: k as any })}
                      className="py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors capitalize"
                      style={{
                        background: user.kycStatus === k ? "rgba(0,212,161,0.15)" : "#0d1624",
                        color: user.kycStatus === k ? "#00d4a1" : "#6b7785",
                        border: `1px solid ${user.kycStatus === k ? "#00d4a1" : "#252f45"}`,
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] sm:text-xs font-semibold mb-1.5 sm:mb-2 block" style={{ color: "#6b7785" }}>Notifications</label>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {(["email", "sms", "push"] as const).map((pref) => (
                    <label key={pref} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.notificationPreferences[pref]}
                        onChange={(e) => updateUser({
                          notificationPreferences: { ...user.notificationPreferences, [pref]: e.target.checked }
                        })}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded accent-penny-accent cursor-pointer"
                      />
                      <span className="text-[10px] sm:text-sm capitalize" style={{ color: "#9aa3b0" }}>
                        {pref}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Security */}
          <SectionCard title="Security" icon="mdi:shield">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-white">2FA</p>
                  <p className="text-[10px] sm:text-xs hidden sm:block" style={{ color: "#6b7785" }}>Last password: {formatDate(user.security.lastPasswordChange)}</p>
                </div>
                <span className="text-[10px] sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full" style={{
                  background: user.security.twoFactorEnabled ? "rgba(76,175,80,0.12)" : "rgba(244,67,54,0.12)",
                  color: user.security.twoFactorEnabled ? "#4CAF50" : "#F44336",
                }}>
                  {user.security.twoFactorEnabled ? "ON" : "OFF"}
                </span>
              </div>

              {user.security.loginHistory.length > 0 && (
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold mb-2" style={{ color: "#6b7785" }}>Recent Activity</p>
                  <div className="space-y-1.5 sm:space-y-2">
                    {user.security.loginHistory.slice(0, 3).map((login, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg" style={{ background: "#0d1624" }}>
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:monitor" width={12} className="sm:w-3.5 sm:h-3.5" style={{ color: "#6b7785" }} />
                          <span className="text-[10px] sm:text-xs text-white truncate max-w-[120px] sm:max-w-none">{login.device}</span>
                        </div>
                        <span className="text-[10px] sm:text-xs" style={{ color: "#6b7785" }}>{login.date.split(" ")[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Recent Orders */}
          <SectionCard title="Recent Orders" icon="mdi:history">
            {user.orders.length > 0 ? (
              <div className="space-y-2">
                {user.orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg" style={{ background: "#0d1624" }}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded" style={{
                        background: order.type === "buy" ? "rgba(0,212,161,0.12)" : "rgba(244,67,54,0.12)",
                        color: order.type === "buy" ? "#00d4a1" : "#F44336",
                      }}>
                        {order.type.toUpperCase()}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-white">{order.symbol}</p>
                        <p className="text-[10px] sm:text-xs hidden sm:block" style={{ color: "#6b7785" }}>{order.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-bold" style={{ color: "#00d4a1" }}>{formatCurrency(order.total)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-center py-6" style={{ color: "#6b7785" }}>No orders yet</p>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Portfolio Holdings */}
      <SectionCard title={`Portfolio (${user.portfolio.length})`} icon="mdi:chart-line">
        {user.portfolio.length > 0 ? (
          <div className="space-y-3">
            {user.portfolio.map((holding, index) => (
              <HoldingCard
                key={holding.symbol}
                holding={holding}
                onUpdate={(updated) => updateHolding(index, updated)}
                onRemove={() => removeHolding(index)}
              />
            ))}
            <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #252f45" }}>
              <p className="text-[10px] sm:text-sm" style={{ color: "#6b7785" }}>Total Value</p>
              <p className="text-sm sm:text-lg font-bold" style={{ color: "#00d4a1" }}>
                {formatCurrency(user.portfolio.reduce((sum, h) => sum + h.value, 0))}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Icon icon="mdi:chart-line-variant" width={32} className="sm:w-12 sm:h-12" style={{ color: "#6b7785" }} />
            <p className="text-xs sm:text-sm mt-2 sm:mt-3" style={{ color: "#6b7785" }}>No holdings</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}