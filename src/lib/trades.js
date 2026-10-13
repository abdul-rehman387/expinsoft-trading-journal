import { tradeColumns } from "../storage.js";
export function validateTrade(input) {
  const trade = Object.fromEntries(
    tradeColumns
      .filter((key) => input[key] !== undefined)
      .map((key) => [key, input[key]]),
  );
  for (const key of [
    "entry",
    "exit",
    "size",
    "fees",
    "funding",
    "gas",
    "leverage",
    "pnl",
  ]) {
    trade[key] = Number(trade[key] ?? (key === "leverage" ? 1 : 0));
    if (!Number.isFinite(trade[key])) throw new Error("Invalid " + key);
  }
  if (
    !String(trade.asset || "").trim() ||
    !Number.isFinite(Date.parse(trade.date)) ||
    !Number.isFinite(Date.parse(trade.exitDate)) ||
    Date.parse(trade.exitDate) < Date.parse(trade.date) ||
    trade.entry <= 0 ||
    trade.exit <= 0 ||
    trade.size <= 0 ||
    trade.leverage < 1
  )
    throw new Error("Invalid trade details.");
  if (
    !["Spot", "Perpetual"].includes(trade.market) ||
    !["Long", "Short"].includes(trade.direction)
  )
    throw new Error("Invalid market or direction.");
  trade.asset = String(trade.asset).trim().toUpperCase();
  return trade;
}
