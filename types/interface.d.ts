// ─── Domain Models ────────────────────────────────────────────────────────────

// ─── Orders ───────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdraw";
  symbol: string;
  name: string;
  icon?: string;
  bgColor?: string;
  stockPrice: number;  // price at time of order
  units: number;
  usdAmount: number;
  fee: number;
  totalCost: number;   // buy: usdAmount + fee
  netReceive: number;  // sell: grossValue - fee
  status: "pending" | "approved" | "rejected";
  createdAt: string;   // ISO string
  note?: string; // reference note for deposit/withdraw
  paymentMethod?: string;
  proofImageUrl?: string;
  depositStep?: "awaiting_admin_details" | "awaiting_user_proof" | "pending_approval" | "completed" | "rejected";
  adminPaymentDetails?: string;
}

// ─── Notifications ─────────────────────────────────────────────────────────────

interface AppNotification {
  id: string;
  type: "success" | "info" | "warning" | "error" | "deposit_details";
  title: string;
  message: string;
  icon: string;
  read: boolean;
  createdAt: string;  // ISO string
  orderId?: string;   // link back to an order for deposit detail notifications
  adminPaymentDetails?: string;
}

// ─── Stock Requests ────────────────────────────────────────────────────────────

interface StockRequest {
  id: string;
  ticker: string;
  name: string;
  type: string;
  exchange: string;
  initialPrice: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  submittedBy: "user" | "admin";
}


interface ProfitEntry {
  amount: string;
  label: string;
  period: string;
  trend: "up" | "down";
}

interface Stock {
  symbol: string;
  name: string;
  price: string;
  change: string;
  pct: string;
  up: boolean;
  icon?: string;
  bgColor?: string;
  description?: string;
}

interface PortfolioAsset extends Stock {
  amount: string;
  value: string;
}

// ─── Chart ────────────────────────────────────────────────────────────────────

interface DataPoint {
  time: string;
  price: number;
}

// ─── Shared Page Props ────────────────────────────────────────────────────────

/** Shared props for all dynamic [symbol] pages */
interface PageSymbolProps {
  params: Promise<{ symbol: string }>;
}

// ─── General Components ───────────────────────────────────────────────────────

interface GeneralCardProps {
  content: React.ReactNode;
  bgColor?: string;
}

// ─── UI Component Props ───────────────────────────────────────────────────────

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "success" | "danger" | "warning" | "neutral" | "accent";
  icon?: string;
  size?: "sm" | "md";
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "surface"
    | "outline"
    | "ghost"
    | "danger";
  size?: "sm" | "md" | "lg";
  icon?: string;
  fullWidth?: boolean;
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "surface" | "glass" | "glass-gradient";
  padding?: "none" | "sm" | "md" | "lg";
}

interface StockPriceChartProps {
  symbol: string;
  up: boolean;
  basePrice: number;
}

// ─── Copy Trading ─────────────────────────────────────────────────────────────

interface CopyTradeSetup {
  id: string;
  traderId: string;
  traderNickname: string;
  countryFlag: string;
  country: string;
  leverage: number;
  coin: {
    symbol: string;
    name: string;
    icon?: string;
    bgColor?: string;
  };
  price: number; // Copy trade price in USD
  traderWinRate: number;
}

interface CopyTradeTransaction {
  id: string;
  copyTradeId: string;
  type: "buy" | "sell";
  coinSymbol: string;
  amount: number;
  price: number;
  profitLoss: number;
  leverage: number;
  date: string;
}

interface ActiveCopyTrade {
  id: string;
  setup: CopyTradeSetup;
  startDate: string;
  pnl: number;
  pnlPercent: number;
  lastTrades: CopyTradeTransaction[];
  status: "active" | "paused" | "closed";
}

// Legacy support
interface CopyTrader {
  id: string;
  name: string;
  avatarInitials: string;
  verified: boolean;
  riskLevel: "Low" | "Medium" | "High";
  gainPct: string;
  gainPositive: boolean;
  period: string;
  avgDailyProfit: string;
  copies: string;
  totalAssets: number;
}

interface CopyTradeResult {
  success: boolean;
  message: string;
}