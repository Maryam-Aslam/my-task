"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { inline, Md, plain } from "./Md";
import HexScene from "./HexScene";

/* ✏️ One entry per table, in order: 2.0-litre diesel, V6/six-cylinder/V8 diesel, petrol & hybrid.
   image = direct link or "/media/x.jpg" in /public.  video = optional "/media/x.mp4" (muted loop).
   pos = which part of the photo stays visible when cropped (CSS object-position). */
export const CAT_MEDIA = [
  { image: "/media/eone.png", video: "", pos: "50% 35%" },
  { image: "/media/etwo.png", video: "", pos: "50% 35%" },
{ image: "/media/ethree.png", video: "", pos: "50% 50%" },
];

type Group = { title: string; head: string[]; rows: string[][] };
const LINK = /\[([^\]]+)\]\(([^)]+)\)/;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
const num = (s: string) => {
  const m = /£\s*([\d,]+)/.exec(s);
  return m ? Number(m[1].replace(/,/g, "")) : null;
};

const rowGrid = "md:grid-cols-[1.15fr_1.8fr_1fr_1fr]";

/* ---------------- one engine family: full-bleed showcase panel + its rows ---------------- */
function GroupChapter({ grp, gi, flip }: { grp: Group; gi: number; flip: boolean }) {
  const [ri, setRi] = useState(0);
  const [imgBad, setImgBad] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const media = CAT_MEDIA[gi] ?? CAT_MEDIA[0];
  const row = grp.rows[ri];
  const link = LINK.exec(row[0]);

  /* ---- update the panel whenever a different row is picked ---- */
  useEffect(() => {
    const p = panel.current;
    if (!p) return;
    const prices = Array.from(p.querySelectorAll<HTMLElement>("[data-price]"));
    const apply = (animate: boolean) =>
      prices.forEach((el, i) => {
        const raw = row[2 + i] ?? "";
        const to = num(raw);
        const from = Number(el.dataset.v || 0);
        if (to === null || !animate) { el.textContent = plain(raw); el.dataset.v = String(to ?? 0); return; }
        const o = { v: from || to * 0.6 };
        gsap.to(o, { v: to, duration: 0.9, ease: "power3.out", onUpdate: () => { el.textContent = "£" + Math.round(o.v).toLocaleString("en-GB"); } });
        el.dataset.v = String(to);
      });
    if (reduced()) { apply(false); return; }
    apply(true);
    const q = gsap.utils.selector(p);
    gsap.fromTo(q("[data-pcode]"), { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out", overwrite: true, clearProps: "transform,opacity" });
    gsap.fromTo(q("[data-ptype]"), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.08, ease: "power3.out", overwrite: true, clearProps: "transform,opacity" });
    gsap.fromTo(q("[data-pprice]"), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.16, stagger: 0.08, ease: "power3.out", overwrite: true, clearProps: "transform,opacity" });
    gsap.fromTo(q("[data-pimgwrap]"), { scale: 1.06 }, { scale: 1, duration: 1.1, ease: "power3.out", overwrite: true });
    gsap.fromTo(q("[data-sheen]"), { xPercent: -140 }, { xPercent: 170, duration: 1.3, ease: "power2.inOut", overwrite: true });
  }, [ri, row]);

  /* ---- scroll + cursor effects (once per chapter) ---- */
  useEffect(() => {
    const el = root.current, p = panel.current;
    if (!el || !p || reduced()) return;
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      gsap.fromTo(p, { clipPath: "inset(8% 5% 8% 5% round 44px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 32px)", ease: "none",
        scrollTrigger: { trigger: p, start: "top 92%", end: "top 45%", scrub: 0.7 },
      });
      gsap.fromTo(q("[data-pimg]"), { yPercent: -6 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: p, start: "top bottom", end: "bottom top", scrub: 0.8 },
      });
      gsap.to(q("[data-pfloat]"), { y: -8, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });

      if (isFine()) {
        const rx = gsap.quickTo(p, "rotationX", { duration: 0.7, ease: "power3" });
        const ry = gsap.quickTo(p, "rotationY", { duration: 0.7, ease: "power3" });
        const movers = (q("[data-pdepth]") as HTMLElement[]).map((d) => ({
          k: Number(d.dataset.pdepth),
          x: gsap.quickTo(d, "x", { duration: 0.9, ease: "power3" }),
          y: gsap.quickTo(d, "y", { duration: 0.9, ease: "power3" }),
        }));
        const move = (e: PointerEvent) => {
          const b = p.getBoundingClientRect();
          const nx = (e.clientX - b.left) / b.width - 0.5, ny = (e.clientY - b.top) / b.height - 0.5;
          ry(nx * 8); rx(-ny * 6);
          movers.forEach((m) => { m.x(-nx * 26 * m.k); m.y(-ny * 18 * m.k); });
          p.style.setProperty("--mx", `${(nx + 0.5) * 100}%`);
          p.style.setProperty("--my", `${(ny + 0.5) * 100}%`);
        };
        const leave = () => { rx(0); ry(0); movers.forEach((m) => { m.x(0); m.y(0); }); };
        p.addEventListener("pointermove", move);
        p.addEventListener("pointerleave", leave);
        cleanups.push(() => { p.removeEventListener("pointermove", move); p.removeEventListener("pointerleave", leave); });
      }
    }, el);
    return () => { cleanups.forEach((c) => c()); ctx.revert(); };
  }, []);

  return (
    <div ref={root} className="mb-12 last:mb-0 lg:mb-24">
      <div className={`grid gap-8 lg:gap-14 ${flip ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"}`}>
        {/* ============ SHOWCASE PANEL: photo fills the whole panel ============ */}
        <div className={`order-first ${flip ? "lg:order-2" : "lg:order-1"}`} style={{ perspective: 1500 }}>
          <div ref={panel} className="group relative h-full min-h-[380px] xs:min-h-[420px] sm:min-h-[460px] lg:min-h-[520px] overflow-hidden rounded-[32px] bg-forest text-white shadow-[0_50px_90px_-40px_rgba(6,60,41,.7)]" style={{ willChange: "transform, clip-path" }}>
            {/* full-bleed photo */}
            <div data-pdepth="0.5" className="absolute inset-0">
              <div data-pfloat className="absolute -inset-6">
                <div data-pimgwrap className="absolute inset-0">
                  {!imgBad && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.image}
                      alt={`${grp.title}: ${plain(row[0])}`}
                      loading="lazy" decoding="async" referrerPolicy="no-referrer"
                      onError={() => setImgBad(true)}
                      data-pimg
                      className="absolute inset-0 h-full w-full scale-[1.08] object-cover"
                      style={{ objectPosition: media.pos }}
                    />
                  )}
                  {media.video && !imgBad && <video className="absolute inset-0 h-full w-full object-cover" src={media.video} autoPlay muted loop playsInline aria-hidden />}
                </div>
              </div>
            </div>

            {/* fallback only: live 3D hex lattice if the photo can't load */}
            {imgBad && <div className="pointer-events-none absolute inset-0 opacity-60"><HexScene variant="lattice" className="h-full w-full" /></div>}

            {/* light and depth overlays */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/15 to-ink/35" />
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(460px circle at var(--mx,50%) var(--my,35%), rgba(255,255,255,.20), transparent 60%)" }} />
            <span data-sheen aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* top label */}
            <div className="absolute left-5 top-5 z-10 sm:left-7 sm:top-7">
              <p className="inline-flex items-center gap-2 rounded-full bg-ink/55 px-4 py-2 text-[.7rem] font-bold uppercase tracking-[.16em] text-white ring-1 ring-white/30">
                <span className="hex h-3.5 w-3 bg-emerald-light" aria-hidden />
                {String(gi + 1).padStart(2, "0")} · {grp.title}
              </p>
            </div>

            {/* compact details bar: cut-corner shape, keeps the photo visible */}
            <div data-pdepth="1.2" className="absolute inset-x-4 bottom-4 z-10 sm:inset-x-6 sm:bottom-6">
              <div
                className="relative bg-ink/90 px-5 pb-4 pt-5 text-white"
                style={{ clipPath: "polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 26px 100%, 0 calc(100% - 26px))" }}
              >
                <span aria-hidden className="absolute left-0 top-0 h-[3px] w-24 bg-emerald-light" />

                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <div className="overflow-hidden">
                      <p data-pcode className="font-display text-[clamp(1.6rem,4vw,2.2rem)] font-bold leading-none tracking-tight">{plain(row[0])}</p>
                    </div>
                    <p data-ptype className="mt-1.5 truncate text-[.88rem] text-white/80">{plain(row[1])}</p>
                  </div>
                  {link && (
                    <a href={link[2]} aria-label={`View ${link[1]}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald text-white transition-transform hover:scale-110" data-magnetic>
                      <ArrowRight size={18} aria-hidden />
                    </a>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 border-t border-white/15 pt-3">
                  {[2, 3].map((i) => (
                    <div key={i} data-pprice className="min-w-0">
                      <p className="truncate text-[.56rem] font-bold uppercase tracking-[.12em] text-emerald-light">{grp.head[i]}</p>
                      <p data-price data-v="0" className="mt-0.5 font-display text-[.95rem] font-bold leading-tight sm:text-base">{plain(row[i] ?? "")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ ROWS (all supplied rows, links and prices) ============ */}
        <div className={`min-w-0 ${flip ? "lg:order-1" : "lg:order-2"}`}>
          <h3 className="mb-4" data-reveal>{grp.title}</h3>
          <div className={`hidden gap-x-4 border-b border-forest pb-3 pl-5 text-[.7rem] font-bold uppercase tracking-[.14em] text-emerald md:grid ${rowGrid}`}>
            {grp.head.map((h, i) => <span key={i} className={i >= 2 ? "text-right" : ""}>{h}</span>)}
          </div>
          <ul data-stagger="0.05">
            {grp.rows.map((rw, i) => (
              <li
                key={i}
                data-active={ri === i}
                onMouseEnter={() => setRi(i)}
                onFocusCapture={() => setRi(i)}
                onClick={() => setRi(i)}
                className={`cat-row relative grid cursor-pointer gap-x-4 gap-y-1.5 py-4 pl-5 pr-1 ${rowGrid} md:items-center`}
              >
                <strong className="font-display text-lg text-forest">{inline(rw[0], `a${gi}${i}`)}</strong>
                <span className="text-[#33423b]">{inline(rw[1], `b${gi}${i}`)}</span>
                {[2, 3].map((c) => (
                  <span key={c} className="flex items-baseline justify-between gap-3 text-[.95rem] md:block md:text-right">
                    <small className="text-[.64rem] font-bold uppercase tracking-[.12em] text-emerald md:hidden">{grp.head[c]}</small>
                    <span>{inline(rw[c] ?? "", `c${gi}${i}${c}`)}</span>
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function EngineCatalogue({ intro, groups, outro }: { intro: string[]; groups: Group[]; outro: string[] }) {
  return (
    <div className="relative">
      {intro.map((t, i) => <p key={i} className="lede mb-12 max-w-3xl"><Md text={t} /></p>)}
      {groups.map((g, gi) => <GroupChapter key={g.title} grp={g} gi={gi} flip={gi % 2 === 1} />)}
      <div className="mt-4 max-w-3xl space-y-5">
        {outro.map((t, i) =>
          /^\*\*Important/.test(t) ? <p key={i} className="note" data-reveal><Md text={t} /></p> : <p key={i} className="prose max-w-[68ch]" data-reveal><Md text={t} /></p>
        )}
      </div>
    </div>
  );
}