"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  className,
  pendingText,
  children,
}: {
  className?: string;
  pendingText?: string;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={`${className ?? ""} disabled:opacity-50`}>
      {pending ? (pendingText ?? "Saving…") : children}
    </button>
  );
}
