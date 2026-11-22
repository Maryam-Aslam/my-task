"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import Logo from "./Logo";

const nav = [
  { href: "/engines/", label: "Engines" },
  { href: "/models/", label: "Models" },
  { href: "/engine-inspection/", label: "Engine problems" },
  { href: "/engine-warranty/", label: "Warranty" },
  { href: "/contact-us/", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header id="site-header" className="fixed inset-x-0 top-0 z-50 transition-transform duration-500 will-change-transform">
      <div id="header-bg" className="absolute inset-0 border-b border-forest/10 bg-white/80 opacity-0 backdrop-blur-xl transition-opacity duration-300" />
      <div className="wrap relative flex h-[68px] items-center justify-between">
        <Link href="/" aria-label="JLR Specialist home"><Logo /></Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="nav-link relative text-[.92rem] font-semibold text-forest">{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="tel:02034884649" className="btn btn--primary btn--sm" data-magnetic><Phone size={16} aria-hidden /> <span className="hidden sm:inline">0203 488 4649</span><span className="sm:hidden">Call</span></a>
          <button className="grid h-11 w-11 place-items-center rounded-full border border-forest/20 text-forest lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div id="mobile-nav" hidden={!open} className="fixed inset-0 top-[68px] z-40 bg-forest px-[var(--gutter)] pb-10 pt-8 lg:hidden">
        <nav aria-label="Mobile" className="flex flex-col">
          {nav.map((n, i) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-b border-white/15 py-5 font-display text-3xl font-semibold text-white">
              <span className="text-sm font-bold text-emerald-light">0{i + 1}</span>{n.label}
            </Link>
          ))}
        </nav>
        <Link href="/get-a-quote/" onClick={() => setOpen(false)} className="btn btn--primary mt-8 w-full">Request Your Free Engine Quote</Link>
      </div>
    </header>
  );
}
