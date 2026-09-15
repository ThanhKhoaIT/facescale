export type AuthMethod = "password" | "slack_otp";

export function getAuthMethod(): AuthMethod {
  return process.env.AUTH_METHOD === "slack_otp" ? "slack_otp" : "password";
}
