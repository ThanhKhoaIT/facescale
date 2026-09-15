import { AuthShell } from "@/components/AuthShell";

type PendingPageProps = {
  searchParams: Promise<{ email?: string; status?: string }>;
};

export default async function PendingPage({ searchParams }: PendingPageProps) {
  const { email, status } = await searchParams;

  const message =
    status === "REJECTED"
      ? "Your access request has been rejected."
      : "Your access request is pending Admin approval.";

  return (
    <AuthShell>
      <div className="text-center">
        <h1 className="text-xl font-semibold text-ink">{message}</h1>
        {email && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{email}</p>}
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Contact an Admin if you need access urgently.
        </p>
      </div>
    </AuthShell>
  );
}
