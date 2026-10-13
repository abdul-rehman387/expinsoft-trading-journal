import { test } from "node:test";
import assert from "node:assert/strict";
import { validateTrade } from "../src/lib/trades.js";
import { tradesFromCsv, tradesToCsv } from "../src/storage.js";
const valid = {
  asset: "btc",
  date: "2026-10-01T09:00",
  exitDate: "2026-10-01T10:00",
  market: "Spot",
  direction: "Long",
  entry: 100,
  exit: 110,
  size: 1000,
  pnl: 100,
};
test("server payload rejects caller-controlled ownership and IDs", () => {
  const result = validateTrade({
    ...valid,
    user_id: "someone-else",
    id: "forged",
    created_at: "tomorrow",
  });
  assert.equal(result.asset, "BTC");
  assert.equal(result.user_id, undefined);
  assert.equal(result.id, undefined);
  assert.equal(result.created_at, undefined);
});
test("server validation rejects malformed trades before database writes", () => {
  for (const change of [
    { size: -1 },
    { entry: 0 },
    { exit: Infinity },
    { pnl: "NaN" },
    { market: "Other" },
    { direction: "Other" },
    { date: "invalid" },
    { exitDate: "2026-09-01" },
  ])
    assert.throws(() => validateTrade({ ...valid, ...change }));
});
test("CSV roundtrip preserves quoted notes and returns valid server payloads", () => {
  const input = {
    ...valid,
    notes: 'comma, quote " and\nnewline',
    source: "Manual",
  };
  const records = tradesFromCsv(tradesToCsv([input]));
  assert.equal(records.length, 1);
  assert.equal(records[0].notes, input.notes);
  assert.equal(validateTrade(records[0]).asset, "BTC");
});
