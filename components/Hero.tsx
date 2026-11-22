"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import HexScene from "./HexScene";

/* ✏️ Your hero images (in /public/media) */
const IMG_DESKTOP = "/media/hero.jfif";
const IMG_PHONE = "/media/hero-phone.jfif";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

export default function Hero({
  title, lede, list, cta, quote,
}: { title: string; lede: ReactNode; list: ReactNode; cta: ReactNode; quote: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [bad, setBad] = useState(false);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const el = root.current, st = stage.current;
    if (!el || !st || reduced()) return;
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);

      /* stage opens like a curtain, image settles in with a slow cinematic push */
      gsap.fromTo(st, { clipPath: "inset(7% 5% 7% 5% round 56px)" }, { clipPath: "inset(0% 0% 0% 0% round 36px)", duration: 1.5, ease: "expo.out", clearProps: "clipPath" });
      gsap.timeline()
        .fromTo(q("[data-himg]"), { scale: 1.25, opacity: 0 }, { scale: 1.06, opacity: 1, duration: 2.2, ease: "power3.out" })
        .to(q("[data-himg]"), { scale: 1.12, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.fromTo(q("[data-hglint]"), { xPercent: -200 }, { xPercent: 420, duration: 2, delay: 1, ease: "power2.inOut" });
      gsap.fromTo(q("[data-hline]"), { scaleX: 0 }, { scaleX: 1, duration: 1.6, delay: 0.5, ease: "expo.out", transformOrigin: "left" });

      /* idle motion */
      gsap.to(q("[data-hfloat]"), { y: -9, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(q("[data-hring]"), { rotate: 360, duration: 70, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      gsap.to(q("[data-hring2]"), { rotate: -360, duration: 90, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      (q("[data-hdrift]") as HTMLElement[]).forEach((d, i) => {
        gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.8 + i * 0.15 });
        gsap.to(d, { y: gsap.utils.random(-34, -18), x: gsap.utils.random(-14, 14), rotate: gsap.utils.random(-30, 30), duration: gsap.utils.random(3.5, 6), ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.2 });
      });

      /* scroll: image drifts slower than the page */
      gsap.to(q("[data-hpar]"), { yPercent: 9, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 } });
      gsap.to(q("[data-hcopy]"), { yPercent: -4, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 } });

      /* cursor: layered depth + light that follows the pointer */
      if (isFine()) {
        const layers = (q("[data-hdepth]") as HTMLElement[]).map((d) => ({
          k: Number(d.dataset.hdepth),
          x: gsap.quickTo(d, "x", { duration: 1, ease: "power3" }),
          y: gsap.quickTo(d, "y", { duration: 1, ease: "power3" }),
        }));
        const move = (e: PointerEvent) => {
          const b = st.getBoundingClientRect();
          const nx = (e.clientX - b.left) / b.width - 0.5, ny = (e.clientY - b.top) / b.height - 0.5;
          layers.forEach((l) => { l.x(-nx * 44 * l.k); l.y(-ny * 28 * l.k); });
          st.style.setProperty("--mx", `${(nx + 0.5) * 100}%`);
          st.style.setProperty("--my", `${(ny + 0.5) * 100}%`);
        };
        const leave = () => layers.forEach((l) => { l.x(0); l.y(0); });
        st.addEventListener("pointermove", move);
        st.addEventListener("pointerleave", leave);
        cleanups.push(() => { st.removeEventListener("pointermove", move); st.removeEventListener("pointerleave", leave); });
      }
    }, el);
    return () => { cleanups.forEach((c) => c()); ctx.revert(); };
  }, []);

  return (
    <section ref={root} className="mesh relative overflow-hidden pt-[76px] lg:pt-[104px]" aria-labelledby="home-h1">
      <div className="wrap relative pb-14 lg:pb-24">
        {/* ================= DARK STAGE ================= */}
        <div
          ref={stage}
          className="group relative isolate overflow-hidden rounded-[28px] bg-[#04130d] text-white shadow-[0_60px_100px_-50px_rgba(6,60,41,.9)] lg:min-h-[640px] lg:rounded-[36px]"
          style={{ background: "radial-gradient(90% 80% at 80% 30%, #0b4a33 0%, #062a1d 45%, #03110b 100%)", willChange: "clip-path" }}
        >
          {/* fallback only: 3D hex lattice if the photo can't load */}
          {bad && <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-30"><HexScene variant="lattice" className="h-full w-full" /></div>}

          {/* photo: top on phones, right 64% on desktop */}
          <div
            data-hpar
            className="relative h-[330px] w-full [-webkit-mask-image:linear-gradient(to_bottom,#000_58%,transparent_100%)] [mask-image:linear-gradient(to_bottom,#000_58%,transparent_100%)] sm:h-[420px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[64%] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_30%)] lg:[mask-image:linear-gradient(to_right,transparent_0%,#000_30%)]"
          >
            <div data-hdepth="0.55" className="absolute -inset-8">
              <div data-hfloat className="absolute inset-0">
                {!bad && (
                  <picture>
                    <source media="(max-width: 767px)" srcSet={IMG_PHONE} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={IMG_DESKTOP} alt="Jaguar, Land Rover and Range Rover models in front of a glass-cased rebuilt engine"
                      data-himg fetchPriority="high" decoding="async" onError={() => setBad(true)}
                      className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "50% 42%" }}
                    />
                  </picture>
                )}
              </div>
            </div>

            {/* floating hex rings + drifting hexes, each at its own depth */}
            <div data-hdepth="1.5" aria-hidden className="pointer-events-none absolute right-[6%] top-[4%] h-40 w-40 sm:h-60 sm:w-60">
              <svg data-hring viewBox="0 0 100 100" className="h-full w-full text-emerald-light/80" fill="none" stroke="currentColor" strokeWidth="0.5">
                <polygon points="50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5" strokeDasharray="2 4" />
                <polygon data-hring2 points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5" />
              </svg>
            </div>
            {[
              "left-[22%] top-[58%] h-5 w-[18px]", "left-[40%] top-[12%] h-3 w-[11px]", "right-[12%] top-[52%] h-6 w-[21px]",
              "left-[12%] top-[26%] h-3.5 w-3", "right-[28%] bottom-[16%] h-4 w-[14px]",
            ].map((c, i) => (
              <div key={i} data-hdepth={0.9 + (i % 3) * 0.35} className={`pointer-events-none absolute ${c}`}>
                <span data-hdrift aria-hidden className={`hex block h-full w-full ${i % 2 ? "bg-emerald-light/70" : "bg-white/60"}`} />
              </div>
            ))}
          </div>

          {/* light follows cursor + sweep + top accent line */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(520px circle at var(--mx,70%) var(--my,35%), rgba(24,183,119,.22), transparent 62%)" }} />
          <span data-hglint aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/4 w-1/5 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <span data-hline aria-hidden className="pointer-events-none absolute left-0 top-0 h-[3px] w-full bg-gradient-to-r from-emerald-light via-emerald to-transparent" />

          {/* copy */}
          <div data-hcopy className="relative z-10 -mt-24 px-6 pb-8 sm:-mt-28 sm:px-10 sm:pb-10 lg:mt-0 lg:flex lg:min-h-[640px] lg:max-w-[50%] lg:flex-col lg:justify-center lg:px-14 lg:pb-24 lg:pt-14">
            <h1 id="home-h1" data-split data-hero className="!text-white !text-[clamp(1.6rem,5.2vw,2.6rem)] !leading-[1.08]">{title}</h1>

            <div className="mt-4" data-reveal data-hero data-delay="0.7">
              <div className={`lede !text-[.95rem] !leading-[1.55] !text-white/75 sm:!text-base lg:line-clamp-none ${more ? "" : "line-clamp-3"}`}>{lede}</div>
              <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className="mt-1.5 text-sm font-bold text-emerald-light underline-offset-4 hover:underline lg:hidden">
                {more ? "Show less" : "Read more"}
              </button>
            </div>

            <div className="mt-6">{list}</div>

            {/* buttons: primary full width, the other two side by side */}
            <div
              className="mt-7 [&>div]:grid [&>div]:grid-cols-2 [&>div]:gap-3 [&>div>a]:!min-h-[50px] [&>div>a]:px-2 [&>div>a]:text-center [&>div>a]:text-[.82rem] [&>div>a]:leading-tight [&>div>a:last-child]:whitespace-nowrap [&>div>a:first-child]:col-span-2 sm:[&>div>a]:px-4 sm:[&>div>a]:text-[.95rem]"
              data-reveal data-hero data-delay="1.05"
            >
              {cta}
            </div>
          </div>
        </div>

        {/* ================= QUOTE PANEL (overlaps the stage's lower edge on desktop) ================= */}
        <div className="relative z-20 mx-auto mt-4 max-w-[1040px] lg:-mt-16" data-reveal data-hero data-delay="1.15">
          {quote}
        </div>
      </div>
    </section>
  );
}