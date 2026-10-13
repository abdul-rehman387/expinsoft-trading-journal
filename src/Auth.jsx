import React, { createContext, useContext, useEffect, useState } from "react";
import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import { readStored } from "./storage";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
const savedSession = () => {
  const user = readStored("expinsoft_user", null);
  return user?.email && user?.name ? user : null;
};

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return Array.from(new Uint8Array(bits), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(savedSession);
  useEffect(() => {
    const sync = (e) => {
      if (e.key === "expinsoft_user" || e.key === null) setUser(savedSession());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const startSession = (account) => {
    const session = { name: account.name, email: account.email };
    localStorage.setItem("expinsoft_user", JSON.stringify(session));
    setUser(session);
  };
  const signup = async ({ name, email, password }) => {
    if (readStored("expinsoft_account", null))
      throw new Error(
        "An account already exists on this device. Please sign in.",
      );
    const salt = crypto.randomUUID();
    const account = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      salt,
      passwordHash: await passwordHash(password, salt),
    };
    localStorage.setItem("expinsoft_account", JSON.stringify(account));
    startSession(account);
  };
  const login = async ({ email, password }) => {
    const account = readStored("expinsoft_account", null);
    if (
      !account ||
      account.email !== email.trim().toLowerCase() ||
      account.passwordHash !== (await passwordHash(password, account.salt))
    )
      throw new Error("Email or password is incorrect.");
    startSession(account);
  };
  const logout = () => {
    localStorage.removeItem("expinsoft_user");
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function AuthPage({ signup = false }) {
  const auth = useAuth(),
    navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (auth.user) return <Navigate to="/" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (signup && !form.name.trim())
        throw new Error("Please enter your name.");
      await (signup ? auth.signup(form) : auth.login(form));
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message ||
          "Unable to save your session. Check browser storage permissions.",
      );
    } finally {
      setBusy(false);
    }
  };
  const field = (name, label, type, autocomplete) => (
    <label>
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autocomplete}
        required
        minLength={name === "password" && signup ? 8 : undefined}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
    </label>
  );
  return (
    <div
      className={`app auth-page ${localStorage.getItem("theme") === "light" ? "light" : "dark"}`}
    >
      <main className="auth-card">
        <Link className="auth-brand" to="/">
          ExpinSoft<span>TRADING JOURNAL</span>
        </Link>
        <h1>{signup ? "Create your account" : "Welcome back"}</h1>
        <p>
          {signup
            ? "Start building your trading journal."
            : "Sign in to continue to your journal."}
        </p>
        <form onSubmit={submit}>
          {signup && field("name", "Name", "text", "name")}
          {field("email", "Email", "email", "email")}
          {field(
            "password",
            "Password",
            "password",
            signup ? "new-password" : "current-password",
          )}
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary auth-submit" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create Account" : "Sign In"}
          </button>
        </form>
        <p className="auth-switch">
          {signup ? "Already have an account?" : "New to ExpinSoft?"}{" "}
          <Link to={signup ? "/login" : "/signup"}>
            {signup ? "Sign In" : "Create Account"}
          </Link>
        </p>
        <p className="auth-note">
          Your account and journal are stored on this browser and device.
        </p>
      </main>
    </div>
  );
}

export function Login() {
  return <AuthPage />;
}
export function Signup() {
  return <AuthPage signup />;
}
