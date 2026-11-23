export type AccountType = "admin" | "partner";

export type AuthUser = {
  email: string;
  role: AccountType;
  name: string;
};

export const DEMO_ACCOUNTS = {
  admin: {
    email: "admin@palawanwildlife.ph",
    password: "admin123",
    name: "Field Admin",
    role: "admin" as const,
  },
  partner: {
    email: "partner@palawanwildlife.ph",
    password: "partner123",
    name: "Community Member",
    role: "partner" as const,
  },
} as const;

/** User-facing label for the open partner / community account. */
export const PARTNER_ACCOUNT_LABEL = "Community";
export const PARTNER_ACCOUNT_HINT = "Students · visitors · anyone";

export const AUTH_STORAGE_KEY = "pw_auth_user";

export function verifyCredentials(
  role: AccountType,
  email: string,
  password: string
): AuthUser | null {
  const account = DEMO_ACCOUNTS[role];
  if (
    email.trim().toLowerCase() === account.email &&
    password === account.password
  ) {
    return { email: account.email, role: account.role, name: account.name };
  }
  return null;
}

export function saveSession(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("pw-auth-change"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("pw-auth-change"));
}

export function readSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    // Refresh demo display names if credentials still match a known account
    const demo = Object.values(DEMO_ACCOUNTS).find(
      (a) => a.email === user.email && a.role === user.role
    );
    if (demo && user.name !== demo.name) {
      const next = { email: demo.email, role: demo.role, name: demo.name };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      return next;
    }
    return user;
  } catch {
    return null;
  }
}
