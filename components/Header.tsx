"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, PhoneCall, X } from "lucide-react";
import Logo from "./Logo";

const NAV = [
  { href: "/", label: "Home" },
  {
    href: "/models/range-rover-sport/",
    label: "Engines",
    matchPrefixes: ["/engines", "/models/range-rover-sport"],
  },
  {
    href: "/engine-inspection/",
    label: "Services",
    matchPrefixes: ["/engine-inspection", "/engine-warranty"],
  },
  { href: "/models/", label: "About", matchPrefixes: ["/models"] },
  { href: "/contact-us/", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const normalize = (p: string) => (p === "/" ? "/" : p.replace(/\/+$/, ""));
  const currentPath = normalize(pathname || "/");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const checkActive = (item: (typeof NAV)[number]) => {
    if (currentPath === normalize(item.href)) return true;
    if (item.matchPrefixes) {
      return item.matchPrefixes.some((prefix) =>
        currentPath.startsWith(normalize(prefix))
      );
    }
    return false;
  };

  const darkBar = open || scrolled;

  return (
    <header
      id="site-header"
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    >
      {/* Top emerald accent line */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] bg-gradient-to-r from-[#08794D] via-[#18b777] to-[#08794D]"
      />

      {/* Frosted header backdrop */}
      <div
        id="header-bg"
        className={`absolute inset-0 transition-all duration-300 ${
          darkBar
            ? "border-b border-[#18b777]/20 bg-[#04160f]/95 text-white shadow-[0_14px_38px_-14px_rgba(3,17,11,0.75)] backdrop-blur-xl"
            : "border-b border-[#063C29]/12 bg-white/95 text-[#063C29] shadow-[0_6px_24px_-16px_rgba(6,60,41,0.22)] backdrop-blur-xl"
        }`}
      />

      <div className="wrap relative z-10 flex h-[64px] items-center justify-between gap-4 sm:h-[72px] lg:h-[76px]">
        {/* Brand mark + wordmark */}
        <Link
          href="/"
          aria-label="JLR Specialist home"
          onClick={() => setOpen(false)}
          className={`group inline-flex shrink-0 items-center transition-opacity hover:opacity-95 [&_span:nth-child(n+2)]:hidden sm:[&_span:nth-child(n+2)]:inline ${
            darkBar ? "text-white [&_a]:text-white" : "text-[#063C29] [&_a]:text-[#063C29]"
          }`}
        >
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-1.5 lg:flex xl:gap-2">
          {NAV.map((n) => {
            const isActive = checkActive(n);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[0.9rem] font-semibold tracking-tight transition-all duration-200 ${
                  isActive
                    ? darkBar
                      ? "bg-[#18b777]/20 text-[#3ee3a0] ring-1 ring-[#3ee3a0]/40"
                      : "bg-[#08794D]/12 text-[#08794D] ring-1 ring-[#08794D]/25"
                    : darkBar
                      ? "text-white/85 hover:bg-white/10 hover:text-white"
                      : "text-[#063C29]/85 hover:bg-[#063C29]/5 hover:text-[#063C29]"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Phone CTA + Mobile Menu Button */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <a
            href="tel:02034884649"
            aria-label="Call 0203 488 4649"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-br from-[#08794D] to-[#12a368] text-white shadow-[0_6px_18px_-4px_rgba(8,121,77,0.55)] transition-all duration-200 hover:brightness-110 sm:h-10 sm:w-auto sm:gap-2.5 sm:px-5 sm:text-xs sm:font-bold sm:tracking-wider sm:uppercase"
            data-magnetic
          >
            <PhoneCall size={14} className="shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
            <span className="hidden sm:inline">0203 488 4649</span>
          </a>

          <button
            type="button"
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-200 lg:hidden sm:h-10 sm:w-10 ${
              darkBar
                ? "border-white/25 bg-white/10 text-white hover:border-[#3ee3a0] hover:text-[#3ee3a0]"
                : "border-[#063C29]/20 bg-white text-[#063C29] hover:border-[#08794D] hover:text-[#08794D]"
            }`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X size={18} strokeWidth={2.25} className="text-current" />
            ) : (
              <Menu size={18} strokeWidth={2.25} className="text-current" />
            )}
          </button>
        </div>
      </div>

      {/* Full-Height Luxury Dark-Emerald Mobile Drawer */}
      <div
        id="mobile-nav"
        aria-hidden={!open}
        className={`fixed inset-x-0 top-[64px] z-40 flex h-[calc(100dvh-64px)] flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#04160f] via-[#041d14] to-[#020d09] px-[var(--gutter,1.25rem)] pb-10 pt-6 text-white transition-all duration-300 sm:top-[72px] sm:h-[calc(100dvh-72px)] lg:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {NAV.map((n, i) => {
            const isActive = checkActive(n);
            return (
              <Link
                key={n.href}
                href={n.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className={`group flex items-center justify-between border-b border-white/12 py-4 font-display text-2xl font-semibold transition-colors sm:py-5 sm:text-3xl ${
                  isActive ? "text-[#3ee3a0]" : "text-white hover:text-[#3ee3a0]"
                }`}
              >
                <span className="flex items-baseline gap-4">
                  <span className="font-mono text-xs font-bold text-[#3ee3a0] sm:text-sm">
                    0{i + 1}
                  </span>
                  {n.label}
                </span>
                <ArrowUpRight
                  size={20}
                  className="text-white/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#3ee3a0]"
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
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#08794D] to-[#14b574] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-8px_rgba(20,181,116,0.75)] transition hover:brightness-110"
          >
            Request Your Free Engine Quote
          </Link>
          <a
            href="tel:02034884649"
            tabIndex={open ? 0 : -1}
            className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 py-3.5 text-sm font-semibold text-white transition hover:border-[#3ee3a0] hover:text-[#3ee3a0]"
          >
            <PhoneCall size={16} className="text-[#3ee3a0]" />
            Call 0203 488 4649
          </a>
        </div>
      </div>
    </header>
  );
}