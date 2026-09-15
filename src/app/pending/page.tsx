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
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">{message}</h1>
        {email && <p className="mt-2 text-sm text-gray-500">{email}</p>}
        <p className="mt-4 text-sm text-gray-500">
          Contact an Admin if you need access urgently.
        </p>
      </div>
    </main>
  );
}
