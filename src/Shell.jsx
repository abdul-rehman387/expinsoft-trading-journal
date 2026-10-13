"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ChartNoAxesCombined,
  Settings,
  Plus,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  UserRound,
  UserPlus,
  KeyRound,
  LogOut,
  Check,
  Search,
  Inbox,
  TrendingUp,
  Target,
  Activity,
  WalletCards,
  PlugZap,
  SlidersHorizontal,
  Database,
  Upload,
  Download,
  Trash2,
  ShieldCheck,
  RefreshCw,
  X,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { strategies, money } from "./data";
import { useAuth } from "./Auth";
import { useJournal } from "./JournalContext";
import { updateProfile, updatePassword } from "./app/actions/auth";
function Link({ to, children, ...props }) {
  return (
    <NextLink href={to} {...props}>
      {children}
    </NextLink>
  );
}
function NavLink({ to, className, end, children, ...props }) {
  const pathname = usePathname();
  const isActive = end
    ? pathname === to
    : pathname === to || pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={
        typeof className === "function" ? className({ isActive }) : className
      }
      {...props}
    >
      {children}
    </Link>
  );
}
function useLocation() {
  return { pathname: usePathname() };
}

const mainNav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Trade Log", "/trades", BookOpen],
  ["Analytics", "/analytics", ChartNoAxesCombined],
  ["Settings", "/settings/connections", Settings],
];
const settingsNav = [
  ["Connections & APIs", "connections", PlugZap],
  ["Trading Preferences", "preferences", SlidersHorizontal],
  ["Data Management", "data", Database],
  ["Profile & Appearance", "appearance", UserRound],
];
const titles = {
  profile: ["Your profile", "Review and update your account details."],
  "add-user": [
    "Add a platform user",
    "Create access for an administrator, trader, or viewer.",
  ],
  "reset-password": [
    "Reset your password",
    "Choose a strong password for your ExpinSoft account.",
  ],
};
function Card({ children, className = "", ...props }) {
  return (
    <section className={`card ${className}`} {...props}>
      {children}
    </section>
  );
}
function EmptyState({ compact = false, onAdd }) {
  return (
    <div className={`zero-state ${compact ? "compact" : ""}`}>
      <span>
        <Inbox />
      </span>
      <h3>No trades logged yet</h3>
      <p>Click “Add Manual Trade” to begin building your journal.</p>
      {!compact && (
        <button className="primary" onClick={onAdd}>
          <Plus />
          Add Manual Trade
        </button>
      )}
    </div>
  );
}

export default function Shell() {
  const { user, logout } = useAuth();
  const {
    trades,
    loading,
    error: journalError,
    refresh,
    createTrade,
    updateTrade,
    deleteTrade: removeTrade,
    clearManual: removeManual,
    importCsv,
    exportCsv,
  } = useJournal();
  const [editingTrade, setEditingTrade] = useState(null);
  const onEdit = (trade) => {
    setEditingTrade(trade);
    setModal(true);
  };
  const location = useLocation(),
    [dark, setDark] = useState(true),
    [modal, setModal] = useState(false),
    [toast, setToast] = useState(""),
    [menu, setMenu] = useState(false),
    [syncMode, setSyncMode] = useState("manual"),
    [prefs, setPrefs] = useState({
      currency: "USDT",
      timezone: "UTC",
      fee: "0.1",
    });
  useEffect(() => {
    try {
      setDark(localStorage.getItem("theme") !== "light");
      setSyncMode(localStorage.getItem("syncMode") || "manual");
      const saved = JSON.parse(localStorage.getItem("tradePrefs") || "null");
      if (saved) setPrefs(saved);
    } catch {
      /* Use default preferences if browser storage is unavailable. */
    }
  }, []);
  const dropdown = useRef(null),
    isAccount = ["/profile", "/add-user", "/reset-password"].includes(
      location.pathname,
    ),
    isSettings = location.pathname.startsWith("/settings");
  const page = isAccount
    ? titles[location.pathname.slice(1)]?.[0]
    : location.pathname === "/dashboard"
      ? "Dashboard"
      : location.pathname === "/trades"
        ? "Trade Log"
        : location.pathname === "/analytics"
          ? "Analytics"
          : "Settings";
  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2500);
  };
  useEffect(() => {
    const close = (e) =>
      dropdown.current &&
      !dropdown.current.contains(e.target) &&
      setMenu(false);
    addEventListener("mousedown", close);
    return () => removeEventListener("mousedown", close);
  }, []);
  useEffect(() => setMenu(false), [location.pathname]);
  const toggleTheme = () =>
    setDark((v) => {
      localStorage.setItem("theme", v ? "light" : "dark");
      return !v;
    });
  const exportData = () => {
    exportCsv();
    notify("Journal exported");
  };
  const importData = async (file) => {
    try {
      notify(`Imported ${await importCsv(file)} trades`);
    } catch (error) {
      notify(error.message);
    }
  };
  const persist = async (operation, message) => {
    try {
      await operation();
      notify(message);
      return true;
    } catch (error) {
      notify(error.message || "Could not save trades. Please try again.");
      return false;
    }
  };
  const addTrade = async (trade) => {
    const saved = await persist(
      () =>
        editingTrade
          ? updateTrade(editingTrade.id, {
              ...trade,
              source: editingTrade.source,
            })
          : createTrade({ ...trade, source: "Manual" }),
      editingTrade ? "Trade updated" : "Manual trade added",
    );
    if (saved) {
      setModal(false);
      setEditingTrade(null);
    }
  };
  const deleteTrade = (id) => persist(() => removeTrade(id), "Trade deleted");
  const clearManual = () => persist(removeManual, "Manual trades cleared");
  return (
    <div className={`app ${dark ? "dark" : "light"}`}>
      <aside className="sidebar">
        <Link className="brand brand-button" to="/">
          <span className="expin-glyph">
            <i />
            <b />
          </span>
          <span>
            ExpinSoft<small>SOFTWARE SOLUTIONS</small>
          </span>
        </Link>
        <div className="workspace">
          <span className="workspace-icon">₿</span>
          <div>
            <strong>Crypto journal</strong>
            <small>{syncMode === "live" ? "Live Sync" : "Manual Mode"}</small>
          </div>
          <span className={`mode-light ${syncMode}`} />
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {mainNav.map(([label, to, I]) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive || (label === "Settings" && isSettings) ? "active" : ""}`
              }
            >
              <I />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="growth-note">
            <strong>Your journal starts here.</strong>
            <p>Add your first trade manually or connect an exchange.</p>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Crypto Journal</span>
            <ChevronRight />
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <span className={`sync-state ${syncMode}`}>
              <i />
              {syncMode === "live" ? "Live Sync" : "Manual Mode"}
            </span>
            <button aria-label="Toggle theme" onClick={toggleTheme}>
              {dark ? <Sun /> : <Moon />}
            </button>
            <div className="user-menu-wrap" ref={dropdown}>
              <button
                className={`user-trigger ${menu ? "open" : ""}`}
                aria-haspopup="menu"
                aria-expanded={menu}
                onClick={() => setMenu(!menu)}
              >
                <span className="avatar small">
                  {user.name
                    .split(/\s+/)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
                <span>
                  <strong>{user.name}</strong>
                  <small>Administrator</small>
                </span>
                <ChevronDown />
              </button>
              {menu && (
                <div className="user-dropdown" role="menu">
                  <div className="dropdown-user">
                    <span className="avatar">
                      {user.name
                        .split(/\s+/)
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                    <div>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                  <Link to="/profile">
                    <UserRound />
                    Profile
                  </Link>
                  <Link to="/add-user">
                    <UserPlus />
                    Add User
                  </Link>
                  <Link to="/reset-password">
                    <KeyRound />
                    Reset Password
                  </Link>
                  <Link to="/settings/connections">
                    <Settings />
                    Settings
                  </Link>
                  <button className="logout-link" onClick={() => logout()}>
                    <LogOut />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main>
          {loading && <p role="status">Loading your journal...</p>}
          {journalError && (
            <div className="validation-banner" role="alert">
              {journalError}{" "}
              <button className="secondary" onClick={refresh}>
                Retry
              </button>
            </div>
          )}
          {location.pathname === "/dashboard" && (
            <Dashboard
              trades={trades}
              currency={prefs.currency}
              onAdd={() => {
                setEditingTrade(null);
                setModal(true);
              }}
              onDelete={deleteTrade}
              onEdit={onEdit}
            />
          )}
          {location.pathname === "/trades" && (
            <PageFrame
              title="Every execution, accounted for."
              text="Your journal will show manual and synced trades here."
              onAdd={() => {
                setEditingTrade(null);
                setModal(true);
              }}
            >
              <TradeLog
                trades={trades}
                onAdd={() => {
                  setEditingTrade(null);
                  setModal(true);
                }}
                onDelete={deleteTrade}
                onEdit={onEdit}
              />
            </PageFrame>
          )}
          {location.pathname === "/analytics" && (
            <PageFrame
              title="Find the patterns behind your PnL."
              text="Analytics populate after your first completed trade."
              onAdd={() => {
                setEditingTrade(null);
                setModal(true);
              }}
            >
              <Analytics trades={trades} />
            </PageFrame>
          )}
          {location.pathname.startsWith("/settings/") && (
            <PageFrame
              title="Workspace settings"
              text="Manage connections, defaults, data and appearance."
              onAdd={() => {
                setEditingTrade(null);
                setModal(true);
              }}
            >
              <SettingsLayout
                syncMode={syncMode}
                setSyncMode={setSyncMode}
                prefs={prefs}
                setPrefs={setPrefs}
                dark={dark}
                toggleTheme={toggleTheme}
                exportData={exportData}
                importData={importData}
                clearManual={clearManual}
                manualCount={trades.filter((t) => t.source === "Manual").length}
                notify={notify}
              />
            </PageFrame>
          )}
          {location.pathname === "/profile" && (
            <AccountFrame slug="profile">
              <ProfilePage notify={notify} />
            </AccountFrame>
          )}
          {location.pathname === "/add-user" && (
            <AccountFrame slug="add-user">
              <AddUserPage notify={notify} />
            </AccountFrame>
          )}
          {location.pathname === "/reset-password" && (
            <AccountFrame slug="reset-password">
              <ResetPasswordPage notify={notify} />
            </AccountFrame>
          )}
          <footer>
            <span>24/7 markets · UTC normalized</span>
            <span>ExpinSoft</span>
          </footer>
        </main>
      </div>
      {modal && (
        <ManualTradeModal
          defaults={prefs}
          trade={editingTrade}
          close={() => setModal(false)}
          save={addTrade}
        />
      )}{" "}
      {toast && (
        <div className="toast">
          <Check />
          {toast}
        </div>
      )}
    </div>
  );
}

function PageFrame({ title, text, onAdd, children }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EXPINSOFT CRYPTO JOURNAL</div>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
        <button className="primary manual-add" onClick={onAdd}>
          <Plus />
          Add Manual Trade
        </button>
      </div>
      {children}
    </>
  );
}
function Dashboard({ trades, currency, onAdd, onDelete, onEdit }) {
  const total = trades.reduce((s, t) => s + t.pnl, 0),
    wins = trades.filter((t) => t.pnl > 0).length,
    loss = Math.abs(
      trades.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0),
    ),
    profit = trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0),
    metrics = [
      [
        "Net PnL",
        trades.length ? money(total, currency) : `0.00 ${currency}`,
        TrendingUp,
      ],
      [
        "Win rate",
        trades.length ? `${((wins / trades.length) * 100).toFixed(1)}%` : "0%",
        Target,
      ],
      ["Profit factor", loss ? (profit / loss).toFixed(2) : "0.00", Activity],
      [
        "Manual trades",
        String(trades.filter((t) => t.source === "Manual").length),
        UserRound,
      ],
    ];
  const chartData = trades.length
    ? trades
        .slice()
        .reverse()
        .map((t, i) => ({
          step: i + 1,
          value: trades.slice(0, i + 1).reduce((s, x) => s + x.pnl, 0),
          btc: 0,
        }))
    : [];
  return (
    <>
      <PageFrame
        title="Trade with clarity. Review with context."
        text="A precise view of performance across your crypto portfolio."
        onAdd={onAdd}
      />
      <div className="dashboard-grid">
        {metrics.map(([l, v, I], i) => (
          <Card className={`metric ${i === 0 ? "featured" : ""}`} key={l}>
            <div className="card-label">
              {l}
              <I />
            </div>
            <div className="metric-value numeric">{v}</div>
            <div className="metric-bottom">
              <small>
                {trades.length ? "Current journal" : "Waiting for trade data"}
              </small>
            </div>
          </Card>
        ))}
        <Card className="equity-card">
          <div className="card-heading">
            <div>
              <h2>Equity vs BTC benchmark</h2>
              <p>Portfolio performance appears after trades are logged.</p>
            </div>
          </div>
          {chartData.length ? (
            <div className="equity-chart">
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Area dataKey="value" stroke="#3BA8FF" fill="#3BA8FF18" />
                  <Area
                    dataKey="btc"
                    stroke="var(--muted)"
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState compact onAdd={onAdd} />
          )}
        </Card>
        <Card className="activity-card source-summary">
          <div className="card-heading">
            <div>
              <h2>Journal sources</h2>
              <p>Manual and API trade distribution.</p>
            </div>
            <WalletCards />
          </div>
          {trades.length ? (
            <>
              <div className="source-ring">
                <span>
                  <strong>{trades.length}</strong>
                  <small>trades</small>
                </span>
              </div>
              <div className="source-row">
                <span>API Synced</span>
                <strong>
                  {trades.filter((t) => t.source === "API Synced").length}
                </strong>
              </div>
              <div className="source-row">
                <span>Manual</span>
                <strong>
                  {trades.filter((t) => t.source === "Manual").length}
                </strong>
              </div>
            </>
          ) : (
            <EmptyState compact onAdd={onAdd} />
          )}
        </Card>
        <Card className="recent-card">
          <div className="card-heading">
            <div>
              <h2>Recent trades</h2>
              <p>Your latest executions will appear here.</p>
            </div>
          </div>
          {trades.length ? (
            <TradeTable
              trades={trades.slice(0, 5)}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ) : (
            <EmptyState onAdd={onAdd} />
          )}
        </Card>
      </div>
    </>
  );
}

function TradeLog({ trades, onAdd, onDelete, onEdit }) {
  const [q, setQ] = useState("");
  const rows = trades.filter((t) =>
    (t.asset + t.notes).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Card className="log-card">
      <div className="table-filters">
        <label className="search-field">
          <Search />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pair or notes…"
          />
        </label>
      </div>
      {rows.length ? (
        <TradeTable trades={rows} onDelete={onDelete} onEdit={onEdit} />
      ) : (
        <EmptyState onAdd={onAdd} />
      )}
    </Card>
  );
}
function TradeTable({ trades, onDelete, onEdit }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Pair</th>
            <th>Entry / Exit</th>
            <th>Market</th>
            <th>Direction</th>
            <th>Entry</th>
            <th>Exit</th>
            <th>Size (USD)</th>
            <th>Net PnL</th>
            <th className="actions-heading">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id}>
              <td>
                <span
                  className={`source-badge ${t.source === "Manual" ? "manual" : "synced"}`}
                >
                  {t.source}
                </span>
              </td>
              <td>{t.asset}</td>
              <td className="numeric">
                {t.date}
                <small>{t.exitDate}</small>
              </td>
              <td>
                {t.market}
                {t.market !== "Spot" && ` - ${t.leverage || 1}x`}
              </td>
              <td>
                {t.direction === "Long" ? <ArrowUpRight /> : <ArrowDownRight />}
                {t.direction}
              </td>
              <td>{t.entry}</td>
              <td>{t.exit}</td>
              <td className="numeric">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(t.size)}
              </td>
              <td className={t.pnl >= 0 ? "positive" : "negative"}>
                {money(t.pnl)}
              </td>
              <td className="trade-actions-cell">
                <TradeActions trade={t} onDelete={onDelete} onEdit={onEdit} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TradeActions({ trade, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const closeOnViewportChange = () => setOpen(false);
    const closeMenu = (event) => {
      if (
        !triggerRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    addEventListener("mousedown", closeMenu);
    addEventListener("scroll", closeOnViewportChange, true);
    addEventListener("resize", closeOnViewportChange);
    return () => {
      removeEventListener("mousedown", closeMenu);
      removeEventListener("scroll", closeOnViewportChange, true);
      removeEventListener("resize", closeOnViewportChange);
    };
  }, []);

  const toggleMenu = () => {
    if (!open) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = 92;
      const menuWidth = 160;
      setPosition({
        top:
          rect.bottom + menuHeight + 8 > window.innerHeight
            ? rect.top - menuHeight - 6
            : rect.bottom + 6,
        left: Math.max(
          12,
          Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12),
        ),
      });
    }
    setOpen((value) => !value);
  };

  return (
    <div className="trade-actions">
      <button
        ref={triggerRef}
        type="button"
        className="kebab-button"
        aria-label={`Actions for ${trade.asset}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleMenu}
      >
        ⋮
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="trade-actions-menu trade-actions-portal"
            role="menu"
            style={{ top: position.top, left: position.left }}
          >
            <button
              type="button"
              onClick={() => {
                onEdit(trade);
                setOpen(false);
              }}
            >
              Edit Trade
            </button>
            <button
              type="button"
              className="delete-trade"
              onClick={() => {
                onDelete(trade.id);
                setOpen(false);
              }}
            >
              Delete Trade
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
function Analytics({ trades }) {
  return (
    <div className="analytics-grid">
      <Card>
        <h2>PnL by pair</h2>
        {trades.length ? <p>Analytics ready.</p> : <EmptyState compact />}
      </Card>
      <Card>
        <h2>Hourly PnL</h2>
        {trades.length ? <p>Analytics ready.</p> : <EmptyState compact />}
      </Card>
    </div>
  );
}

function SettingsLayout(p) {
  const { section = "connections" } =
    useLocation().pathname.match(/settings\/(?<section>[^/]+)/)?.groups || {};
  return (
    <div className="settings-layout">
      <aside className="settings-nav">
        <div>
          <small>SETTINGS</small>
          <h2>Workspace controls</h2>
        </div>
        {settingsNav.map(([label, key, I]) => (
          <NavLink
            key={key}
            to={`/settings/${key}`}
            className={section === key ? "active" : ""}
          >
            <I />
            <span>
              {label}
              <small>
                {key === "connections"
                  ? "Sync mode & API keys"
                  : key === "preferences"
                    ? "Currency, time & fees"
                    : key === "data"
                      ? "Import, export & reset"
                      : "Identity and theme"}
              </small>
            </span>
            <ChevronRight />
          </NavLink>
        ))}
      </aside>
      <section className="settings-content">
        {section === "connections" ? (
          <Connections {...p} />
        ) : section === "preferences" ? (
          <Preferences {...p} />
        ) : section === "data" ? (
          <DataManagement {...p} />
        ) : (
          <Appearance {...p} />
        )}
      </section>
    </div>
  );
}
function SettingsHeader({ eyebrow, title, text }) {
  return (
    <div className="settings-header">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
function Connections({ syncMode, setSyncMode, notify }) {
  const setMode = (m) => {
    setSyncMode(m);
    localStorage.setItem("syncMode", m);
    notify(`${m === "live" ? "Live Sync" : "Manual Mode"} enabled`);
  };
  return (
    <>
      <SettingsHeader
        eyebrow="CONNECTIONS & APIS"
        title="Choose how trades enter your journal"
        text="Connect exchanges later or begin immediately with manual entry."
      />
      <div className="mode-switch">
        <button
          className={syncMode === "live" ? "active" : ""}
          onClick={() => setMode("live")}
        >
          <RefreshCw />
          <span>
            <strong>Live Sync</strong>
            <small>Use connected exchange APIs</small>
          </span>
        </button>
        <button
          className={syncMode === "manual" ? "active" : ""}
          onClick={() => setMode("manual")}
        >
          <UserRound />
          <span>
            <strong>Manual Mode</strong>
            <small>Enter trades yourself</small>
          </span>
        </button>
      </div>
      <div className="settings-section-title">
        <div>
          <h3>Exchange API keys</h3>
          <p>No exchanges are connected yet.</p>
        </div>
        <span>
          <ShieldCheck />
          Read-only
        </span>
      </div>
      <EmptyState compact />
    </>
  );
}
function Preferences({ prefs, setPrefs, notify }) {
  const submit = (e) => {
    e.preventDefault();
    localStorage.setItem("tradePrefs", JSON.stringify(prefs));
    notify("Preferences saved");
  };
  return (
    <>
      <SettingsHeader
        eyebrow="TRADING PREFERENCES"
        title="Set your journal defaults"
        text="Choose currency, timezone and fee defaults for manual trades."
      />
      <form className="settings-form" onSubmit={submit}>
        <div className="preference-grid">
          <Field label="Base display currency">
            <select
              value={prefs.currency}
              onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
            >
              <option>USD</option>
              <option>USDT</option>
              <option>BTC</option>
            </select>
          </Field>
          <Field label="Default timezone">
            <select
              value={prefs.timezone}
              onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
            >
              <option>UTC</option>
              <option>Local</option>
            </select>
          </Field>
          <Field label="Default exchange fee (%)">
            <input
              type="number"
              min="0"
              step="0.001"
              value={prefs.fee}
              onChange={(e) => setPrefs({ ...prefs, fee: e.target.value })}
            />
          </Field>
        </div>
        <button className="primary">Save preferences</button>
      </form>
    </>
  );
}
function DataManagement({ exportData, importData, clearManual, manualCount }) {
  return (
    <>
      <SettingsHeader
        eyebrow="DATA MANAGEMENT"
        title="Import, export and reset"
        text="Back up your journal or import a previously exported CSV."
      />
      <div className="data-actions">
        <div>
          <span className="action-icon">
            <Upload />
          </span>
          <div>
            <h3>Import trades</h3>
            <p>Upload an ExpinSoft journal CSV.</p>
          </div>
          <label className="secondary file-button">
            Choose CSV
            <input
              type="file"
              accept=".csv"
              onChange={async (e) => {
                const file = e.target.files[0];
                e.target.value = "";
                if (file) await importData(file);
              }}
            />
          </label>
        </div>
        <div>
          <span className="action-icon">
            <Download />
          </span>
          <div>
            <h3>Export journal</h3>
            <p>Download your current journal as CSV.</p>
          </div>
          <button className="secondary" onClick={exportData}>
            Export CSV
          </button>
        </div>
      </div>
      <div className="danger-zone">
        <div>
          <h3>Clear manual data</h3>
          <p>
            {manualCount
              ? `Remove ${manualCount} manual trades.`
              : "There is no manual data to clear."}
          </p>
        </div>
        <button
          className="danger-button"
          disabled={!manualCount}
          onClick={clearManual}
        >
          <Trash2 />
          Clear Manual Data
        </button>
      </div>
    </>
  );
}
function Appearance({ dark, toggleTheme }) {
  return (
    <>
      <SettingsHeader
        eyebrow="PROFILE & APPEARANCE"
        title="Choose your workspace theme"
        text="Account details now live on the dedicated Profile page."
      />
      <div className="appearance-row">
        <div>
          <h3>Theme</h3>
          <p>Switch between light and dark appearance.</p>
        </div>
        <div className="theme-picker">
          <button
            className={!dark ? "active" : ""}
            onClick={() => dark && toggleTheme()}
          >
            <Sun />
            Light
          </button>
          <button
            className={dark ? "active" : ""}
            onClick={() => !dark && toggleTheme()}
          >
            <Moon />
            Dark
          </button>
        </div>
      </div>
      <Link className="secondary profile-route-link" to="/profile">
        <UserRound />
        Open Profile
      </Link>
    </>
  );
}

function AccountFrame({ slug, children }) {
  const [t, text] = titles[slug];
  return (
    <>
      <div className="page-heading account-heading">
        <div>
          <div className="eyebrow">USER MANAGEMENT</div>
          <h1>{t}</h1>
          <p>{text}</p>
        </div>
      </div>
      {children}
    </>
  );
}
function ProfilePage({ notify }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
  });
  const submit = async (e) => {
    e.preventDefault();
    try {
      // Supabase confirms email changes by email.
      await updateProfile(form);
      if (form.email !== user.email) {
        notify(
          "Profile saved. Check your new email to confirm the email change.",
        );
      } else notify("Profile updated");
    } catch (err) {
      notify(err.message || "Could not update profile.");
    }
  };
  return (
    <Card className="account-card">
      <div className="account-card-title">
        <span className="avatar profile-avatar">
          {form.name
            ? form.name
                .split(" ")
                .map((x) => x[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "U"}
        </span>
        <div>
          <h2>Account details</h2>
          <p>Keep your identity information up to date.</p>
        </div>
      </div>
      <form onSubmit={submit}>
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>
        <button className="primary">Save changes</button>
      </form>
    </Card>
  );
}
function AddUserPage({ notify }) {
  const [form, setForm] = useState({ name: "", email: "", role: "Trader" });
  const submit = (e) => {
    e.preventDefault();
    notify(`${form.role} user created`);
    setForm({ name: "", email: "", role: "Trader" });
  };
  return (
    <Card className="account-card">
      <div className="account-card-title">
        <span className="action-icon">
          <UserPlus />
        </span>
        <div>
          <h2>New platform user</h2>
          <p>Assign the minimum access needed for this user.</p>
        </div>
      </div>
      <form onSubmit={submit}>
        <Field label="Name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="user@example.com"
          />
        </Field>
        <Field label="Role">
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option>Admin</option>
            <option>Trader</option>
            <option>Viewer</option>
          </select>
        </Field>
        <button className="primary">
          <UserPlus />
          Create User
        </button>
      </form>
    </Card>
  );
}
function ResetPasswordPage({ notify }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" }),
    [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (form.next.length < 8)
      return setError("New password must contain at least 8 characters.");
    if (form.next !== form.confirm)
      return setError("New passwords do not match.");
    try {
      await updatePassword(form);
      setError("");
      setForm({ current: "", next: "", confirm: "" });
      notify("Password updated");
    } catch (err) {
      setError(err.message || "Could not update password.");
    }
  };
  return (
    <Card className="account-card">
      <div className="account-card-title">
        <span className="action-icon">
          <KeyRound />
        </span>
        <div>
          <h2>Update password</h2>
          <p>Use at least eight characters and avoid reused passwords.</p>
        </div>
      </div>
      <form onSubmit={submit}>
        <Field label="Current Password">
          <input
            required
            type="password"
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
          />
        </Field>
        <Field label="New Password">
          <input
            required
            type="password"
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
          />
        </Field>
        <Field label="Confirm New Password">
          <input
            required
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </Field>
        {error && (
          <div className="validation-banner">
            <AlertCircle />
            {error}
          </div>
        )}
        <button className="primary">
          <KeyRound />
          Update Password
        </button>
      </form>
    </Card>
  );
}

function ManualTradeModal({ defaults, trade, close, save }) {
  const [form, setForm] = useState({
      market: "Spot",
      asset: "",
      direction: "Long",
      entry: "",
      exit: "",
      size: "",
      entryDate: "",
      exitDate: "",
      fees: "",
      funding: "",
      strategy: "Breakout",
      notes: "",
      leverage: "1",
      ...(trade
        ? {
            ...trade,
            entryDate: trade.date,
            funding: Number(trade.funding || 0) + Number(trade.gas || 0),
          }
        : {}),
    }),
    [showErrors, setShowErrors] = useState(false),
    [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v })),
    valid =
      Number(form.entry) > 0 &&
      Number(form.exit) > 0 &&
      Number(form.size) > 0 &&
      form.asset &&
      (form.market === "Spot" || Number(form.leverage) >= 1) &&
      form.entryDate &&
      form.exitDate &&
      new Date(form.exitDate) >= new Date(form.entryDate);
  const pnl = valid
    ? ((Number(form.exit) - Number(form.entry)) / Number(form.entry)) *
        Number(form.size) *
        (form.direction === "Short" ? -1 : 1) *
        Number(form.leverage) -
      Number(form.fees || 0) -
      Number(form.funding || 0)
    : null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    if (!valid || saving) return;
    setSaving(true);
    try {
      await save({
        date: form.entryDate,
        exitDate: form.exitDate,
        source: "Manual",
        asset: form.asset.toUpperCase(),
        market: form.market,
        direction: form.direction,
        leverage: Number(form.leverage),
        entry: Number(form.entry),
        exit: Number(form.exit),
        size: Number(form.size),
        strategy: form.strategy,
        exchange: "Manual entry",
        fees: Number(form.fees || 0),
        funding: 0,
        gas: Number(form.funding || 0),
        pnl,
        notes: form.notes,
      });
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    const h = (e) => e.key === "Escape" && close();
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, [close]);
  return (
    <div className="modal-backdrop" onClick={close}>
      <Card className="modal manual-modal" onClick={(e) => e.stopPropagation()}>
        <div className="manual-modal-header">
          <div>
            <span className="manual-label">
              <UserRound />
              MANUAL ENTRY
            </span>
            <h2>{trade ? "Edit Trade" : "Add Manual Trade"}</h2>
            <p>Record a real execution in your journal.</p>
          </div>
          <button type="button" className="modal-close" onClick={close}>
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field-section">
            <div className="segmented">
              <button
                type="button"
                className={form.market === "Spot" ? "active" : ""}
                onClick={() => {
                  set("market", "Spot");
                  set("leverage", "1");
                }}
              >
                Spot
              </button>
              <button
                type="button"
                className={form.market === "Perpetual" ? "active" : ""}
                onClick={() => set("market", "Perpetual")}
              >
                Futures / Perpetual
              </button>
            </div>
            <div className="form-grid">
              <Field label="Pair / Asset">
                <input
                  required
                  value={form.asset}
                  onChange={(e) => set("asset", e.target.value)}
                  placeholder="BTC/USDT"
                />
              </Field>
              <Field label="Direction">
                <select
                  value={form.direction}
                  onChange={(e) => set("direction", e.target.value)}
                >
                  <option>Long</option>
                  <option>Short</option>
                </select>
              </Field>
              {form.market === "Perpetual" && (
                <Field label="Leverage (x)">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={form.leverage}
                    onChange={(e) => set("leverage", e.target.value)}
                    placeholder="10"
                  />
                </Field>
              )}
            </div>
          </div>
          <div className="field-section">
            <div className="form-grid three">
              <Field label="Entry Price">
                <input
                  type="number"
                  step="0.00000001"
                  value={form.entry}
                  onChange={(e) => set("entry", e.target.value)}
                />
              </Field>
              <Field label="Exit Price">
                <input
                  type="number"
                  step="0.00000001"
                  value={form.exit}
                  onChange={(e) => set("exit", e.target.value)}
                />
              </Field>
              <Field label="Position Size ($)">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.size}
                  onChange={(e) => set("size", e.target.value)}
                  placeholder="800.00"
                />
              </Field>
              <Field label="Entry Date/Time">
                <input
                  type="datetime-local"
                  value={form.entryDate}
                  onChange={(e) => set("entryDate", e.target.value)}
                />
              </Field>
              <Field label="Exit Date/Time">
                <input
                  type="datetime-local"
                  value={form.exitDate}
                  onChange={(e) => set("exitDate", e.target.value)}
                />
              </Field>
              <Field label="Exchange Fees">
                <input
                  type="number"
                  step="0.00000001"
                  value={form.fees}
                  onChange={(e) => set("fees", e.target.value)}
                />
              </Field>
              <Field label="Funding / Gas">
                <input
                  type="number"
                  step="0.00000001"
                  value={form.funding}
                  onChange={(e) => set("funding", e.target.value)}
                />
              </Field>
              <Field label="Strategy">
                <select
                  value={form.strategy}
                  onChange={(e) => set("strategy", e.target.value)}
                >
                  {strategies.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows="2"
              />
            </Field>
          </div>
          {showErrors && !valid && (
            <div className="validation-banner">
              <AlertCircle />
              Complete all required fields. Exit time must be after entry time.
            </div>
          )}
          <div className="modal-footer">
            <div className="pnl-preview">
              <small>ESTIMATED NET PNL</small>
              <strong>
                {pnl == null
                  ? "Complete exit details"
                  : money(pnl, defaults.currency)}
              </strong>
            </div>
            <button type="button" className="secondary" onClick={close}>
              Cancel
            </button>
            <button
              type="submit"
              className="primary"
              disabled={!valid || saving}
            >
              {trade ? "Save Changes" : "Save Manual Trade"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label>
      <span>{label}</span>
      {children}
    </label>
  );
}
