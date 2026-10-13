import React, { createContext, useContext, useRef, useState } from "react";
import { readStored, tradesFromCsv, tradesToCsv } from "./storage";

const JournalContext = createContext(null);
export const useJournal = () => useContext(JournalContext);

export function JournalProvider({ children }) {
  const [trades, updateState] = useState(() => {
    const saved = readStored("expinsoft_trades", []);
    return Array.isArray(saved) ? saved : [];
  });
  const current = useRef(trades);
  const setTrades = (update) => {
    const next =
      typeof update === "function" ? update(current.current) : update;
    // Write first: a failed storage write must not look like a successful save.
    localStorage.setItem("expinsoft_trades", JSON.stringify(next));
    current.current = next;
    updateState(next);
  };
  const importCsv = async (file) => {
    const imported = tradesFromCsv(await file.text());
    setTrades((existing) => [...existing, ...imported]);
    return imported.length;
  };
  const exportCsv = () => {
    const url = URL.createObjectURL(
      new Blob([tradesToCsv(current.current)], {
        type: "text/csv;charset=utf-8",
      }),
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
      value={{ trades, setTrades, importCsv, exportCsv }}
    >
      {children}
    </JournalContext.Provider>
  );
}
