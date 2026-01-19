"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LoaderView from "@/components/LoaderView";
import PageRevealOverlay from "@/components/PageRevealOverlay";

const EXIT_ANIMATION_MS = 1800;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);

  const handleLogout = () => {
    setShowLoader(true);
    router.prefetch("/login");

    // After loader displays, start exit animation and navigate
    setTimeout(() => {
      setIsLoaderExiting(true);
      setTimeout(() => {
        router.push("/login");
      }, EXIT_ANIMATION_MS);
    }, 3000); // Show loader for 3 seconds before exiting
  };

  // Show logout loader
  if (showLoader) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--sidebar)] ${
          isLoaderExiting ? "loader-exit" : ""
        }`}
      >
        <LoaderView
          className={
            isLoaderExiting ? "loader-content-exit" : "loader-content-enter"
          }
          text="let's take a deep breath while we log you out"
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-[color:var(--background)] text-[color:var(--foreground)]">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <AdminHeader
          onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto bg-[color:var(--background)] px-8 py-8">
          {children}
        </main>
      </div>
      <PageRevealOverlay />
    </div>
  );
}
