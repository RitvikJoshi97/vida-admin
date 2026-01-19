"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fit } from "@rive-app/react-canvas";
import RiveCharacter from "@/components/RiveCharacter";
import LoaderView from "@/components/LoaderView";
import PageRevealOverlay from "@/components/PageRevealOverlay";

const EXIT_ANIMATION_MS = 1800;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);

  const leftPanelClass =
    "relative flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-[color:var(--sidebar)] px-8 py-12 text-white transition-all duration-700 ease-out md:min-h-0 md:basis-1/2 md:px-12";
  const rightPanelClass =
    "relative hidden w-full flex-col items-center justify-center bg-[color:var(--panel)] px-8 py-12 transition-all duration-700 ease-out md:flex md:basis-1/2 md:max-h-none md:px-16";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (email.trim() === "admin" && password === "password") {
      setError("");
      setIsSubmitting(true);
      setShowLoader(true);
      router.prefetch("/admin/dashboard");

      // After loader displays, start exit animation and navigate
      setTimeout(() => {
        setIsLoaderExiting(true);
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, EXIT_ANIMATION_MS);
      }, 3000); // Show loader for 3 seconds before exiting

      return;
    }

    setError("Please use the admin credentials to continue.");
  };

  const renderLoginForm = (
    variant: "light" | "dark",
    formClassName?: string,
  ) => {
    const isDark = variant === "dark";
    const labelClass = isDark ? "text-white" : "text-[color:var(--foreground)]";
    const inputClass = isDark
      ? "border-white/30 bg-white/10 text-white placeholder-white/60 focus:border-white"
      : "border-[color:var(--border)] bg-[color:var(--panel)] text-[color:var(--foreground)] focus:border-[color:var(--accent)]";
    const errorClass = isDark
      ? "bg-white/10 text-white"
      : "bg-[color:var(--panel-lavender)] text-[color:var(--magenta)]";
    const buttonClass = isDark
      ? "bg-white text-[color:var(--sidebar)] hover:bg-white/90"
      : "bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-soft)]";

    return (
      <form
        className={`space-y-4 ${formClassName ?? ""}`}
        onSubmit={handleSubmit}
      >
        <label className={`block text-left text-sm font-medium ${labelClass}`}>
          Email
          <input
            type="text"
            name="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin"
            className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputClass}`}
          />
        </label>

        <label className={`block text-left text-sm font-medium ${labelClass}`}>
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
            className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${inputClass}`}
          />
        </label>

        {error ? (
          <p className={`rounded-2xl px-4 py-3 text-sm ${errorClass}`}>
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          aria-disabled={isSubmitting}
          className={`w-full rounded-full px-5 py-2.5 text-sm font-semibold transition ${buttonClass}`}
        >
          Login
        </button>
      </form>
    );
  };

  // Show loader when submitting
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
          text="let's take a deep breath while we log you in"
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row bg-[color:var(--sidebar)]">
      <section className={leftPanelClass}>
        <div className="absolute left-8 top-8 md:left-12">
          <Image
            src="/ritvikDesignLogo.svg"
            alt="VIDA"
            width={20}
            height={20}
            className="h-24 w-24"
            priority
          />
        </div>
        <div className="absolute right-6 top-8 text-right md:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white">
            VIDA admin portal
          </p>
        </div>
        <>
          <div className="hidden h-full w-full flex-col items-center justify-center gap-6 text-center md:flex">
            <div className="relative aspect-square w-[70vw] max-w-[360px] overflow-hidden md:w-[360px] lg:w-[400px]">
              <RiveCharacter
                state="hello_page"
                fit={Fit.Cover}
                className="h-full w-full"
              />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-white">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-white/70">
                Use your admin credentials to access VIDA suggestions.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-6 text-center md:hidden">
            <div className="relative aspect-square w-[52vw] max-w-[220px] overflow-hidden">
              <RiveCharacter
                state="hello_page"
                fit={Fit.Cover}
                className="h-full w-full"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-white/70">Log in to continue.</p>
            </div>
            <div className="w-full max-w-sm">{renderLoginForm("dark")}</div>
          </div>
        </>
      </section>

      <section className={rightPanelClass}>
        <div className="absolute right-6 top-8 hidden text-right md:block md:right-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--sidebar)]">
            VIDA admin portal
          </p>
        </div>

        <div className="w-full max-w-sm">
          {renderLoginForm("light", "mt-8")}
        </div>
      </section>
      <PageRevealOverlay />
    </div>
  );
}
