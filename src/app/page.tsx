import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listHeadscaleNodes, type HeadscaleNode } from "@/lib/headscale";
import { scopeDevicesForUser } from "@/lib/permissions";
import { getAuthMethod } from "@/lib/auth-config";
import { passwordSignInAction, requestOtpAction, verifyOtpAction } from "./login-actions";

type HomeProps = {
  searchParams: Promise<{ error?: string; email?: string; step?: string; registered?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session = await auth();

  if (!session?.user) {
    const { error, email, step, registered } = await searchParams;
    const authMethod = getAuthMethod();

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        {registered && <p className="text-green-700">Registration successful, sign in below.</p>}
        {error && <p className="text-red-600">Invalid credentials or the code has expired.</p>}

        {authMethod === "password" ? (
          <>
            <form action={passwordSignInAction} className="flex w-full max-w-xs flex-col gap-2">
              <input name="email" type="email" required placeholder="email@lixibox.com" className="rounded border px-3 py-2" />
              <input name="password" type="password" required placeholder="Password" className="rounded border px-3 py-2" />
              <button type="submit" className="rounded bg-black px-4 py-2 text-white">
                Sign in
              </button>
            </form>
            <Link href="/register" className="text-sm text-gray-500 underline">
              Don&apos;t have an account? Register
            </Link>
          </>
        ) : step === "code" && email ? (
          <form action={verifyOtpAction} className="flex w-full max-w-xs flex-col gap-2">
            <input type="hidden" name="email" value={email} />
            <p className="text-sm text-gray-500">Code sent via Slack to {email}</p>
            <input name="code" required placeholder="6-digit code" className="rounded border px-3 py-2" />
            <button type="submit" className="rounded bg-black px-4 py-2 text-white">
              Confirm
            </button>
          </form>
        ) : (
          <form action={requestOtpAction} className="flex w-full max-w-xs flex-col gap-2">
            <input name="email" type="email" required placeholder="email@lixibox.com" className="rounded border px-3 py-2" />
            <button type="submit" className="rounded bg-black px-4 py-2 text-white">
              Send code via Slack
            </button>
          </form>
        )}
      </main>
    );
  }

  const user = session.user;

  let headscaleNodes: HeadscaleNode[] = [];
  let headscaleError: string | null = null;
  try {
    headscaleNodes = await listHeadscaleNodes();
  } catch (err) {
    headscaleError = err instanceof Error ? err.message : "Failed to reach Headscale";
  }

  const [memberCount, deviceMetas] = await Promise.all([
    prisma.user.count(),
    prisma.deviceMeta.findMany(),
  ]);

  const metaByNodeId = new Map(deviceMetas.map((m) => [m.headscaleNodeId, m]));
  const devices = headscaleNodes.map((node) => {
    const meta = metaByNodeId.get(node.id);
    return {
      ...node,
      departmentId: meta?.departmentId ?? null,
      assignedUserId: meta?.assignedUserId ?? null,
    };
  });
  const scopedDevices = scopeDevicesForUser(user, devices);
  const onlineCount = scopedDevices.filter((d) => d.online).length;
  const onlinePct = scopedDevices.length > 0 ? Math.round((onlineCount / scopedDevices.length) * 100) : 0;

  return (
    <main className="p-8">
      <h1 className="mb-6 text-xl font-semibold">Dashboard</h1>
      {headscaleError && <p className="mb-4 text-red-600">Could not connect to Headscale: {headscaleError}</p>}
      <div className="flex flex-wrap gap-4">
        <div className="rounded border border-black/[.08] p-4 dark:border-white/[.145]">
          <p className="text-sm text-gray-500">Members</p>
          <p className="text-2xl font-semibold">{memberCount}</p>
        </div>
        <div className="rounded border border-black/[.08] p-4 dark:border-white/[.145]">
          <p className="text-sm text-gray-500">Devices</p>
          <p className="text-2xl font-semibold">{scopedDevices.length}</p>
        </div>
        <div className="rounded border border-black/[.08] p-4 dark:border-white/[.145]">
          <p className="text-sm text-gray-500">Online</p>
          <p className="text-2xl font-semibold">
            {onlineCount}/{scopedDevices.length} ({onlinePct}%)
          </p>
        </div>
      </div>
    </main>
  );
}
