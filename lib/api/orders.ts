export interface OrderData {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdraw";
  symbol: string;
  name: string;
  icon?: string;
  bgColor?: string;
  stockPrice: number;
  units: number;
  usdAmount: number;
  fee: number;
  totalCost: number;
  netReceive: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  proofImageUrl?: string;
  note?: string;
}

export interface ApproveOrderResponse {
  success: boolean;
  message: string;
  order: OrderData;
}

export interface RejectOrderResponse {
  success: boolean;
  message: string;
}

export async function fetchOrders(): Promise<OrderData[]> {
  // This will be implemented when backend is available
  return [];
}

export async function approveOrder(orderId: string): Promise<ApproveOrderResponse> {
  // This will be implemented when backend is available
  return {
    success: true,
    message: "Order approval endpoint stub",
    order: {} as OrderData,
  };
}

export async function rejectOrder(orderId: string): Promise<RejectOrderResponse> {
  // This will be implemented when backend is available
  return {
    success: true,
    message: "Order rejection endpoint stub",
  };
}