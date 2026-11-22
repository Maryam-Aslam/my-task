"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { Md } from "./Md";
import HexScene from "./HexScene";


export const SHOW_IMAGES = {
  workshop: "/media/four.png",
  engine: "/media/five.png",
  codes: "/media/six.png",
};

function Pic({ src, alt, className = "", attr = {} }: { src: string; alt: string; className?: string; attr?: Record<string, string> }) {
  const [bad, setBad] = useState(false);
  if (bad)
    return (
      <div role="img" aria-label={alt} className={`grid place-items-center bg-gradient-to-br from-forest via-[#0b5a3b] to-ink ${className}`}>
        <svg width="80" height="90" viewBox="0 0 90 100" aria-hidden><polygon points="45,3 85,26 85,74 45,97 5,74 5,26" fill="none" stroke="#18b777" strokeWidth="2" opacity=".6" /></svg>
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBad(true)} className={className} {...attr} />;
}

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

/* =====================================================================
   SECTION 01: Why Choose JLR Engine Specialist
   ===================================================================== */
export function WhyChoose({ id, index, title, paras }: { id: string; index: number; title: string; paras: string[] }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const isLead = (p: string) => /^\*\*[^*]+\*\*$/.test(p);
  const body = paras.filter((p) => !isLead(p));
  const lead = paras.filter(isLead);

  useEffect(() => {
    const el = root.current, st = stage.current;
    if (!el || !st || reduced()) return;
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);

      // paragraphs light up word-block by word-block as you scroll
      q("[data-lit]").forEach((p) =>
        gsap.fromTo(p, { opacity: 0.18 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: p, start: "top 88%", end: "top 48%", scrub: true } })
      );

      // layers rise into 3D space
      gsap.from(q("[data-layer]"), {
        y: 90, rotationX: 20, opacity: 0, duration: 1.4, ease: "power4.out", stagger: 0.18,
        scrollTrigger: { trigger: st, start: "top 80%", once: true },
      });

      // count-up numbers
      q("[data-count]").forEach((n) => {
        const node = n as HTMLElement, to = Number(node.dataset.count), o = { v: 0 };
        gsap.to(o, { v: to, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: node, start: "top 92%", once: true }, onUpdate: () => { node.textContent = String(Math.round(o.v)); } });
      });

      // gentle idle float (inner wrappers only, so it never fights the cursor effect)
      gsap.to(q("[data-float]"), { y: -12, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { each: 0.7, from: "random" } });

      if (isFine()) {
        const rx = gsap.quickTo(st, "rotationX", { duration: 0.8, ease: "power3" });
        const ry = gsap.quickTo(st, "rotationY", { duration: 0.8, ease: "power3" });
        const depthEls = q("[data-depth]") as HTMLElement[];
        const movers = depthEls.map((d) => ({
          d: Number(d.dataset.depth),
          x: gsap.quickTo(d, "x", { duration: 0.9, ease: "power3" }),
          y: gsap.quickTo(d, "y", { duration: 0.9, ease: "power3" }),
        }));
        const ring = el.querySelector("[data-ring]") as HTMLElement | null;
        const rX = ring ? gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" }) : null;
        const rY = ring ? gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" }) : null;

        const move = (e: PointerEvent) => {
          const b = st.getBoundingClientRect();
          const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
          const nx = px - 0.5, ny = py - 0.5;
          ry(nx * 10); rx(-ny * 8);
          movers.forEach((m) => { m.x(-nx * 46 * m.d); m.y(-ny * 34 * m.d); });
          st.style.setProperty("--mx", `${px * 100}%`);
          st.style.setProperty("--my", `${py * 100}%`);
          rX?.(e.clientX - b.left - 28); rY?.(e.clientY - b.top - 32);
        };
        const enter = () => ring && gsap.to(ring, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" });
        const leave = () => {
          rx(0); ry(0); movers.forEach((m) => { m.x(0); m.y(0); });
          ring && gsap.to(ring, { opacity: 0, scale: 0.4, duration: 0.3 });
        };
        st.addEventListener("pointermove", move);
        st.addEventListener("pointerenter", enter);
        st.addEventListener("pointerleave", leave);
        cleanups.push(() => { st.removeEventListener("pointermove", move); st.removeEventListener("pointerenter", enter); st.removeEventListener("pointerleave", leave); });
      }
    }, el);
    return () => { cleanups.forEach((c) => c()); ctx.revert(); };
  }, []);

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-h`} className="section relative overflow-hidden">
      <div className="wrap relative">
        <div className="lg:grid lg:grid-cols-[minmax(0,4.6fr)_minmax(0,7.4fr)] lg:gap-16">
          <div>
            <p className="eyebrow mb-4">{String(index).padStart(2, "0")}</p>
            <h2 id={`${id}-h`} data-split>{title}</h2>
          </div>
          <div className="prose mt-8 lg:mt-1">
            {body.map((p, i) => <p key={i} data-lit><Md text={p} /></p>)}
          </div>
        </div>

        {/* ---------- 3D stage ---------- */}
        <div className="relative mt-14 lg:mt-20" style={{ perspective: 1500 }}>
          <div ref={stage} className="relative h-[520px] sm:h-[600px] lg:h-[680px]" style={{ transformStyle: "preserve-3d" }}>
            {/* Three.js hex lattice behind everything */}
            <div className="scene-mask pointer-events-none absolute inset-0 opacity-60"><HexScene variant="lattice" className="h-full w-full" /></div>
            {/* cursor spotlight */}
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[32px]" style={{ background: "radial-gradient(520px circle at var(--mx,50%) var(--my,50%), rgba(24,183,119,.16), transparent 60%)" }} />

            {/* workshop (big, far) */}
            <div data-layer className="absolute left-0 top-[2%] w-[84%] lg:left-[4%] lg:w-[62%]">
              <div data-depth="0.5"><div data-float>
                <div className="aspect-[4/3] overflow-hidden rounded-[28px] shadow-soft ring-1 ring-black/5">
                  <Pic src={SHOW_IMAGES.workshop} alt="Specialist technician working on an exposed luxury SUV engine in a clean workshop" className="h-full w-full object-cover" />
                </div>
              </div></div>
            </div>

            {/* engine on podium (small, near) */}
            <div data-layer className="absolute bottom-0 right-0 w-[56%] lg:right-[3%] lg:w-[34%]">
              <div data-depth="1.2"><div data-float>
                <div className="aspect-[4/5] overflow-hidden rounded-[28px] shadow-[0_40px_80px_-30px_rgba(6,60,41,.55)] ring-4 ring-white">
                  <Pic src={SHOW_IMAGES.engine} alt="Luxury V6 engine on a glass pedestal with an emerald light ring" className="h-full w-full object-cover" />
                </div>
              </div></div>
            </div>

            {/* glass badges (numbers come from the supplied copy) */}
            <div data-layer className="absolute left-[2%] top-[58%] lg:left-[1%] lg:top-[66%]">
              <div data-depth="1.7"><div data-float>
                <div className="rounded-2xl bg-white/75 px-5 py-4 shadow-soft ring-1 ring-forest/10 backdrop-blur-xl">
                  <p className="font-display text-4xl font-bold leading-none text-forest"><span data-count="15">15</span>+</p>
                  <p className="mt-1 text-xs font-semibold text-ink/65">years of industry experience</p>
                </div>
              </div></div>
            </div>
            <div data-layer className="absolute right-[2%] top-[0%] lg:right-[6%] lg:top-[4%]">
              <div data-depth="1">
                <div data-float className="rounded-2xl bg-forest px-5 py-4 text-white shadow-soft">
                  <p className="font-display text-4xl font-bold leading-none"><span data-count="12">12</span></p>
                  <p className="mt-1 text-xs font-semibold text-white/75">month unlimited-mileage warranty</p>
                </div>
              </div>
            </div>

            {/* cursor hex ring (desktop only) */}
            <div data-ring aria-hidden className="pointer-events-none absolute left-0 top-0 z-20 hidden h-16 w-14 opacity-0 lg:block" style={{ transform: "scale(.4)" }}>
              <svg viewBox="0 0 56 64" className="h-full w-full"><polygon points="28,2 54,17 54,47 28,62 2,47 2,17" fill="rgba(24,183,119,.12)" stroke="#18b777" strokeWidth="2" /></svg>
            </div>
          </div>
        </div>

        {lead.map((p, i) => (
          <p key={i} data-lit className="mt-10 max-w-2xl font-display text-xl font-semibold text-forest sm:text-2xl"><Md text={p} /></p>
        ))}
      </div>
    </section>
  );
}

/* =====================================================================
   SECTION 02: Find Jaguar, Land Rover & Range Rover Engines by Code
   Wrap the existing tables with <CodeShowcase>…</CodeShowcase>
   ===================================================================== */
const CHIPS = [
  { t: "204DTD", c: "left-[6%] top-[14%]", d: 0.8 },
  { t: "306DT", c: "left-[30%] bottom-[12%]", d: 1.4 },
  { t: "508PS", c: "right-[26%] top-[10%]", d: 1.1 },
  { t: "PT306", c: "right-[6%] bottom-[16%]", d: 1.7 },
];

export function CodeShowcase({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const banner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current, b = banner.current;
    if (!el || !b || reduced()) return;
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      gsap.fromTo(q("[data-bphoto]"), { scale: 1.22, yPercent: -8 }, {
        scale: 1.05, yPercent: 8, ease: "none",
        scrollTrigger: { trigger: b, start: "top bottom", end: "bottom top", scrub: 0.8 },
      });
      gsap.fromTo(b, { clipPath: "inset(14% 8% 14% 8% round 40px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none",
        scrollTrigger: { trigger: b, start: "top 92%", end: "top 40%", scrub: 0.7 },
      });
      gsap.from(q("[data-bchip]"), {
        y: 40, scale: 0.6, opacity: 0, duration: 0.9, ease: "back.out(2)", stagger: 0.1,
        scrollTrigger: { trigger: b, start: "top 78%", once: true },
      });
      gsap.to(q("[data-bfloat]"), { y: -10, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { each: 0.5, from: "random" } });

      if (isFine()) {
        const rx = gsap.quickTo(b, "rotationX", { duration: 0.7, ease: "power3" });
        const ry = gsap.quickTo(b, "rotationY", { duration: 0.7, ease: "power3" });
        const movers = (q("[data-bdepth]") as HTMLElement[]).map((d) => ({
          k: Number(d.dataset.bdepth),
          x: gsap.quickTo(d, "x", { duration: 0.8, ease: "power3" }),
          y: gsap.quickTo(d, "y", { duration: 0.8, ease: "power3" }),
        }));
        const move = (e: PointerEvent) => {
          const r = b.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
          ry(nx * 8); rx(-ny * 6);
          movers.forEach((m) => { m.x(-nx * 40 * m.k); m.y(-ny * 26 * m.k); });
          b.style.setProperty("--mx", `${(nx + 0.5) * 100}%`);
          b.style.setProperty("--my", `${(ny + 0.5) * 100}%`);
        };
        const leave = () => { rx(0); ry(0); movers.forEach((m) => { m.x(0); m.y(0); }); };
        b.addEventListener("pointermove", move);
        b.addEventListener("pointerleave", leave);
        // section-wide glow that follows the cursor over the tables
        const glow = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--sx", `${e.clientX - r.left}px`);
          el.style.setProperty("--sy", `${e.clientY - r.top}px`);
        };
        el.addEventListener("pointermove", glow);
        cleanups.push(() => { b.removeEventListener("pointermove", move); b.removeEventListener("pointerleave", leave); el.removeEventListener("pointermove", glow); });
      }
    }, el);
    return () => { cleanups.forEach((c) => c()); ctx.revert(); };
  }, []);

  return (
    <div ref={root} className="spot relative">
      <div className="mb-12" style={{ perspective: 1400 }}>
        <div ref={banner} className="group relative aspect-[16/10] overflow-hidden rounded-[28px] shadow-soft ring-1 ring-black/5 sm:aspect-[21/9]" style={{ transformStyle: "preserve-3d", willChange: "transform, clip-path" }}>
          <Pic src={SHOW_IMAGES.codes} alt="Three different luxury car engines on glass hexagon pedestals" className="absolute inset-0 h-full w-full scale-[1.1] object-cover" attr={{ "data-bphoto": "" }} />
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.25), transparent 60%)" }} />
          {CHIPS.map((c) => (
            <div key={c.t} data-bchip className={`absolute ${c.c} z-10`}>
              <div data-bdepth={c.d}><div data-bfloat className="rounded-full bg-white/80 px-4 py-2 font-display text-sm font-bold tracking-wide text-forest shadow-soft ring-1 ring-forest/10 backdrop-blur-xl sm:text-base">{c.t}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}