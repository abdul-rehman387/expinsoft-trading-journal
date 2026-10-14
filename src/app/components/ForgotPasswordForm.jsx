"use client";
import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "../actions/auth";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPassword, {});
  return (
    <div className="app auth-page dark">
      <main className="auth-card">
        <Link className="auth-brand" href="/login">ExpinSoft<span>TRADING JOURNAL</span></Link>
        <h1>Forgot password?</h1>
        <p className="auth-note">Enter your account email to receive a password reset link.</p>
        <form action={action}>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          {state.error && <p className="auth-error" role="alert">{state.error}</p>}
          {state.message && <p role="status">{state.message}</p>}
          <button className="primary auth-submit" disabled={pending}>{pending ? "Sending..." : "Send reset link"}</button>
        </form>
        <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
      </main>
    </div>
  );
}
