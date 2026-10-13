export const initialTrades = [];
export const equity = [];
export const pairPerformance = [];
export const hourlyPnl = [];
export const strategies = [
  "Breakout",
  "DCA",
  "Trend following",
  "Mean reversion",
  "Funding Arb",
];
export const money = (n, c = "USDT") =>
  `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(Number(n) || 0)} ${c}`;
