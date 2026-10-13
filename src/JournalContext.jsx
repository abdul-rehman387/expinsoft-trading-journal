"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tradesFromCsv, tradesToCsv } from "./storage";
import * as actions from "./app/actions/trades";
const JournalContext = createContext(null);
export const useJournal = () => useContext(JournalContext);
export function JournalProvider({ children, initialTrades, initialError }) {
  const [trades, setTrades] = useState(initialTrades);
  const router = useRouter();
  useEffect(() => setTrades(initialTrades), [initialTrades]);
  const createTrade = async (trade) => {
    const record = await actions.createTrade(trade);
    setTrades((current) => [record, ...current]);
    router.refresh();
    return record;
  };
  const updateTrade = async (id, trade) => {
    const record = await actions.updateTrade(id, trade);
    setTrades((current) => current.map((t) => (t.id === id ? record : t)));
    router.refresh();
    return record;
  };
  const deleteTrade = async (id) => {
    await actions.deleteTrade(id);
    setTrades((current) => current.filter((t) => t.id !== id));
    router.refresh();
  };
  const clearManual = async () => {
    await actions.clearManual();
    setTrades((current) => current.filter((t) => t.source !== "Manual"));
    router.refresh();
  };
  const importCsv = async (file) => {
    const records = await actions.importTrades(
      tradesFromCsv(await file.text()),
    );
    setTrades((current) => [...records, ...current]);
    router.refresh();
    return records.length;
  };
  const exportCsv = () => {
    const url = URL.createObjectURL(
      new Blob([tradesToCsv(trades)], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "expinsoft-journal.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <JournalContext.Provider
      value={{
        trades,
        loading: false,
        error: initialError,
        refresh: () => router.refresh(),
        createTrade,
        updateTrade,
        deleteTrade,
        clearManual,
        importCsv,
        exportCsv,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}
