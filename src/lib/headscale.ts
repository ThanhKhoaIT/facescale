export type HeadscaleNode = {
  id: string;
  name: string;
  givenName: string;
  user: string;
  ipAddresses: string[];
  online: boolean;
  lastSeen: string | null;
};

type RawHeadscaleNode = {
  id: string;
  name: string;
  givenName: string;
  user?: { name?: string };
  ipAddresses: string[];
  online: boolean;
  lastSeen: string | null;
};

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export async function listHeadscaleNodes(): Promise<HeadscaleNode[]> {
  const baseUrl = requireEnv("HEADSCALE_URL");
  const apiKey = requireEnv("HEADSCALE_API_KEY");

  const res = await fetch(`${baseUrl}/api/v1/node`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Headscale API error ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { nodes: RawHeadscaleNode[] };

  return data.nodes.map((node) => ({
    id: node.id,
    name: node.name,
    givenName: node.givenName,
    user: node.user?.name ?? "",
    ipAddresses: node.ipAddresses,
    online: node.online,
    lastSeen: node.lastSeen,
  }));
}
