"use client";
import { useActionState } from "react";
import { recoverPassword } from "../actions/auth";

export default function RecoveryForm() {
  const [state, action, pending] = useActionState(recoverPassword, {});
  return (
    <div className="app auth-page dark">
      <main className="auth-card">
        <h1>Set a new password</h1>
        <form action={action}>
          <label>New password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
          <label>Confirm password<input name="confirm" type="password" autoComplete="new-password" minLength={8} required /></label>
          {state.error && <p className="auth-error" role="alert">{state.error}</p>}
          <button className="primary auth-submit" disabled={pending}>{pending ? "Saving..." : "Save password"}</button>
        </form>
      </main>
    </div>
  );
}
