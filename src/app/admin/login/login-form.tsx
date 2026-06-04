"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "@/lib/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="card w-full max-w-md space-y-4 p-6">
      <div>
        <p className="serif text-4xl font-bold">Admin login</p>
        <p className="mt-2 text-sm leading-6 text-[#6a5c55]">Use the local development owner account from the README.</p>
      </div>
      {state?.error ? <p className="rounded-md bg-[#fff1ec] p-3 text-sm font-semibold text-[#8f403d]">{state.error}</p> : null}
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" defaultValue="andrerowell@outlook.com" required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>
        <LogIn size={18} />
        {pending ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-xs leading-5 text-[#6a5c55]">Password reset is intentionally left as a production integration point for email provider setup.</p>
    </form>
  );
}
