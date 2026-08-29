export type RiskLevel = "low" | "medium" | "high";
export type TransactionType = "deposit" | "withdraw" | "profit" | "loss" | "buy" | "sell" | "copy_trade";
export type TransactionStatus = "pending" | "completed" | "rejected";

export interface ApiUser {
  _id: string;
  userID: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
  totalWithdraw: number;
  totalDeposit: number;
  transactionCount: number;
  isSuspended: boolean;
  isAdmin?: boolean;
  phone?: string;
  profileImage?: string;
  walletAddress?: string;
  walletPassword?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: Pick<ApiUser, "_id" | "userID" | "email" | "firstName" | "lastName">;
}

export interface Stock {
  _id: string;
  name: string;
  acronym: string;
  lastPrice: number;
  change24h: number;
  rateOfChange: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateStockPayload = Pick<Stock, "name" | "acronym" | "lastPrice" | "change24h" | "rateOfChange"> & { currency?: string };
export type UpdateStockPayload = Partial<CreateStockPayload>;

export interface CopyTrading {
  _id: string;
  traderName: string;
  riskLevel: RiskLevel;
  rateOfChange: number;
  duration: string;
  averageDailyProfit: number;
  purchases: number;
  totalAssets: number;
  copyTradePrice: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCopyTradingPayload = Omit<CopyTrading, "_id" | "currency" | "createdAt" | "updatedAt">;
export type UpdateCopyTradingPayload = Partial<CreateCopyTradingPayload>;

export interface StockPurchase {
  _id: string;
  userId: string;
  stockId: string;
  stockName: string;
  stockAcronym: string;
  quantity: number;
  pricePerShare: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

export interface CopyTradePurchase {
  _id: string;
  userId: string;
  copyTradingId: string;
  traderName: string;
  riskLevel: RiskLevel;
  duration: string;
  rateOfChange: number;
  averageDailyProfit: number;
  purchases: number;
  totalAssets: number;
  copyTradePrice: number;
  amountInvested: number;
  currency: string;
  expiredAt: string;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  transactionID: string;
  userId: string;
  email: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  reference?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> { data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number }; }
