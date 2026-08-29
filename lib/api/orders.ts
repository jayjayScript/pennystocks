import { adminApi } from "./backend";
import type { PaymentOrder } from "@/types/api";
export type OrderData = PaymentOrder;

export interface ApproveOrderResponse {
  success: boolean;
  message: string;
  order: OrderData;
}

export interface RejectOrderResponse {
  success: boolean;
  message: string;
}

export async function fetchOrders(): Promise<OrderData[]> { return adminApi.paymentOrders(); }

export async function approveOrder(orderId: string) { return adminApi.updatePaymentOrder(orderId, { status: "completed" }); }

export async function rejectOrder(orderId: string) { return adminApi.updatePaymentOrder(orderId, { status: "rejected" }); }
