"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DEMO_ACCOUNTS,
  PARTNER_ACCOUNT_HINT,
  PARTNER_ACCOUNT_LABEL,
  type AccountType,
  saveSession,
  verifyCredentials,
} from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("partner");
  const [email, setEmail] = useState<string>(DEMO_ACCOUNTS.partner.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const chooseType = (type: AccountType) => {
    setAccountType(type);
    setEmail(DEMO_ACCOUNTS[type].email);
    setPassword("");
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter email and password.");
      return;
    }

    const user = verifyCredentials(accountType, email, password);
    if (!user) {
      setError("Invalid credentials for that account type.");
      return;
    }

    saveSession(user);
    router.push(accountType === "admin" ? "/admin" : "/partner");
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <fieldset>
        <legend className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Account type
        </legend>
        <div
          className="mt-3 grid grid-cols-2 gap-0 border border-line"
          role="group"
          aria-label="Admin or community account"
        >
          <button
            type="button"
            aria-pressed={accountType === "admin"}
            onClick={() => chooseType("admin")}
            className={`px-4 py-3 text-left transition ${
              accountType === "admin"
                ? "bg-ink text-paper"
                : "bg-paper text-ink-soft hover:text-ink"
            }`}
          >
            <span className="block font-display text-base font-bold tracking-tight">Admin</span>
            <span
              className={`mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] ${
                accountType === "admin" ? "text-paper/65" : "text-ink-soft"
              }`}
            >
              Staff access
            </span>
          </button>
          <button
            type="button"
            aria-pressed={accountType === "partner"}
            onClick={() => chooseType("partner")}
            className={`border-l border-line px-4 py-3 text-left transition ${
              accountType === "partner"
                ? "bg-ink text-paper"
                : "bg-paper text-ink-soft hover:text-ink"
            }`}
          >
            <span className="block font-display text-base font-bold tracking-tight">
              {PARTNER_ACCOUNT_LABEL}
            </span>
            <span
              className={`mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] ${
                accountType === "partner" ? "text-paper/65" : "text-ink-soft"
              }`}
            >
              {PARTNER_ACCOUNT_HINT}
            </span>
          </button>
        </div>
      </fieldset>

      {accountType === "partner" && (
        <p className="text-sm leading-relaxed text-ink-soft">
          Open to students, teachers, visitors, rangers, and anyone who wants to use the app —
          report what you see and earn yearly points when staff verify your submissions.
        </p>
      )}

      <div className="border border-line bg-mist/50 px-4 py-3 text-sm text-ink-soft">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
          Demo credentials
        </p>
        <p className="mt-2">
          <span className="text-ink">Email:</span> {DEMO_ACCOUNTS[accountType].email}
        </p>
        <p>
          <span className="text-ink">Password:</span>{" "}
          {DEMO_ACCOUNTS[accountType].password}
        </p>
      </div>

      <label className="block space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Email
        </span>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
      </label>

      <label className="block space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft">
          Password
        </span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input-field"
        />
      </label>

      {error && <p className="text-sm text-signal">{error}</p>}

      <button
        type="submit"
        className="w-full bg-signal py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-signal-dark"
      >
        Sign in as {accountType === "admin" ? "admin" : PARTNER_ACCOUNT_LABEL.toLowerCase()}
      </button>
    </form>
  );
}
