const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  LEADER: "Leader",
  MEMBER: "Member",
};

const ROLE_CLASS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  LEADER: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  MEMBER: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_CLASS[role] ?? ROLE_CLASS.MEMBER}`}>
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[status] ?? STATUS_CLASS.PENDING}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
