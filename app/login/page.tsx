import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in as staff admin or as a community member — students, visitors, and anyone using Palawan Wildlife.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">Account</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">Login</h1>
      <p className="mt-3 text-ink-soft">
        Staff use Admin. Everyone else — students, visitors, teachers, volunteers — uses the
        Community account to report sightings and collect yearly points.
      </p>
      <div className="mt-10 border-t border-line pt-8">
        <LoginForm />
      </div>
      <p className="mt-8 text-center text-sm text-ink-soft">
        Back to{" "}
        <Link href="/" className="text-ink underline-offset-2 hover:underline">
          home
        </Link>
      </p>
    </div>
  );
}
