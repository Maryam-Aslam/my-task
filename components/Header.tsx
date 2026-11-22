"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, Phone, X } from "lucide-react";
import Logo from "./Logo";

const NAV = [
  { href: "/engines/", label: "Engines" },
  { href: "/models/", label: "Models" },
  { href: "/engine-inspection/", label: "Engine problems" },
  { href: "/engine-warranty/", label: "Warranty" },
  { href: "/contact-us/", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const normalize = (p: string) => (p === "/" ? "/" : p.replace(/\/+$/, ""));
  const currentPath = normalize(pathname || "/");

  // Close mobile menu when navigating to a new route
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll, handle Escape key, and close drawer on desktop resize
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      id="site-header"
      className="fixed inset-x-0 top-0 z-50 transition-transform duration-500 will-change-transform"
    >
      {/* Scroll-triggered backdrop (solid when mobile menu is open) */}
      <div
        id="header-bg"
        className={`absolute inset-0 border-b border-forest/10 bg-white/85 backdrop-blur-xl transition-opacity duration-300 ${
          open ? "!opacity-100" : "opacity-0"
        }`}
      />

      <div className="wrap relative flex h-[68px] items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="JLR Specialist home"
          onClick={() => setOpen(false)}
          className="shrink-0"
        >
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-7 xl:gap-9 lg:flex">
          {NAV.map((n) => {
            const isActive = currentPath === normalize(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive ? "page" : undefined}
                className={`nav-link relative py-1 text-[.92rem] font-semibold transition-colors ${
                  isActive
                    ? "text-emerald"
                    : "text-forest hover:text-emerald"
                }`}
              >
                {n.label}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-emerald"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions: Phone CTA + Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="tel:02034884649"
            className="btn btn--primary btn--sm shrink-0"
            data-magnetic
          >
            <Phone size={16} aria-hidden />
            <span className="hidden sm:inline">0203 488 4649</span>
            <span className="sm:hidden">Call</span>
          </a>

          <button
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-forest/20 text-forest transition-colors hover:border-emerald hover:text-emerald lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Full-Height Mobile Drawer */}
      <div
        id="mobile-nav"
        aria-hidden={!open}
        className={`fixed inset-x-0 top-[68px] z-40 flex h-[calc(100dvh-68px)] flex-col justify-between overflow-y-auto bg-forest px-[var(--gutter,1.25rem)] pb-10 pt-6 transition-all duration-300 lg:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {NAV.map((n, i) => {
            const isActive = currentPath === normalize(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className={`group flex items-center justify-between border-b border-white/15 py-4 sm:py-5 font-display text-2xl sm:text-3xl font-semibold transition-colors ${
                  isActive ? "text-emerald-light" : "text-white hover:text-emerald-light"
                }`}
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-xs sm:text-sm font-bold text-emerald-light">
                    0{i + 1}
                  </span>
                  {n.label}
                </span>
                <ArrowUpRight
                  size={20}
                  className="text-white/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-light"
                />
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/get-a-quote/"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            className="btn btn--primary w-full justify-center"
          >
            Request Your Free Engine Quote
          </Link>
          <a
            href="tel:02034884649"
            tabIndex={open ? 0 : -1}
            className="flex items-center justify-center gap-2 rounded-full border border-white/20 py-3.5 text-sm font-semibold text-white transition hover:border-emerald-light hover:text-emerald-light"
          >
            <Phone size={16} />
            Call 0203 488 4649
          </a>
        </div>
      </div>
    </header>
  );
}