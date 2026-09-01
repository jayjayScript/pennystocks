import type {
  ApiUser,
  AuthResponse,
  CopyTradePurchase,
  CopyTrading,
  CreateCopyTradingPayload,
  CreateDepositOrderPayload,
  CreateStockPayload,
  CreateWithdrawOrderPayload,
  Paginated,
  PaymentOrder,
  PaymentOrderStatus,
  Stock,
  StockPurchase,
  Transaction,
  TransactionStatus,
  UpdateCopyTradingPayload,
  UpdateStockPayload,
} from "@/types/api";
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
  list: () => api<Stock[]>("/stocks"), //accessable to both user and admin
  get: (id: string) => api<Stock>(`/stocks/${id}`), //accessable to both user and admin
  create: (data: CreateStockPayload) =>
    api<Stock>("/stocks", { method: "POST", body: JSON.stringify(data) }), // accessable to admin only
  update: (id: string, data: UpdateStockPayload) =>
    api<Stock>(`/stocks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }), // accessable to admin only
  remove: (id: string) =>
    api<{ message: string }>(`/stocks/${id}`, { method: "DELETE" }), // accessable to admin only
  buy: (id: string, quantity: number) =>
    api<{ purchase: StockPurchase; transaction: Transaction }>(
      `/stocks/${id}/buy`,
      { method: "POST", body: JSON.stringify({ quantity }) },
    ),
};
export const copyTradingApi = {
  list: () => api<CopyTrading[]>("/copy-trading"), //accessable to both user and admin
  get: (id: string) => api<CopyTrading>(`/copy-trading/${id}`), //accessable to both user and admin
  create: (data: CreateCopyTradingPayload) =>
    api<CopyTrading>("/copy-trading", {
      method: "POST",
      body: JSON.stringify(data),
    }), // accessable to admin only
  update: (id: string, data: UpdateCopyTradingPayload) =>
    api<CopyTrading>(`/copy-trading/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }), // accessable to admin only
  remove: (id: string) =>
    api<{ message: string }>(`/copy-trading/${id}`, { method: "DELETE" }), // accessable to admin only
  buy: (id: string, amountInvested: number) =>
    api<{ purchase: CopyTradePurchase; transaction: Transaction }>(
      `/copy-trading/${id}/buy`,
      { method: "POST", body: JSON.stringify({ amountInvested }) },
    ), // accessable to user only
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
  adminLogin: (data: { email: string; password: string }) =>
    api<AuthResponse>("/admin/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  users: (page = 1, limit = 20) =>
    api<Paginated<ApiUser>>(`/admin/users?page=${page}&limit=${limit}`),
  updateUser: (
    id: string,
    data: { isAdmin?: boolean; isSuspended?: boolean },
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
    }),
};
