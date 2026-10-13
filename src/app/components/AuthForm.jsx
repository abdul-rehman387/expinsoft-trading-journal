"use client";
import { useActionState } from "react";
import Link from "next/link";
import { login, signup } from "../actions/auth";
export default function AuthForm({ register = false }) {
  const [state, action, pending] = useActionState(
    register ? signup : login,
    {},
  );
  return (
    <div className="app auth-page dark">
      <main className="auth-card">
        <Link className="auth-brand" href="/dashboard">
          ExpinSoft<span>TRADING JOURNAL</span>
        </Link>
        <h1>{register ? "Create your account" : "Welcome back"}</h1>
        <form action={action}>
          {register && (
            <label>
              Name
              <input name="name" required autoComplete="name" />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={register ? 8 : undefined}
              autoComplete={register ? "new-password" : "current-password"}
            />
          </label>
          {state.error && (
            <p className="auth-error" role="alert">
              {state.error}
            </p>
          )}
          {state.message && <p role="status">{state.message}</p>}
          <button className="primary auth-submit" disabled={pending}>
            {pending
              ? "Please wait..."
              : register
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>
        <p className="auth-switch">
          <Link href={register ? "/login" : "/signup"}>
            {register ? "Sign In" : "Create Account"}
          </Link>
        </p>
      </main>
    </div>
  );
}
