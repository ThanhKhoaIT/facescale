import { prisma } from "@/lib/prisma";

export type SignInDecision = { allow: true } | { allow: false; redirectTo: string };

function getAllowedDomains(): string[] {
  return (process.env.ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

export async function resolveSignInAccess(
  rawEmail: string,
  profile: { name?: string | null; image?: string | null },
): Promise<SignInDecision> {
  const email = rawEmail.toLowerCase();
  const domain = email.split("@")[1];

  if (getAllowedDomains().includes(domain)) {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: profile.name, image: profile.image },
    });
    return { allow: true };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { allow: true };
  }

  const accessRequest = await prisma.accessRequest.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  if (accessRequest.status === "APPROVED") {
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: profile.name, image: profile.image },
    });
    return { allow: true };
  }

  return {
    allow: false,
    redirectTo: `/pending?email=${encodeURIComponent(email)}&status=${accessRequest.status}`,
  };
}
