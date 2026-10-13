export function readStored(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export const tradeColumns = [
  "source",
  "date",
  "exitDate",
  "asset",
  "market",
  "direction",
  "entry",
  "exit",
  "size",
  "fees",
  "funding",
  "gas",
  "leverage",
  "strategy",
  "pnl",
  "notes",
  "exchange",
];

export function tradesToCsv(trades) {
  return [
    tradeColumns,
    ...trades.map((t) => tradeColumns.map((k) => t[k] ?? "")),
  ]
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
}

// Parse quoted commas, escaped quotes, CRLF, and multiline notes.
export function tradesFromCsv(text) {
  const rows = [];
  let row = [],
    field = "",
    quoted = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      if (c === "\r" && text[i + 1] === "\n") i++;
    } else field += c;
  }
  if (quoted) throw new Error("CSV contains an unfinished quoted field.");
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows.shift()?.map((h) => h.trim());
  const required = [
    "asset",
    "date",
    "exitDate",
    "entry",
    "exit",
    "size",
    "pnl",
  ];
  if (!headers || required.some((k) => !headers.includes(k))) {
    throw new Error(
      `CSV must include: ${required.join(", ")}. Use an exported journal as a template.`,
    );
  }
  const numeric = [
    "entry",
    "exit",
    "size",
    "fees",
    "funding",
    "gas",
    "leverage",
    "pnl",
  ];
  return rows
    .filter((r) => r.some((v) => v.trim()))
    .map((r, index) => {
      if (r.length !== headers.length)
        throw new Error(
          `CSV row ${index + 2} has the wrong number of columns.`,
        );
      const t = Object.fromEntries(headers.map((h, i) => [h, r[i]]));
      for (const k of numeric) {
        if (required.includes(k) && !t[k]?.trim())
          throw new Error(`Missing ${k} in row ${index + 2}.`);
        t[k] = Number(t[k] || (k === "leverage" ? 1 : 0));
        if (!Number.isFinite(t[k]))
          throw new Error(`Invalid ${k} in row ${index + 2}.`);
      }
      if (
        !t.asset?.trim() ||
        !Number.isFinite(Date.parse(t.date)) ||
        !Number.isFinite(Date.parse(t.exitDate)) ||
        Date.parse(t.exitDate) < Date.parse(t.date) ||
        t.entry <= 0 ||
        t.exit <= 0 ||
        t.size <= 0 ||
        t.leverage < 1
      ) {
        throw new Error(
          `Invalid asset, dates, prices, size or leverage in row ${index + 2}.`,
        );
      }
      t.market ||= "Spot";
      t.direction ||= "Long";
      if (
        !["Spot", "Perpetual"].includes(t.market) ||
        !["Long", "Short"].includes(t.direction)
      )
        throw new Error(`Invalid market or direction in row ${index + 2}.`);
      return {
        ...t,
        id: crypto.randomUUID(),
        source: t.source || "Imported",
        asset: t.asset.trim().toUpperCase(),
      };
    });
}
