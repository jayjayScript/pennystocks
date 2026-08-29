export { stocksApi } from "./backend";
export type { Stock as StockData, CreateStockPayload } from "@/types/api";
import { stocksApi } from "./backend";
import type { CreateStockPayload } from "@/types/api";
export const createStock = (stock: CreateStockPayload) => stocksApi.create(stock);
