import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpToSlack } from "@/lib/slack";

const OTP_TTL_MS = 5 * 60 * 1000;

export async function issueOtp(email: string): Promise<void> {
  const code = randomInt(100000, 1000000).toString();

  await prisma.loginOtp.deleteMany({ where: { email, consumedAt: null } });
  await prisma.loginOtp.create({
    data: { email, code, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });

  await sendOtpToSlack(email, code);
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const otp = await prisma.loginOtp.findFirst({
    where: { email, code, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return false;

  await prisma.loginOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  return true;
}
