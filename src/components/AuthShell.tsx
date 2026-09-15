import Image from "next/image";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ink p-4 sm:p-8"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <Image src="/facescale.png" alt="Facescale" width={48} height={48} className="mb-4" />
      <div className="w-full max-w-sm rounded-2xl bg-paper p-6 shadow-xl shadow-black/30 sm:p-8">{children}</div>
    </main>
  );
}
