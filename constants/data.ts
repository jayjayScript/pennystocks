

export const navLinks = [
    {
        page: "Home",
        icon: "material-symbols:home-outline-rounded",
        href: "/dashboard/overview"
    },
    {
        page: "News",
        icon: "fa6-solid:list",
        href: "https://www.barchart.com/stocks/top-100-stocks?orderBy=weightedAlpha&orderDir=desc"
    },
    {
        page: "Market place",
        icon: "fluent:arrow-swap-16-filled",
        href: "/dashboard/marketplace"
    },
    {
        page: "FAQ",
        icon: "humbleicons:chat",
        href: "/dashboard/faq"
    },
    {
        page: "Profile",
        icon: "iconamoon:profile-circle-fill",
        href: "/dashboard/profile"
    }
]

export const stats = [
  { label: "Total Assets", value: "$200,000", icon: "material-symbols:account-balance-wallet-outline-rounded", change: "+22.8%", up: true },
  { label: "Total Transactions", value: "90,744", icon: "mdi:transfer", change: "+7% Income", up: true },
  { label: "Credit Rate", value: "803", icon: "mdi:credit-card-outline", change: "Excellent", up: true },
];

export const recentTransactions = [
  { name: "BTC Bitcoin",    amount: "+$1,892.25", type: "income",   date: "Feb 20" },
  { name: "ETH Ethereum",   amount: "-$387.47",   type: "expense",  date: "Feb 19" },
  { name: "BNB BNB",        amount: "+$902.10",   type: "income",   date: "Feb 18" },
  { name: "LTC Litecoin",   amount: "-$120.00",   type: "expense",  date: "Feb 17" },
];

export const myStocksMini = [
  { symbol: "BTC", name: "Bitcoin",  price: "$1,892.25", change: "+2.4%", up: true  },
  { symbol: "ETH", name: "Ethereum", price: "$387.47",   change: "-1.2%", up: false },
  { symbol: "BNB", name: "BNB",      price: "$571.28",   change: "+1.3%", up: true  },
];

export const entries: ProfitEntry[] = [
  { amount: "1892.25", label: "Income", period: "Today", trend: "up" },
  { amount: "387.47", label: "Income", period: "Yesterday", trend: "down" },
];

export const stockData: Record<string, Stock> = {
  BTC: { symbol: "BTC", name: "Bitcoin", price: "$57,207.00", change: "2,540", pct: "+2.40%", up: true, icon: "logos:bitcoin", bgColor: "rgba(247, 147, 26, 0.1)", description: "Bitcoin is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries." },
  ETH: { symbol: "ETH", name: "Ethereum", price: "$3,129.00", change: "1,320", pct: "+1.32%", up: true, icon: "logos:ethereum", bgColor: "rgba(98, 126, 234, 0.1)", description: "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform." },
  BNB: { symbol: "BNB", name: "BNB", price: "$571.00", change: "557", pct: "+2.30%", up: true, icon: "logos:binance", bgColor: "rgba(243, 186, 47, 0.1)", description: "BNB is the cryptocurrency coin that powers the BNB Chain ecosystem. BNB is one of the world's most popular utility tokens." },
  SOL: { symbol: "SOL", name: "Solana", price: "$150.00", change: "12", pct: "+5.00%", up: true, icon: "logos:solana", bgColor: "rgba(20, 241, 149, 0.1)", description: "Solana is a public blockchain platform. It is open-source and decentralized, with consensus achieved using proof of stake and proof of history." },
  LTC: { symbol: "LTC", name: "Litecoin", price: "$89.50", change: "2", pct: "+2.14%", up: true, icon: "logos:litecoin", bgColor: "rgba(191, 187, 187, 0.1)", description: "Litecoin is a peer-to-peer cryptocurrency and open-source software project released under the MIT/X11 license." },
  NGN: { symbol: "NGN", name: "Naira", price: "$0.00065", change: "0", pct: "+0.00%", up: true, icon: "circle-flags:ng", bgColor: "rgba(0, 135, 81, 0.1)", description: "The naira is the currency of Nigeria." },
  USD: { symbol: "USD", name: "United States Dollar", price: "$1.00", change: "0", pct: "+0.00%", up: true, icon: "circle-flags:us", bgColor: "rgba(29, 164, 98, 0.1)", description: "The United States dollar is the official currency of the United States and its territories." }
};

export const marketAssets: Stock[] = Object.values(stockData);

export const portfolioAssetsList: PortfolioAsset[] = [
  { ...stockData.BTC, amount: "0.14", value: "$8,008.98" },
  { ...stockData.ETH, amount: "4.65", value: "$14,549.85" },
  { ...stockData.SOL, amount: "12.50", value: "$1,875.00" },
  { ...stockData.BNB, amount: "5.0", value: "$2,855.00" },
];

export const copyTraders: CopyTrader[] = [
  {
    id: "george-nathan",
    name: "George Nathan",
    avatarInitials: "GN",
    verified: true,
    riskLevel: "High",
    gainPct: "+22.8%",
    gainPositive: true,
    period: "30 Days",
    avgDailyProfit: "1.8%",
    copies: "1,370+",
    totalAssets: 3,
  },
  {
    id: "sara-malik",
    name: "Sara Malik",
    avatarInitials: "SM",
    verified: true,
    riskLevel: "Medium",
    gainPct: "+18.4%",
    gainPositive: true,
    period: "30 Days",
    avgDailyProfit: "1.2%",
    copies: "890+",
    totalAssets: 5,
  },
  {
    id: "alex-troy",
    name: "Alex Troy",
    avatarInitials: "AT",
    verified: false,
    riskLevel: "Low",
    gainPct: "+9.1%",
    gainPositive: true,
    period: "30 Days",
    avgDailyProfit: "0.6%",
    copies: "440+",
    totalAssets: 7,
  },
  {
    id: "priya-chen",
    name: "Priya Chen",
    avatarInitials: "PC",
    verified: true,
    riskLevel: "High",
    gainPct: "+31.5%",
    gainPositive: true,
    period: "30 Days",
    avgDailyProfit: "2.4%",
    copies: "2,100+",
    totalAssets: 4,
  },
];
