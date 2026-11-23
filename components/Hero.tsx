"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Car, Phone, Search } from "lucide-react";
import { gsap } from "@/lib/gsap";
import HexScene from "./HexScene";
import { chooseService, type Service } from "./QuotePanel";

/* ✏️ Your hero scene images (in /public/media) */
const IMG_DESKTOP = "/media/hero.png";
const IMG_PHONE = "/media/hero-phone.png";

export type HeroPrice = { label: string; price: string; note: string };

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
const SVC: Service[] = ["rebuild", "supply-fit", "engine-only"];

/** "[A](#x) · [B](#y) · **0203 488 4649**" -> parts (supplied copy, nothing invented) */
function parseCta(text: string) {
  const parts = text.split(" · ");
  const links = parts.map((p) => /\[([^\]]+)\]\(([^)]+)\)/.exec(p)).filter(Boolean) as RegExpExecArray[];
  const tel = /\*\*(0[\d ]{9,})\*\*/.exec(text);
  const callText = parts.find((p) => /^Call/i.test(p.replace(/\*\*/g, "")))?.replace(/\*\*/g, "") ?? (tel ? `Call ${tel[1]}` : "");
  return {
    primary: links[0] ? { t: links[0][1], h: links[0][2] } : null,
    second: links[1] ? { t: links[1][1], h: links[1][2] } : null,
    tel: tel ? { t: callText, h: `tel:${tel[1].replace(/\s/g, "")}` } : null,
  };
}

export default function Hero({
  title, lede, prices, ctaText, quote,
}: { title: string; lede: ReactNode; prices: HeroPrice[]; ctaText: string; quote: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const [bad, setBad] = useState(false);
  const [more, setMore] = useState(false);
  const [reg, setReg] = useState("");
  const cta = parseCta(ctaText);

  function go(e: FormEvent) {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("jlr:reg", { detail: reg }));
    document.getElementById("get-quote")?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
  }

  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);

      /* ---------- INTRO: curtain lifts, scene pushes in, UI cascades ---------- */
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(q("[data-hcurtain]"), { yPercent: 0 }, { yPercent: -101, duration: 1.3, ease: "power4.inOut" })
        .fromTo(q("[data-hbg]"), { scale: 1.16, opacity: 0.2 }, { scale: 1.02, opacity: 1, duration: 2.6, ease: "power3.out" }, 0.1)
        .fromTo(q("[data-hrule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, transformOrigin: "left" }, 0.9)
        .fromTo(q("[data-hform]"), { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 1, clearProps: "transform,opacity" }, 1.5)
        .fromTo(q("[data-hcard]"), { y: 70, opacity: 0, rotateX: 22 }, { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.14, clearProps: "transform,opacity" }, 1.4)
        .fromTo(q("[data-hbar]"), { yPercent: 100 }, { yPercent: 0, duration: 1, clearProps: "transform" }, 1.7);
      /* scene keeps breathing */
      gsap.to(q("[data-hbg]"), { scale: 1.05, duration: 18, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3 });
      gsap.fromTo(q("[data-hglow]"), { opacity: 0.25, scale: 0.9 }, { opacity: 0.85, scale: 1.12, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(q("[data-hring]"), { rotate: 360, duration: 80, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      gsap.to(q("[data-hring2]"), { rotate: -360, duration: 110, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      /* light streaks sweep across every few seconds */
      gsap.fromTo(q("[data-hstreak]"), { xPercent: -160, opacity: 0 }, { xPercent: 480, opacity: 1, duration: 2.8, delay: 1.8, stagger: 0.3, repeat: -1, repeatDelay: 6, ease: "power2.inOut" });
      /* hexes + dust drift */
      (q("[data-hdrift]") as HTMLElement[]).forEach((d, i) => {
        gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 1, delay: 1 + i * 0.15 });
        gsap.to(d, { y: gsap.utils.random(-36, -16), x: gsap.utils.random(-16, 16), rotate: gsap.utils.random(-35, 35), duration: gsap.utils.random(3.5, 6.5), ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.2 });
      });
      (q("[data-hdust]") as HTMLElement[]).forEach((d, i) => {
        gsap.set(d, { left: gsap.utils.random(2, 98) + "%", top: gsap.utils.random(40, 100) + "%", scale: gsap.utils.random(0.5, 1.4), opacity: 0 });
        gsap.to(d, { y: () => -gsap.utils.random(160, 420), x: gsap.utils.random(-40, 40), opacity: gsap.utils.random(0.35, 0.8), duration: gsap.utils.random(7, 13), delay: gsap.utils.random(0, 6), ease: "sine.inOut", repeat: -1, yoyo: true });
      });
      /* price cards: idle float + count-up */
      (q("[data-hcard]") as HTMLElement[]).forEach((c, i) => {
        gsap.to(c.querySelector("[data-hfloat]"), { y: -7, duration: 2.6 + i * 0.35, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.2 + i * 0.2 });
      });
      (q("[data-count]") as HTMLElement[]).forEach((n, i) => {
        const to = Number(n.dataset.count);
        const o = { v: to * 0.5 };
        gsap.to(o, { v: to, duration: 2, delay: 1.7 + i * 0.14, ease: "power3.out", onUpdate: () => { n.textContent = "£" + Math.round(o.v).toLocaleString("en-GB"); } });
      });
      /* registration box glows softly, phone icon pulses */
      gsap.to(q("[data-hform]"), { boxShadow: "0 24px 60px -18px rgba(24,183,119,.65)", duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.5 });
      gsap.fromTo(q("[data-hpulse]"), { scale: 1, opacity: 0.6 }, { scale: 2.1, opacity: 0, duration: 1.8, ease: "power2.out", repeat: -1 });

      /* ---------- SCROLL: scene recedes, copy lifts, bar slides ---------- */
      const st = { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 };
      gsap.to(q("[data-hpar]"), { yPercent: 4, ease: "none", scrollTrigger: st });
      gsap.to(q("[data-hcopy]"), { yPercent: -10, opacity: 0.2, ease: "none", scrollTrigger: st });
      gsap.to(q("[data-hcards]"), { yPercent: -6, ease: "none", scrollTrigger: st });

      /* ---------- CURSOR: depth shift, light, card tilt + glare ---------- */
      if (isFine()) {
        const layers = (q("[data-hdepth]") as HTMLElement[]).map((d) => ({
          k: Number(d.dataset.hdepth),
          x: gsap.quickTo(d, "x", { duration: 1.1, ease: "power3" }),
          y: gsap.quickTo(d, "y", { duration: 1.1, ease: "power3" }),
        }));
        const move = (e: PointerEvent) => {
          const b = el.getBoundingClientRect();
          const nx = (e.clientX - b.left) / b.width - 0.5, ny = (e.clientY - b.top) / b.height - 0.5;
          layers.forEach((l) => { l.x(-nx * 42 * l.k); l.y(-ny * 26 * l.k); });
          el.style.setProperty("--mx", `${(nx + 0.5) * 100}%`);
          el.style.setProperty("--my", `${(ny + 0.5) * 100}%`);
        };
        const leave = () => layers.forEach((l) => { l.x(0); l.y(0); });
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); });

        (q("[data-hcard]") as HTMLElement[]).forEach((c) => {
          const rx = gsap.quickTo(c, "rotationX", { duration: 0.5, ease: "power3" });
          const ry = gsap.quickTo(c, "rotationY", { duration: 0.5, ease: "power3" });
          const m = (e: PointerEvent) => {
            const b = c.getBoundingClientRect();
            const nx = (e.clientX - b.left) / b.width, ny = (e.clientY - b.top) / b.height;
            ry((nx - 0.5) * 16); rx(-(ny - 0.5) * 14);
            c.style.setProperty("--gx", `${nx * 100}%`); c.style.setProperty("--gy", `${ny * 100}%`);
          };
          const l = () => { rx(0); ry(0); };
          c.addEventListener("pointermove", m);
          c.addEventListener("pointerleave", l);
          cleanups.push(() => { c.removeEventListener("pointermove", m); c.removeEventListener("pointerleave", l); });
        });
      }
    }, el);
    return () => { cleanups.forEach((c) => c()); ctx.revert(); };
  }, []);

  return (
    <>
      <section ref={root} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#03110b] text-white" aria-labelledby="home-h1">
        {/* intro curtain (lifts away on load) */}
        <div data-hcurtain aria-hidden className="pointer-events-none absolute inset-0 z-30 bg-[#03110b]">
          <span className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-emerald-light via-emerald to-transparent" />
        </div>

        {/* white strip keeps the site header readable */}
        <div aria-hidden className="absolute inset-x-0 top-0 -z-[5] h-[72px] bg-white lg:h-[88px]" />

        {/* ================= SCENE ================= */}
        <div
          data-hpar
          className="absolute inset-x-0 top-[72px] -z-20 h-[500px] [-webkit-mask-image:linear-gradient(to_bottom,#000_62%,transparent_100%)] [mask-image:linear-gradient(to_bottom,#000_62%,transparent_100%)] sm:h-[600px] lg:inset-x-0 lg:bottom-0 lg:top-[88px] lg:h-auto lg:[-webkit-mask-image:none] lg:[mask-image:none]"
        >
          <div data-hdepth="0.4" className="absolute -inset-3">
            {!bad ? (
              <picture>
                <source media="(max-width: 1023px)" srcSet={IMG_PHONE} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={IMG_DESKTOP} alt="Jaguar, Land Rover and Range Rover models in front of a glass-cased rebuilt engine"
                  data-hbg fetchPriority="high" decoding="async" onError={() => setBad(true)}
                  className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "70% 100%" }}
                />
              </picture>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_75%_35%,#0b4a33,#062a1d_55%,#03110b)]">
                <HexScene variant="lattice" className="h-full w-full opacity-50" />
              </div>
            )}
          </div>
          {/* glow behind the engine */}
          <span data-hglow aria-hidden className="pointer-events-none absolute right-[14%] top-[10%] hidden h-[46%] w-[34%] rounded-full bg-white/25 blur-[90px] lg:block" />
          {/* rotating hex rings around the engine */}
          <div data-hdepth="1.4" aria-hidden className="pointer-events-none absolute right-[10%] top-[4%] hidden aspect-square h-[72%] lg:block">
            <svg data-hring viewBox="0 0 100 100" className="h-full w-full text-white/80 drop-shadow-[0_0_6px_rgba(255,255,255,.55)]" fill="none" stroke="currentColor" strokeWidth="0.35">
              <polygon points="50,2 92,26 92,74 50,98 8,74 8,26" strokeDasharray="1.5 3" />
              <polygon data-hring2 points="50,12 83,31 83,69 50,88 17,69 17,31" />
            </svg>
          </div>
          {/* floating dust */}
          {Array.from({ length: 22 }).map((_, i) => (
            <span key={i} data-hdust aria-hidden className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_3px_rgba(255,255,255,.75)]" />
          ))}
          {/* drifting hexes */}
          {["right-[8%] top-[18%] h-6 w-[21px]", "right-[34%] top-[8%] h-3.5 w-3", "right-[22%] top-[58%] h-4 w-[14px]", "right-[3%] top-[44%] h-3 w-[11px]"].map((c, i) => (
            <div key={i} data-hdepth={0.9 + i * 0.3} className={`pointer-events-none absolute hidden lg:block ${c}`}>
              <span data-hdrift aria-hidden className={`hex block h-full w-full ${i % 2 ? "bg-white/90 shadow-[0_0_14px_rgba(255,255,255,.8)]" : "bg-white/60"}`} />
            </div>
          ))}
        </div>

        {/* soft dark scrims: only behind the text (top-left), cars stay fully visible */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[330px] -z-10 bg-gradient-to-b from-transparent via-[#03110b]/85 via-[22%] to-[#03110b] sm:top-[420px] lg:hidden" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden lg:block" style={{ background: "radial-gradient(46% 56% at 0% 16%, rgba(3,17,11,.88) 0%, rgba(3,17,11,.55) 45%, rgba(3,17,11,0) 100%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 lg:opacity-100" style={{ background: "radial-gradient(520px circle at var(--mx,70%) var(--my,35%), rgba(255,255,255,.12), transparent 62%)" }} />
        <span data-hstreak aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/4 -z-10 hidden w-[8%] -skew-x-[24deg] bg-gradient-to-r from-transparent via-white/45 to-transparent lg:block" />
        <span data-hstreak aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/4 -z-10 hidden w-[3%] -skew-x-[24deg] bg-gradient-to-r from-transparent via-white/30 to-transparent lg:block" />

        {/* ================= CONTENT ================= */}
        <div className="wrap relative z-10 grid flex-1 grid-cols-[minmax(0,1fr)] gap-x-10 pb-8 pt-[370px] sm:pt-[470px] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:pb-10 lg:pt-[124px]">
          {/* left: copy + registration */}
          <div data-hcopy className="flex flex-col justify-start lg:py-2">
            <span data-hrule aria-hidden className="mb-4 block h-[3px] w-16 rounded-full bg-gradient-to-r from-emerald-light to-emerald" />
            <h1 id="home-h1" data-split data-hero className="!text-white !text-[clamp(1.65rem,3vw,2.6rem)] !leading-[1.06]">{title}</h1>

            <div className="mt-4 max-w-[52ch]" data-reveal data-hero data-delay="0.7">
              <div className={`lede !text-[.95rem] !leading-[1.55] !text-white/80 sm:!text-base lg:line-clamp-none ${more ? "" : "line-clamp-3"}`}>{lede}</div>
              <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className="mt-1.5 text-sm font-bold text-emerald-light underline-offset-4 hover:underline lg:hidden">
                {more ? "Show less" : "Read more"}
              </button>
            </div>

            {cta.primary && (
              <form onSubmit={go} className="mt-6 flex max-w-[520px] items-stretch overflow-hidden rounded-2xl bg-white shadow-[0_24px_50px_-24px_rgba(6,60,41,.55)] ring-1 ring-forest/15 focus-within:ring-2 focus-within:ring-emerald" data-hform>
                <label htmlFor="hero-reg" className="sr-only">Enter your registration</label>
                <span className="grid w-11 shrink-0 place-items-center text-forest/70" aria-hidden><Car size={20} /></span>
                <input
                  id="hero-reg" value={reg} onChange={(e) => setReg(e.target.value.toUpperCase())}
                  autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="Enter your registration"
                  className="min-h-[56px] w-full min-w-0 bg-transparent pr-2 text-base font-semibold uppercase tracking-wide text-ink placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-ink/45 focus:outline-none"
                />
                <button type="submit" className="flex shrink-0 items-center gap-2 bg-forest px-4 text-[.86rem] font-bold text-white transition-colors hover:bg-emerald sm:px-5 sm:text-[.95rem]" data-magnetic>
                  <span className="hidden min-[400px]:inline">{cta.primary.t}</span><span className="min-[400px]:hidden">Get quote</span>
                  <ArrowRight size={17} aria-hidden />
                </button>
              </form>
            )}
          </div>

          {/* right: price cards, sitting under the engine */}
          <div data-hcards className="mt-7 flex lg:mt-0 lg:items-end lg:justify-end lg:pb-4">
            <ul className="-mx-5 flex w-[calc(100%+2.5rem)] snap-x snap-mandatory scroll-pl-5 gap-3 sm:scroll-pl-0 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:mx-0 sm:w-full sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid lg:max-w-[640px] lg:grid-cols-3 [&::-webkit-scrollbar]:hidden" style={{ perspective: 1200 }}>
              {prices.map((p, i) => {
                const n = Number(p.price.replace(/[^\d]/g, ""));
                return (
                  <li key={i} data-hcard className="group/card relative w-[78%] shrink-0 snap-start sm:w-auto" style={{ transformStyle: "preserve-3d" }}>
                    <div
                      data-hfloat
                      className="relative h-full bg-ink/90 px-4 pb-4 pt-5 text-white transition-colors duration-300 group-hover/card:bg-ink"
                      style={{ clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))" }}
                    >
                      <span aria-hidden className="absolute left-0 top-0 h-[3px] w-20 bg-emerald-light transition-all duration-300 group-hover/card:w-full" />
                      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" style={{ background: "radial-gradient(200px circle at var(--gx,50%) var(--gy,0%), rgba(255,255,255,.14), transparent 65%)" }} />
                      <div className="relative flex items-start justify-between gap-3">
                        <p className="font-display text-[1.02rem] font-bold leading-tight">{p.label}</p>
                        <a
                          href="#get-quote" onClick={() => chooseService(SVC[i % 3])} aria-label={`Get a quote: ${p.label}`}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald text-white transition-transform hover:scale-110" data-magnetic
                        >
                          <ArrowRight size={16} aria-hidden />
                        </a>
                      </div>
                      <p className="relative mt-4 text-[.58rem] font-bold uppercase tracking-[.14em] text-emerald-light">From (incl. VAT)</p>
                      <p className="relative font-display text-[1.9rem] font-bold leading-none"><span data-count={n}>{p.price}</span></p>
                      {p.note && <p className="relative mt-3 border-t border-white/15 pt-2.5 text-[.72rem] leading-snug text-white/70">{p.note}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div data-hbar className="relative z-10 bg-forest text-white [clip-path:polygon(0_14px,100%_0,100%_100%,0_100%)] lg:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]">
          <div className="wrap flex flex-col gap-3 py-5 pt-7 sm:flex-row sm:items-center sm:justify-between lg:pt-5">
            <p className="hidden text-[.78rem] font-semibold uppercase tracking-[.2em] text-white/70 lg:block">
              <span className="hex mr-3 inline-block h-3 w-[11px] bg-emerald-light align-middle" aria-hidden />Independent Essex workshop
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              {cta.second && (
                <a href={cta.second.h} className="inline-flex min-h-[44px] items-center gap-2 text-[.95rem] font-semibold hover:text-emerald-light">
                  <Search size={18} aria-hidden /> {cta.second.t}
                </a>
              )}
              {cta.tel && (
                <a href={cta.tel.h} className="inline-flex min-h-[44px] items-center gap-2 font-display text-lg font-bold hover:text-emerald-light">
                  <span className="relative grid place-items-center"><span data-hpulse aria-hidden className="absolute h-5 w-5 rounded-full bg-emerald-light/60" /><Phone size={18} aria-hidden className="relative" /></span> {cta.tel.t}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUOTE PANEL ================= */}
<section className="mesh relative overflow-hidden py-14 lg:py-20" aria-label="Request your quote">
          <div className="wrap">
          <div className="mx-auto max-w-[1040px]" data-reveal>{quote}</div>
        </div>
      </section>
    </>
  );
}