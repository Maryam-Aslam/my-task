"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Site-wide GSAP layer. Content is visible by default; it is only pre-hidden (html.js) when motion
 * is allowed, and every hidden element is revealed by a ScrollTrigger or the safety timeout below.
 * Hooks used by markup: data-split, data-reveal, data-stagger, data-parallax, data-draw,
 * data-sweep, data-magnetic, data-hero.
 */
export default function Motion() {
  const path = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      html.classList.remove("js");
      return;
    }
    html.classList.add("js");
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      try {
        // ---- scroll progress bar
        let bar = document.getElementById("scroll-progress");
        if (!bar) {
          bar = document.createElement("div");
          bar.id = "scroll-progress";
          Object.assign(bar.style, { position: "fixed", left: "0", top: "0", height: "3px", width: "100%", zIndex: "60", transformOrigin: "0 50%", transform: "scaleX(0)", background: "linear-gradient(90deg,#08794d,#18b777)", pointerEvents: "none" });
          document.body.appendChild(bar);
        }
        gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

        // ---- header: blur background once scrolled, hide on scroll down, show on scroll up
        const header = document.getElementById("site-header");
        const hbg = document.getElementById("header-bg");
        if (header && hbg) {
          ScrollTrigger.create({
            start: 0, end: "max",
            onUpdate: (self) => {
              const y = self.scroll();
              hbg.style.opacity = y > 24 ? "1" : "0";
              const hide = self.direction === 1 && y > 420 && !document.getElementById("mobile-nav")?.matches(":not([hidden])");
              gsap.to(header, { yPercent: hide ? -110 : 0, duration: 0.45, ease: "power3.out", overwrite: true });
            },
          });
        }

        // ---- headline masked-line reveal
        document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
          const words = (el.textContent || "").trim().split(/\s+/);
          el.setAttribute("aria-label", words.join(" "));
          el.innerHTML = words
            .map((w) => `<span class="split-line" aria-hidden="true"><span>${w}</span></span>`)
            .join(" ");
          const inner = el.querySelectorAll<HTMLElement>(".split-line > span");
          gsap.set(inner, { yPercent: 115, rotate: 4 });
          const hero = el.hasAttribute("data-hero");
          gsap.to(inner, {
            yPercent: 0, rotate: 0, duration: 1.05, ease: "expo.out", stagger: 0.06, delay: hero ? 0.2 : 0,
            scrollTrigger: hero ? undefined : { trigger: el, start: "top 88%", once: true },
          });
        });

        // ---- generic reveals
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          const kind = el.dataset.reveal;
          const from: gsap.TweenVars = { opacity: 0, y: 34 };
          if (kind === "left") Object.assign(from, { y: 0, x: -48 });
          if (kind === "right") Object.assign(from, { y: 0, x: 48 });
          if (kind === "scale") Object.assign(from, { y: 0, scale: 0.94 });
          const hero = el.hasAttribute("data-hero");
          gsap.fromTo(el, from, {
            opacity: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: "power3.out",
            delay: hero ? Number(el.dataset.delay ?? 0.55) : 0,
            scrollTrigger: hero ? undefined : { trigger: el, start: "top 90%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
          const kids = Array.from(el.children) as HTMLElement[];
          gsap.fromTo(kids, { opacity: 0, y: 28 }, {
            opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: Number(el.dataset.stagger) || 0.07,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        // ---- parallax decorations
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const s = Number(el.dataset.parallax) || 0.2;
          gsap.fromTo(el, { yPercent: -18 * s * 5 }, {
            yPercent: 18 * s * 5, ease: "none",
            scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: 0.6 },
          });
          if (el.dataset.spin) gsap.to(el, { rotate: Number(el.dataset.spin), ease: "none", scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: 1 } });
        });

        // ---- SVG line drawing (steps connector, hex outlines)
        gsap.utils.toArray<SVGGeometryElement>("[data-draw]").forEach((p) => {
          const len = p.getTotalLength?.() ?? 0;
          if (!len) return;
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(p, {
            strokeDashoffset: 0, ease: "none",
            scrollTrigger: { trigger: p.closest("[data-draw-scope]") || p, start: "top 80%", end: "bottom 55%", scrub: 0.6 },
          });
        });

        // ---- connector lines that grow with scroll
        gsap.utils.toArray<HTMLElement>("[data-grow]").forEach((el) => {
          const y = el.dataset.grow === "y";
          gsap.fromTo(el, y ? { scaleY: 0 } : { scaleX: 0 }, {
            ...(y ? { scaleY: 1 } : { scaleX: 1 }), ease: "none",
            scrollTrigger: { trigger: el.parentElement || el, start: "top 75%", end: "bottom 55%", scrub: 0.6 },
          });
        });

        // ---- highlight sweep on key prices
        gsap.utils.toArray<HTMLElement>("[data-sweep]").forEach((el) => {
          ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => el.classList.add("on") });
        });

        // ---- hex frames "light up" borders when entering view
        gsap.utils.toArray<HTMLElement>("[data-hexpop]").forEach((el) => {
          gsap.from(el, {
            scale: 0.4, rotate: -30, opacity: 0, duration: 1.1, ease: "back.out(1.7)",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        // ---- magnetic buttons
        if (fine) {
          gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
            const qx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
            const qy = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
            const move = (e: PointerEvent) => {
              const b = el.getBoundingClientRect();
              qx((e.clientX - (b.left + b.width / 2)) * 0.22);
              qy((e.clientY - (b.top + b.height / 2)) * 0.3);
            };
            const leave = () => { qx(0); qy(0); };
            el.addEventListener("pointermove", move);
            el.addEventListener("pointerleave", leave);
            cleanups.push(() => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); });
          });
        }

        document.fonts?.ready.then(() => ScrollTrigger.refresh());
      } catch (err) {
        console.error("Motion init failed; showing content statically", err);
        html.classList.remove("js");
      }
    });

    // safety net: never leave content hidden
    const safety = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-stagger] > *").forEach((n) => {
        if (getComputedStyle(n).opacity === "0" && n.getBoundingClientRect().top < innerHeight) n.style.opacity = "1";
      });
    }, 5000);

    return () => {
      window.clearTimeout(safety);
      cleanups.forEach((c) => c());
      ctx.revert();
    };
  }, [path]);

  return null;
}
