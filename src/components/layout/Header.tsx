import { LogOut } from "lucide-react";
import { auth } from "@/lib/auth";
import { getBusiness } from "@/server/services/business.service";
import { logoutAction } from "@/app/(dashboard)/actions";
import { LogoMark } from "@/components/ui/Logo";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Sahip",
  MANAGER: "Yönetici",
  EMPLOYEE: "Çalışan",
};

export async function Header() {
  const session = await auth();
  const business = session ? await getBusiness(session.user.businessId) : null;

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <LogoMark size={30} />
          <div>
            <p className="text-sm font-semibold leading-tight text-[var(--color-ink)]">
              {business?.name ?? "SalonOS"}
            </p>
            {session && (
              <p className="text-xs leading-tight text-[var(--color-ink-muted)]">
                {session.user.name} · {ROLE_LABEL[session.user.role] ?? session.user.role}
              </p>
            )}
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-ink)]"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </form>
      </div>
    </header>
  );
}
