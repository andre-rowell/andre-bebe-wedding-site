"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type AdminActionFormProps = {
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  successMessage?: string;
};

export function AdminActionForm({ action, children, className, resetOnSuccess = false, successMessage = "Saved." }: AdminActionFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <form
      ref={formRef}
      className={className}
      action={async (formData) => {
        setPending(true);
        setMessage("");
        try {
          await action(formData);
          if (resetOnSuccess) formRef.current?.reset();
          setMessage(successMessage);
          router.refresh();
        } finally {
          setPending(false);
        }
      }}
    >
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
      {message ? <p className="text-sm font-semibold text-[#3f7040]">{message}</p> : null}
    </form>
  );
}
