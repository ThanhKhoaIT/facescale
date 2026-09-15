import { auth, signIn, signOut } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      {session?.user ? (
        <>
          <p>
            Xin chào {session.user.email} ({session.user.role})
          </p>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="rounded bg-black px-4 py-2 text-white">
              Đăng xuất
            </button>
          </form>
        </>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button type="submit" className="rounded bg-black px-4 py-2 text-white">
            Đăng nhập với Google
          </button>
        </form>
      )}
    </main>
  );
}
