import AssetPortfolio from "./components/AssetPortfolio";
import MyStocks from "./components/MyStocks";
import OverviewScreen from "./components/OverviewScreen";

export default function OverviewPage() {
  return (
    <>
      <OverviewScreen />
      <MyStocks />
      <AssetPortfolio />
    </>
  )
}