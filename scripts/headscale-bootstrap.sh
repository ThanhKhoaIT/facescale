#!/usr/bin/env bash
# Bootstraps the local Headscale sandbox: creates a user, an API key (for the
# Next.js app) and a reusable preauth key (for the sample tailscale nodes).
# Requires: docker compose, jq.
#
# Usage:
#   docker compose up -d headscale
#   ./scripts/headscale-bootstrap.sh
#   export TS_PREAUTHKEY=<preauth key printed below>
#   docker compose up -d tailscale-node1 tailscale-node2
set -euo pipefail

USER_NAME="${1:-sandbox}"

echo "Waiting for headscale to be ready..."
until docker compose exec -T headscale headscale users list >/dev/null 2>&1; do
  sleep 1
done

if ! docker compose exec -T headscale headscale users list --output json | jq -e --arg n "$USER_NAME" 'any(.[]; .name == $n)' >/dev/null; then
  docker compose exec -T headscale headscale users create "$USER_NAME"
fi

USER_ID=$(docker compose exec -T headscale headscale users list --output json | jq -r --arg n "$USER_NAME" '.[] | select(.name == $n) | .id')

echo
echo "=== HEADSCALE_API_KEY (paste into .env) ==="
docker compose exec -T headscale headscale apikeys create --expiration 90d

echo
echo "=== TS_PREAUTHKEY (export before starting the tailscale node containers) ==="
docker compose exec -T headscale headscale preauthkeys create --user "$USER_ID" --reusable --expiration 24h

cat <<'EOF'

Next steps:
  export TS_PREAUTHKEY=<preauth key printed above>
  docker compose up -d tailscale-node1 tailscale-node2
  docker compose exec headscale headscale nodes list
EOF
