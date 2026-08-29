

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
  AAPL: { symbol: "AAPL", name: "Apple Inc.", price: "$180.50", change: "2.45", pct: "+1.38%", up: true, icon: "logos:apple", bgColor: "rgba(255, 255, 255, 0.1)", description: "Apple Inc. is an American multinational technology company headquartered in Cupertino, California." },
  TSLA: { symbol: "TSLA", name: "Tesla Inc.", price: "$220.30", change: "-5.10", pct: "-2.26%", up: false, icon: "logos:tesla", bgColor: "rgba(230, 26, 36, 0.1)", description: "Tesla, Inc. is an American multinational automotive and clean energy company." },
  NVDA: { symbol: "NVDA", name: "NVIDIA Corp.", price: "$875.12", change: "18.50", pct: "+2.16%", up: true, icon: "logos:nvidia", bgColor: "rgba(118, 185, 0, 0.1)", description: "NVIDIA Corporation is an American multinational technology company." },
  MSFT: { symbol: "MSFT", name: "Microsoft Corp.", price: "$415.60", change: "1.20", pct: "+0.29%", up: true, icon: "logos:microsoft-icon", bgColor: "rgba(0, 164, 239, 0.1)", description: "Microsoft Corporation is an American multinational technology corporation." },
  AMZN: { symbol: "AMZN", name: "Amazon.com Inc.", price: "$178.15", change: "-0.85", pct: "-0.47%", up: false, icon: "logos:amazon-icon", bgColor: "rgba(255, 153, 0, 0.1)", description: "Amazon.com, Inc. is an American multinational technology company focusing on e-commerce, cloud computing, and digital streaming." },
  GOOGL: { symbol: "GOOGL", name: "Alphabet Inc.", price: "$152.50", change: "0.90", pct: "+0.59%", up: true, icon: "logos:google-icon", bgColor: "rgba(66, 133, 244, 0.1)", description: "Alphabet Inc. is an American multinational technology conglomerate holding company." },
  // ── Dummy stock added for backend integration reference ──
  PYPL: { symbol: "PYPL", name: "PayPal Holdings Inc.", price: "$62.35", change: "1.85", pct: "+3.06%", up: true, icon: "logos:paypal", bgColor: "rgba(0, 112, 186, 0.1)", description: "PayPal Holdings, Inc. operates a technology platform that enables digital payments and simplifies commerce experiences on behalf of merchants and consumers worldwide." },
};

export const marketAssets: Stock[] = Object.values(stockData);

// ── Dummy portfolio asset — pre-seeded for backend integration reference ──
export const portfolioAssetsList: PortfolioAsset[] = [
  {
    symbol:      "PYPL",
    name:        "PayPal Holdings Inc.",
    price:       "$62.35",
    change:      "1.85",
    pct:         "+3.06%",
    up:          true,
    icon:        "logos:paypal",
    bgColor:     "rgba(0, 112, 186, 0.1)",
    description: "PayPal Holdings, Inc. operates a technology platform that enables digital payments.",
    amount:      "8.02726700",  // units held
    value:       "$500.00",     // usdAmount at purchase
  },
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

export const copyTradeSetups: CopyTradeSetup[] = [
  {
    id: "setup-001",
    traderId: "george-nathan",
    traderNickname: "George",
    countryFlag: "🇺🇸",
    country: "USA",
    leverage: 10,
    coin: { symbol: "BTC", name: "Bitcoin", icon: "logos:bitcoin", bgColor: "rgba(247, 147, 26, 0.1)" },
    price: 250,
    traderWinRate: 78,
  },
  {
    id: "setup-002",
    traderId: "sara-malik",
    traderNickname: "SarahM",
    countryFlag: "🇬🇧",
    country: "UK",
    leverage: 5,
    coin: { symbol: "ETH", name: "Ethereum", icon: "logos:ethereum", bgColor: "rgba(98, 126, 234, 0.1)" },
    price: 180,
    traderWinRate: 72,
  },
  {
    id: "setup-003",
    traderId: "alex-troy",
    traderNickname: "CryptoKing",
    countryFlag: "🇯🇵",
    country: "Japan",
    leverage: 3,
    coin: { symbol: "SOL", name: "Solana", icon: "logos:solana", bgColor: "rgba(20, 241, 149, 0.1)" },
    price: 120,
    traderWinRate: 85,
  },
];

export const sampleLastTrades: CopyTradeTransaction[] = [];

