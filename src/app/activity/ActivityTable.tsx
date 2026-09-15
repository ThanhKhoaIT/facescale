"use client";

import { useMemo, useState } from "react";

type LogEntry = {
  id: string;
  createdAt: string;
  actorEmail: string | null;
  action: string;
  target: string | null;
};

const PAGE_SIZE = 25;
const FIELD = "rounded border border-paper-line px-3 py-2 text-sm";

export function ActivityTable({ logs }: { logs: LogEntry[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) =>
      [log.actorEmail, log.action, log.target].some((field) => field?.toLowerCase().includes(q)),
    );
  }, [logs, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageLogs = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
        placeholder="Search by actor, action, or target…"
        className={`mb-4 w-full max-w-xs ${FIELD}`}
      />
      <div className="overflow-x-auto rounded-lg border border-paper-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-paper-line text-gray-500">
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Who</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {pageLogs.map((log) => (
              <tr key={log.id} className="border-b border-paper-line text-ink last:border-0 hover:bg-paper-muted">
                <td className="px-4 py-2">{log.createdAt}</td>
                <td className="px-4 py-2">{log.actorEmail ?? "—"}</td>
                <td className="px-4 py-2 font-mono text-xs">{log.action}</td>
                <td className="px-4 py-2">{log.target ?? "—"}</td>
              </tr>
            ))}
            {pageLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                  No activity matches &quot;{query}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded border border-paper-line px-2 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-gray-500">
            Page {currentPage + 1} of {pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="rounded border border-paper-line px-2 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
