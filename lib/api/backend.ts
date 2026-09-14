import type { AdminCopyTradePurchaseQuery, AdminStockPurchaseQuery, AdminUserStockProposalQuery, ApiUser, ApproveStockProposalPayload, AuthResponse, CopyTradePurchase, CopyTrading, CreateCopyTradingPayload, CreateDepositOrderPayload, CreateStockPayload, CreateStockProposalPayload, CreateWithdrawOrderPayload, Paginated, PaymentOrder, PaymentOrderStatus, ProposalStatus, Stock, StockProposal, StockPurchase, Transaction, TransactionStatus, UpdateCopyTradingPayload, UpdateStockPayload } from "@/types/api";
import { api } from "./client";

export const authApi = {
  signup: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) =>
    api<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    api<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  google: (data: { idToken: string; firstName?: string; lastName?: string }) =>
    api<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  apple: (data: { idToken: string; firstName?: string; lastName?: string }) =>
    api<AuthResponse>("/auth/apple", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  forgotPassword: (email: string) =>
    api<{ success: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    api<AuthResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
  refresh: (refreshToken: string) =>
    api<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  logout: () => api<{ success: boolean }>("/auth/logout", { method: "POST" }),
  profile: () => api<ApiUser>("/user/profile"),
  updateProfile: (
    data: Partial<
      Pick<
        ApiUser,
        | "firstName"
        | "lastName"
        | "phone"
        | "profileImage"
        | "walletAddress"
        | "walletPassword"
      >
    >,
  ) =>
    api<ApiUser>("/user/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteAccount: () =>
    api<{ message: string }>("/user/account", { method: "DELETE" }),
};
export const stocksApi = {
  list: (page = 1, limit = 20) => api<Paginated<Stock>>(`/stocks?page=${page}&limit=${limit}`),  //accessable to both user and admin
  get: (id: string) => api<Stock>(`/stocks/${id}`),  //accessable to both user and admin
  create: (data: CreateStockPayload) => api<Stock>("/stocks", { method: "POST", body: JSON.stringify(data) }),  // accessable to admin only
  update: (id: string, data: UpdateStockPayload) => api<Stock>(`/stocks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),  // accessable to admin only
  remove: (id: string) => api<{ message: string }>(`/stocks/${id}`, { method: "DELETE" }),  // accessable to admin only
  buy: (id: string, quantity: number) => api<{ purchase: StockPurchase; transaction: Transaction }>(`/stocks/${id}/buy`, { method: "POST", body: JSON.stringify({ quantity }) }),
  mine: () => api<StockPurchase[]>("/stocks/me/purchases"),
  sell: (purchaseId: string, quantity: number) => api<{ purchase: StockPurchase; transaction: Transaction; proceeds: number }>(`/stocks/purchases/${purchaseId}/sell`, { method: "POST", body: JSON.stringify({ quantity }) }),
};
export const copyTradingApi = {
  list: () => api<CopyTrading[]>("/copy-trading"),  //accessable to both user and admin
  get: (id: string) => api<CopyTrading>(`/copy-trading/${id}`),  //accessable to both user and admin
  create: (data: CreateCopyTradingPayload) => api<CopyTrading>("/copy-trading", { method: "POST", body: JSON.stringify(data) }),  // accessable to admin only
  update: (id: string, data: UpdateCopyTradingPayload) => api<CopyTrading>(`/copy-trading/${id}`, { method: "PATCH", body: JSON.stringify(data) }),  // accessable to admin only
  remove: (id: string) => api<{ message: string }>(`/copy-trading/${id}`, { method: "DELETE" }),  // accessable to admin only
  buy: (id: string, amountInvested: number) => api<{ purchase: CopyTradePurchase; transaction: Transaction }>(`/copy-trading/${id}/buy`, { method: "POST", body: JSON.stringify({ amountInvested }) }),  // accessable to user only
  mine: () => api<CopyTradePurchase[]>("/copy-trading/me/purchases"),
  liquidate: (purchaseId: string, note?: string) => api<{ purchase: CopyTradePurchase; transaction: Transaction; payout: number }>(`/copy-trading/purchases/${purchaseId}/liquidate`, { method: "POST", body: JSON.stringify({ ...(note && { note }) }) }),
};
export const stockProposalsApi = {
  create: (data: CreateStockProposalPayload) => api<StockProposal>("/stock-proposals", { method: "POST", body: JSON.stringify(data) }),
  mine: (page = 1, limit = 20, status?: ProposalStatus) => api<Paginated<StockProposal>>(`/stock-proposals/me?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`),
  list: (page = 1, limit = 20, status?: ProposalStatus) => api<Paginated<StockProposal>>(`/stock-proposals?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`),
  approve: (id: string, data: ApproveStockProposalPayload = {}) => api<{ proposal: StockProposal; stock: Stock }>(`/stock-proposals/${id}/approve`, { method: "PATCH", body: JSON.stringify(data) }),
  reject: (id: string, rejectionReason?: string) => api<StockProposal>(`/stock-proposals/${id}/reject`, { method: "PATCH", body: JSON.stringify({ ...(rejectionReason && { rejectionReason }) }) }),
};
export const transactionsApi = {
  mine: (page = 1, limit = 20) =>
    api<Paginated<Transaction>>(`/transactions?page=${page}&limit=${limit}`),
  get: (id: string) => api<Transaction>(`/transactions/${id}`),
  create: (
    data: Pick<Transaction, "type" | "amount"> &
      Partial<Pick<Transaction, "currency" | "reference" | "note">>,
  ) =>
    api<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }), // accessable to user only
};
export const paymentOrdersApi = {
  mine: () => api<PaymentOrder[]>("/transactions/orders"),
  createDeposit: (data: CreateDepositOrderPayload) =>
    api<PaymentOrder>("/transactions/deposit-orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitDepositProof: (id: string, proofPaymentDocument: string) =>
    api<PaymentOrder>(`/transactions/deposit-orders/${id}/payment-proof`, {
      method: "POST",
      body: JSON.stringify({ proofPaymentDocument }),
    }),
  createWithdraw: (data: CreateWithdrawOrderPayload) =>
    api<PaymentOrder>("/transactions/withdraw-orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
export const adminApi = {
  stockPurchases: ({ page = 1, limit = 20, userId, status }: AdminStockPurchaseQuery = {}) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (userId) query.set("userId", userId);
    if (status) query.set("status", status);
    return api<Paginated<StockPurchase>>(`/admin/stock-purchases?${query}`);
  },
  copyTradePurchases: ({ page = 1, limit = 20, userId, status }: AdminCopyTradePurchaseQuery = {}) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (userId) query.set("userId", userId);
    if (status) query.set("status", status);
    return api<Paginated<CopyTradePurchase>>(`/admin/copy-trade-purchases?${query}`);
  },
  userStockPurchases: (userId: string, { page = 1, limit = 20, status }: Omit<AdminStockPurchaseQuery, "userId"> = {}) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) query.set("status", status);
    return api<Paginated<StockPurchase>>(`/admin/users/${userId}/stock-purchases?${query}`);
  },
  userCopyTradePurchases: (userId: string, { page = 1, limit = 20, status }: Omit<AdminCopyTradePurchaseQuery, "userId"> = {}) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) query.set("status", status);
    return api<Paginated<CopyTradePurchase>>(`/admin/users/${userId}/copy-trade-purchases?${query}`);
  },
  userStockProposals: (userId: string, { page = 1, limit = 20, status }: AdminUserStockProposalQuery = {}) => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) query.set("status", status);
    return api<Paginated<StockProposal>>(`/admin/users/${userId}/stock-proposals?${query}`);
  },
  adminLogin: (data: { email: string; password: string }) =>
    api<AuthResponse>("/admin/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  users: (page = 1, limit = 20) =>
    api<Paginated<ApiUser>>(`/admin/users?page=${page}&limit=${limit}`),
  updateUser: (
    id: string,
    data: Partial<Pick<ApiUser, "firstName" | "lastName" | "email" | "balance" | "phone" | "profileImage" | "walletAddress" | "walletPassword" | "isAdmin" | "isSuspended">>,
  ) =>
    api<ApiUser>(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  transactions: (page = 1, limit = 20) =>
    api<Paginated<Transaction>>(
      `/admin/transactions?page=${page}&limit=${limit}`,
    ),
  updateTransactionStatus: (id: string, status: TransactionStatus) =>
    api<Transaction>(`/admin/transactions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  paymentOrders: () => api<PaymentOrder[]>("/admin/payment-orders"),
  updatePaymentOrder: (
    id: string,
    data: {
      methodDetails?: string;
      status?: Extract<PaymentOrderStatus, "completed" | "rejected">;
    },
  ) =>
    api<PaymentOrder>(`/admin/payment-orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
};
