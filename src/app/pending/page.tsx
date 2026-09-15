type PendingPageProps = {
  searchParams: Promise<{ email?: string; status?: string }>;
};

export default async function PendingPage({ searchParams }: PendingPageProps) {
  const { email, status } = await searchParams;

  const message =
    status === "REJECTED"
      ? "Yêu cầu truy cập của bạn đã bị từ chối."
      : "Yêu cầu truy cập của bạn đang chờ Admin duyệt.";

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">{message}</h1>
        {email && <p className="mt-2 text-sm text-gray-500">{email}</p>}
        <p className="mt-4 text-sm text-gray-500">
          Liên hệ Admin nếu bạn cần truy cập gấp.
        </p>
      </div>
    </main>
  );
}
