"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

/* cut-corner frame (same language as the price cards) */
const CUT_OUT = "polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))";
const CUT_IN = "polygon(0 0, calc(100% - 38.8px) 0, 100% 38.8px, 100% 100%, 38.8px 100%, 0 calc(100% - 38.8px))";

/**
 * Section with a big background picture, an animated light-running border and the content on a clean sheet.
 * image: "/media/xxx.png" (direct link also works). Missing image = dark green gradient + hex lines.
 */
export default function ImageSec({
  id, title, index, image, children,
}: { id?: string; title: string; index?: number; image: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [imgOk, setImgOk] = useState(true);
  const num = index !== undefined ? String(index).padStart(2, "0") : "";

  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);

      /* frame rises in */
      gsap.fromTo(el, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", clearProps: "transform,opacity", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      gsap.from(q("[data-isheet]"), { y: 40, opacity: 0, duration: 1, delay: 0.25, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: { trigger: el, start: "top 80%", once: true } });

      /* border: a band of light runs around the frame, forever */
      gsap.fromTo(q("[data-iborder]"), { backgroundPositionX: "0px" }, { backgroundPositionX: "900px", duration: 7, ease: "none", repeat: -1 });

      /* picture: slow push + scroll parallax */
      gsap.to(q("[data-iimg]"), { scale: 1.14, duration: 18, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.fromTo(q("[data-ipar]"), { yPercent: -7 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      gsap.fromTo(q("[data-isweep]"), { xPercent: -200 }, { xPercent: 600, duration: 3, ease: "power2.inOut", repeat: -1, repeatDelay: 5, delay: 1 });

      /* hex outlines + dust float */
      gsap.to(q("[data-iring]"), { rotate: 360, duration: 90, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      (q("[data-idrift]") as HTMLElement[]).forEach((d, i) => {
        gsap.to(d, { y: gsap.utils.random(-30, -14), x: gsap.utils.random(-12, 12), rotate: gsap.utils.random(-40, 40), duration: gsap.utils.random(3.5, 6.5), ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.25 });
      });
      /* huge outline number drifts against the scroll */
      gsap.fromTo(q("[data-inum]"), { yPercent: 14 }, { yPercent: -14, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });

      /* cursor: picture shifts opposite, light follows */
      if (isFine()) {
        const ix = gsap.quickTo(q("[data-ishift]")[0], "x", { duration: 1, ease: "power3" });
        const iy = gsap.quickTo(q("[data-ishift]")[0], "y", { duration: 1, ease: "power3" });
        const move = (e: PointerEvent) => {
          const b = el.getBoundingClientRect();
          const nx = (e.clientX - b.left) / b.width, ny = (e.clientY - b.top) / b.height;
          ix(-(nx - 0.5) * 36); iy(-(ny - 0.5) * 24);
          el.style.setProperty("--ix", `${nx * 100}%`);
          el.style.setProperty("--iy", `${ny * 100}%`);
        };
        el.addEventListener("pointermove", move);
        cleanups.push(() => el.removeEventListener("pointermove", move));
      }
    }, el);
    return () => { cleanups.forEach((c) => c()); ctx.revert(); };
  }, []);

  return (
    <section id={id} className="section section--mist overflow-x-clip" aria-labelledby={id ? `${id}-h` : undefined}>
      <div className="wrap">
        <div ref={root} className="group relative">
          {/* animated border (light runs along the cut-corner outline) */}
          <div
            data-iborder aria-hidden
            className="absolute inset-0"
            style={{ clipPath: CUT_OUT, backgroundImage: "linear-gradient(100deg,#18b777 0%,#08794D 22%,#ffffff 50%,#08794D 78%,#18b777 100%)", backgroundSize: "900px 100%" }}
          />

          {/* frame */}
          <div className="relative m-[2px] bg-[#04130d]" style={{ clipPath: CUT_IN }}>
            {/* ---- background picture ---- */}
            <div aria-hidden className="absolute inset-0 overflow-hidden">
              <div data-ipar className="absolute inset-x-0 -inset-y-[9%]">
                <div data-ishift className="absolute -inset-6">
                  {imgOk && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img data-iimg src={image} alt="" loading="lazy" decoding="async" onError={() => setImgOk(false)} className="h-full w-full object-cover" style={{ objectPosition: "30% 60%" }} />
                  )}
                </div>
              </div>
              {!imgOk && <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_20%_70%,#0b4a33,#062a1d_55%,#03110b)]" />}
              {/* readability: dark on the heading side, lighter where the sheet sits */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#03110b]/80 via-[#03110b]/25 to-[#03110b]/55 lg:bg-gradient-to-r lg:from-[#03110b]/85 lg:via-[#03110b]/35 lg:to-[#03110b]/10" />
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(520px circle at var(--ix,30%) var(--iy,50%), rgba(24,183,119,.2), transparent 60%)" }} />
              <span data-isweep className="absolute inset-y-0 -left-1/4 w-[12%] -skew-x-[22deg] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              {/* white hex outlines + floating hexes */}
              <svg data-iring className="absolute -left-24 bottom-[-4rem] h-[420px] w-[420px] text-white/30" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1.5 3"><polygon points="50,2 92,26 92,74 50,98 8,74 8,26" /><polygon points="50,14 82,32 82,68 50,86 18,68 18,32" strokeDasharray="none" /></svg>
              {["left-[6%] top-[14%] h-5 w-[18px]", "left-[30%] top-[40%] h-3 w-[11px]", "left-[16%] bottom-[22%] h-4 w-[14px]", "left-[36%] bottom-[8%] h-6 w-[21px]"].map((c, i) => (
                <span key={i} data-idrift className={`hex absolute hidden lg:block ${c} ${i % 2 ? "bg-white/70" : "bg-white/40"} shadow-[0_0_12px_rgba(255,255,255,.55)]`} />
              ))}
            </div>

            {/* huge outline number */}
            {num && (
              <span
                data-inum aria-hidden
                className="pointer-events-none absolute bottom-3 left-4 hidden select-none font-display font-bold leading-none lg:block"
                style={{ fontSize: "clamp(7rem,15vw,13rem)", color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,.28)" }}
              >{num}</span>
            )}

            {/* ---- content ---- */}
            <div className="relative z-10 grid gap-6 p-5 pt-7 sm:p-8 sm:pt-8 lg:grid-cols-[minmax(0,4.4fr)_minmax(0,7.6fr)] lg:gap-12 lg:p-12">
              <div className="lg:min-h-0">
                <div className="lg:sticky lg:top-28">
                  {num && (
                    <p className="mb-4 inline-flex items-center gap-2.5 text-[.72rem] font-bold uppercase tracking-[.22em] text-emerald-light" data-reveal>
                      <span className="hex h-4 w-[14px] bg-emerald-light" aria-hidden />{num}
                    </p>
                  )}
                  <h2 id={id ? `${id}-h` : undefined} data-split className="!text-white">{title}</h2>
                </div>
              </div>

              <div data-isheet className="min-w-0 rounded-[24px] bg-white/[.97] p-5 shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] ring-1 ring-white/40 sm:p-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}