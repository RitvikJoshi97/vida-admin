"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Suggestions", href: "/admin/suggestions" },
  { label: "Settings", href: "/admin/settings" },
];

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[88vw] max-w-[360px] flex-col gap-8 bg-[color:var(--sidebar)] px-6 py-8 text-white shadow-xl transition-transform duration-200 ease-out md:static md:z-auto md:w-64 md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
          Team
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[color:var(--accent)] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isActive ? "bg-white" : "bg-white/40"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <p className="text-lg font-semibold uppercase tracking-[0.2em] text-white/80">
            VIDA Admin
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              by
            </span>
            <div className="w-1/2">
              <Image
                src="/ritvikDesignLogo.svg"
                alt="VIDA"
                width={240}
                height={240}
                className="h-auto w-full"
                sizes="(min-width: 768px) 8rem, 40vw"
                priority
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
