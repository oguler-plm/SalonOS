import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  // Belt and suspenders — middleware already blocks this, but a layout that
  // silently renders for a signed-out user is the kind of bug that's easy to
  // miss until it leaks tenant-shaped UI.
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-4 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
