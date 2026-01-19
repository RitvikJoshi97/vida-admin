"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import RiveCharacter from "@/components/RiveCharacter";

type AdminHeaderProps = {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  onLogout: () => void;
};

export default function AdminHeader({
  onMenuToggle,
  isSidebarOpen,
  onLogout,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const nextLabel = useMemo(() => {
    if (!pathname) return "Admin";
    if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
    if (pathname.startsWith("/admin/suggestions")) return "Suggestions";
    if (pathname.startsWith("/admin/settings")) return "Settings";
    if (pathname.startsWith("/admin")) return "Admin";
    return "Admin";
  }, [pathname]);
  const [label, setLabel] = useState(nextLabel);
  const [isExiting, setIsExiting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (label === nextLabel) return;
    setIsExiting(true);
    const timeout = window.setTimeout(() => {
      setLabel(nextLabel);
      setIsExiting(false);
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [label, nextLabel]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--panel)] px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] text-[color:var(--foreground)] transition hover:bg-black/5 md:hidden"
          aria-label="Toggle sidebar"
          aria-expanded={isSidebarOpen}
        >
          <span className="flex flex-col gap-1">
            <span className="h-0.5 w-4 rounded-full bg-[color:var(--foreground)]" />
            <span className="h-0.5 w-4 rounded-full bg-[color:var(--foreground)]" />
            <span className="h-0.5 w-4 rounded-full bg-[color:var(--foreground)]" />
          </span>
        </button>
        <div className="relative h-8 overflow-hidden">
          <span
            className={`inline-block text-2xl font-semibold leading-8 tracking-[0.12em] text-[color:var(--foreground)] ${
              isExiting ? "header-title-exit" : "header-title-enter"
            }`}
          >
            {label}
          </span>
        </div>
      </div>
      <div className="relative flex h-full items-center" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex h-full w-16 items-center justify-center rounded-full transition hover:bg-black/5"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
        >
          <RiveCharacter state="chilling_page" className="h-full w-full" />
        </button>
        {isMenuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-10 mt-2 min-w-[160px] rounded-2xl border border-[color:var(--border)] bg-white p-2 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className="w-full rounded-xl px-4 py-2 text-left text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-black/5"
              onClick={() => {
                setIsMenuOpen(false);
                onLogout();
              }}
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
