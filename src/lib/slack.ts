function requireBotToken(): string {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("Missing required env var: SLACK_BOT_TOKEN");
  return token;
}

async function lookupSlackUserByEmail(email: string, token: string): Promise<string> {
  const res = await fetch(`https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as { ok: boolean; error?: string; user?: { id: string } };
  if (!data.ok || !data.user) {
    throw new Error(`Slack: no user found for ${email} (${data.error ?? "unknown error"})`);
  }
  return data.user.id;
}

async function postJson<T>(method: string, body: Record<string, unknown>, token: string): Promise<T> {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok: boolean; error?: string } & T;
  if (!data.ok) {
    throw new Error(`Slack API ${method} failed: ${data.error ?? res.statusText}`);
  }
  return data;
}

export async function sendOtpToSlack(email: string, code: string): Promise<void> {
  const token = requireBotToken();

  const slackUserId = await lookupSlackUserByEmail(email, token);
  const opened = await postJson<{ channel: { id: string } }>(
    "conversations.open",
    { users: slackUserId },
    token,
  );
  await postJson("chat.postMessage", {
    channel: opened.channel.id,
    text: `Your Facescale sign-in code: ${code} (expires in 5 minutes)`,
  }, token);
}
