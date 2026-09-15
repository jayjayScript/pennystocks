"use client";
import OverviewScreen from "./OverviewScreen";
import QuickStats from "./QuickStats";
import MyStocks from "./MyStocks";
import AssetPortfolio from "./AssetPortfolio";
import TransactionList from "./TransactionList";

const Overview_api_utilizer = () => {
   return (
      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
         {/* Row 1: Hero (2/3) + Quick Stats (1/3) */}
         <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <OverviewScreen />
         </div>
         <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <QuickStats />
         </div>

         {/* Row 2: My Stocks (2/3) + Asset Portfolio (1/3) */}
         <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <MyStocks />
         </div>
         <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <AssetPortfolio />
         </div>

         {/* Row 3: Recent Transactions (full width) */}
         <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <TransactionList />
         </div>
      </div>
   );
};

export default Overview_api_utilizer;
