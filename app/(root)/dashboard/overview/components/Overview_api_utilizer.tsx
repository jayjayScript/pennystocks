"use client";
import OverviewScreen from "./OverviewScreen";
import QuickStats from "./QuickStats";
import MyStocks from "./MyStocks";
import AssetPortfolio from "./AssetPortfolio";
import TransactionList from "./TransactionList";
import PendingDepositBanner from "@/components/global/PendingDepositBanner";
import { useUserProfile } from "@/hooks/queries/useUserProfile";
import { useStocks } from "@/hooks/queries/useStocks";
import { useTransactions } from "@/hooks/queries/useTransactions";

const Overview_api_utilizer = () => {
   const {
      data: user,
      isPending: isUserPending,
      isError: isUserError,
      error: userError,
   } = useUserProfile();

   const {
      data: stocksData,
      isPending: isStocksPending,
      isError: isStocksError,
      error: stocksError,
   } = useStocks();

   const {
      data: transactionsData,
      isPending: isTransactionsPending,
      isError: isTransactionsError,
      error: transactionsError,
   } = useTransactions();

   // Overall loading state
   if (
      isUserPending ||
      isStocksPending ||
      isTransactionsPending
   ) {
      return (
         <div className="p-6">
            Loading dashboard...
         </div>
      );
   }

   // Overall error state
   if (isUserError) {
      return (
         <div className="p-6">
            Failed to load user profile: {userError.message}
         </div>
      );
   }

   if (isStocksError) {
      return (
         <div className="p-6">
            Failed to load stocks: {stocksError.message}
         </div>
      );
   }

   if (isTransactionsError) {
      return (
         <div className="p-6">
            Failed to load transactions: {transactionsError.message}
         </div>
      );
   }

   const stocks = stocksData.data ?? [];
   const transactions = transactionsData.data ?? [];
   return (
      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
         {/* Pending Deposit Alert Banner (Shows when admin provides payment details) */}
         <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <PendingDepositBanner />
         </div>

         {/* Row 1: Hero (2/3) + Quick Stats (1/3) */}
         <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <OverviewScreen />
         </div>
         <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <QuickStats />
         </div>

         {/* Row 2: My Stocks (2/3) + Asset Portfolio (1/3) */}
         <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <MyStocks stocks={stocks} />
         </div>
         <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <AssetPortfolio stocks={stocks} />
         </div>

         {/* Row 3: Recent Transactions (full width) */}
         <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <TransactionList />
         </div>
      </div>
   );
};

export default Overview_api_utilizer;
