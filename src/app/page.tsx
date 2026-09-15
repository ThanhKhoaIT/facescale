import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listHeadscaleNodes, type HeadscaleNode } from "@/lib/headscale";
import { scopeDevicesForUser } from "@/lib/permissions";
import { getAuthMethod } from "@/lib/auth-config";
import { SubmitButton } from "@/components/SubmitButton";
import { AuthShell } from "@/components/AuthShell";
import { AUTH_INPUT, AUTH_BUTTON } from "@/lib/auth-ui";
import { passwordSignInAction, requestOtpAction, verifyOtpAction } from "./login-actions";

type HomeProps = {
  searchParams: Promise<{ error?: string; email?: string; step?: string; registered?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session = await auth();

  if (!session?.user) {
    const adminExists = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminExists === 0) redirect("/onboard");

    const { error, email, step, registered } = await searchParams;
    const authMethod = getAuthMethod();

    return (
      <AuthShell>
        <h1 className="mb-6 text-xl font-semibold text-ink">Sign in to Facescale</h1>

        {registered && <p className="mb-4 text-sm text-green-700 dark:text-green-400">Registration successful, sign in below.</p>}
        {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">Invalid credentials or the code has expired.</p>}

        {authMethod === "password" ? (
          <>
            <form action={passwordSignInAction} className="flex flex-col gap-3">
              <input name="email" type="email" required placeholder="email@lixibox.com" className={AUTH_INPUT} />
              <input name="password" type="password" required placeholder="Password" className={AUTH_INPUT} />
              <SubmitButton className={AUTH_BUTTON} pendingText="Signing in…">
                Sign in
              </SubmitButton>
            </form>
            <Link href="/register" className="mt-4 block text-center text-sm text-gray-500 underline dark:text-gray-400">
              Don&apos;t have an account? Register
            </Link>
          </>
        ) : step === "code" && email ? (
          <form action={verifyOtpAction} className="flex flex-col gap-3">
            <input type="hidden" name="email" value={email} />
            <p className="text-sm text-gray-500 dark:text-gray-400">Code sent via Slack to {email}</p>
            <input name="code" required placeholder="6-digit code" className={AUTH_INPUT} />
            <SubmitButton className={AUTH_BUTTON} pendingText="Confirming…">
              Confirm
            </SubmitButton>
          </form>
        ) : (
          <form action={requestOtpAction} className="flex flex-col gap-3">
            <input name="email" type="email" required placeholder="email@lixibox.com" className={AUTH_INPUT} />
            <SubmitButton className={AUTH_BUTTON} pendingText="Sending…">
              Send code via Slack
            </SubmitButton>
          </form>
        )}
      </AuthShell>
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
    <main className="bg-paper-muted p-4 sm:p-8">
      <h1 className="mb-6 text-xl font-semibold text-ink">Dashboard</h1>
      {headscaleError && <p className="mb-4 text-red-600">Could not connect to Headscale: {headscaleError}</p>}
      <div className="flex flex-wrap gap-4">
        <div className="rounded-lg border border-paper-line bg-paper p-4">
          <p className="text-sm text-gray-500">Members</p>
          <p className="text-2xl font-semibold text-ink">{memberCount}</p>
        </div>
        <div className="rounded-lg border border-paper-line bg-paper p-4">
          <p className="text-sm text-gray-500">Devices</p>
          <p className="text-2xl font-semibold text-ink">{scopedDevices.length}</p>
        </div>
        <div className="rounded-lg border border-paper-line bg-paper p-4">
          <p className="text-sm text-gray-500">Online</p>
          <p className="text-2xl font-semibold text-green-600">
            {onlineCount}/{scopedDevices.length} ({onlinePct}%)
          </p>
        </div>
      </div>
    </main>
  );
}
