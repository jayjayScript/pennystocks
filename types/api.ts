export type RiskLevel = "low" | "medium" | "high";
export type TransactionType = "deposit" | "withdraw" | "profit" | "loss" | "buy" | "sell" | "copy_trade";
export type TransactionStatus = "pending" | "completed" | "rejected" | "failed";
export type ProposalStatus = "pending" | "completed" | "rejected";
export type PaymentMethod = "crypto" | "Cash App" | "PayPal" | "Venmo" | "Zelle" | "Wire Transfer" | "Bank Transfer";
export type PaymentOrderStatus = "pending" | "awaiting_payment" | "awaiting_confirmation" | "completed" | "rejected" | "expired";

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
  initialListingPrice?: number;
  category?: string;
  exchange?: string;
  change24h: number;
  rateOfChange: number;
  currency: string;
  totalVolume?: number;
  // Approval state: true = admin-created or approved proposal, false = rejected proposal, null = pending proposal
  isApproved?: boolean | null;
  // User's proposed price (only set on pending proposals)
  proposedPrice?: number;
  // Optional listing metadata submitted by user/admin
  description?: string;
  type?: string;
  supply?: number;
  // Who submitted the proposal
  submittedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateStockPayload = Pick<Stock, "name" | "acronym" | "lastPrice" | "change24h" | "rateOfChange" | "initialListingPrice" | "category" | "exchange"> & { currency?: string };
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
  isActive?: boolean;
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
  remainingQuantity?: number;
  soldQuantity?: number;
  status?: "open" | "closed";
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
  status?: "active" | "liquidated";
  liquidatedAt?: string;
  liquidationAmount?: number;
  createdAt: string;
}

export interface StockProposal {
  _id: string;
  proposedBy: string | Pick<ApiUser, "userID" | "email" | "firstName" | "lastName">;
  companyName: string;
  ticker: string;
  category: string;
  exchange: string;
  initialListingPrice: number;
  change24h: number;
  rateOfChange: number;
  currency: string;
  status: ProposalStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdStockId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateStockProposalPayload = Pick<StockProposal, "companyName" | "ticker" | "category" | "exchange" | "initialListingPrice"> & Partial<Pick<StockProposal, "change24h" | "rateOfChange" | "currency">>;
export type ApproveStockProposalPayload = Partial<CreateStockProposalPayload> & { lastPrice?: number };

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
  proofPaymentDocument?: string;
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentOrder {
  _id: string;
  orderID: string;
  userId: string;
  email: string;
  type: "deposit" | "withdraw";
  amount: number;
  method: PaymentMethod;
  suggestedMethod?: string;
  methodDetails?: string;
  isMethodIncluded: boolean;
  status: PaymentOrderStatus;
  proofPaymentDocument?: string;
  transactionId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepositOrderPayload { amount: number; method: PaymentMethod; suggestedMethod?: string; }
export interface CreateWithdrawOrderPayload { amount: number; method: PaymentMethod; methodDetails: string; }

export interface Paginated<T> { data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number }; }
