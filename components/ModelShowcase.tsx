"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { FEATURES, imgSrc, type CarMedia } from "@/lib/cars";
import { inline, Md } from "./Md";

export type ModelRow = { model: string; covers: string; cta: string };
export type ModelGroup = { title: string; rows: ModelRow[] };

const LINK = /\[([^\]]+)\]\(([^)]+)\)/;
const nameOf = (m: string) => LINK.exec(m)?.[1] ?? m;
const hrefOf = (m: string) => LINK.exec(m)?.[2] ?? "#";

/** "**Range Rover Engine Rebuild from £5,394 incl. VAT** · [Get Range Rover Quote](/get-a-quote/?model=range-rover)" */
function parseCta(cta: string) {
  const bold = /\*\*(.+?)\*\*/.exec(cta)?.[1] ?? "";
  const link = LINK.exec(cta);
  const m = /^(.*?)\s*from\s*(£[\d,]+)\s*(incl\. VAT)?/.exec(bold);
  return { bold, label: m?.[1] ?? bold, price: m?.[2], vat: m?.[3], quote: link ? { text: link[1], href: link[2] } : null };
}

/** "L322, L405 and L460: diesel V8, …" → chips + description */
function parseCovers(c: string) {
  const i = c.indexOf(": ");
  if (i < 0) return { chips: [] as string[], desc: c, raw: c };
  const head = c.slice(0, i);
  const chips = head.split(/,\s*|\s+and\s+/).filter(Boolean);
  const looksLikeCodes = chips.every((x) => x.length <= 8);
  return looksLikeCodes ? { chips, desc: c.slice(i + 2), raw: c } : { chips: [], desc: c, raw: c };
}

function Photo({ m, w, className = "", eager = false }: { m: CarMedia; w: number; className?: string; eager?: boolean }) {
  const [bad, setBad] = useState(false);
  if (bad)
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-forest via-[#0b5a3b] to-ink ${className}`} role="img" aria-label={m.alt}>
        <svg width="90" height="100" viewBox="0 0 90 100" aria-hidden><polygon points="45,3 85,26 85,74 45,97 5,74 5,26" fill="none" stroke="#18b777" strokeWidth="2" opacity=".6" /></svg>
      </div>
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imgSrc(m, w)} alt={m.alt} loading={eager ? "eager" : "lazy"} decoding="async" referrerPolicy="no-referrer"
      onError={() => setBad(true)} data-photo className={className} />
  );
}

function Chapter({ row, media, flip, hasVideo }: { row: ModelRow; media: CarMedia; flip: boolean; hasVideo: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const name = nameOf(row.model);
  const href = hrefOf(row.model);
  const { chips, desc } = parseCovers(row.covers);
  const c = parseCta(row.cta);
  const dark = media.variant === "dark";

  useEffect(() => {
    const el = root.current;
    const fr = frame.current;
    if (!el || !fr || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanup: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      // image frame opens up as the chapter scrolls in; photo drifts for depth
      gsap.fromTo(fr, { clipPath: "inset(10% 6% 10% 6% round 36px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none",
        scrollTrigger: { trigger: fr, start: "top 92%", end: "top 35%", scrub: 0.7 },
      });
      gsap.fromTo(q("[data-photo]"), { scale: 1.22, yPercent: -5 }, {
        scale: 1.04, yPercent: 5, ease: "none",
        scrollTrigger: { trigger: fr, start: "top bottom", end: "bottom top", scrub: 0.8 },
      });
      // giant outline word slides sideways
      gsap.fromTo(q("[data-outline]"), { xPercent: flip ? -14 : 10 }, {
        xPercent: flip ? 6 : -16, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
      });
      // light sheen sweeps across the paintwork once
      gsap.fromTo(q("[data-sheen]"), { xPercent: -140 }, {
        xPercent: 160, duration: 1.8, ease: "power2.inOut",
        scrollTrigger: { trigger: fr, start: "top 55%", once: true },
      });
      // text choreography
      gsap.from(q("[data-in]"), {
        y: 40, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.09,
        scrollTrigger: { trigger: el, start: "top 62%", once: true },
      });
      gsap.from(q("[data-chip]"), {
        scale: 0.6, opacity: 0, duration: 0.7, ease: "back.out(2)", stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 55%", once: true },
      });

      if (fine) {
        const rx = gsap.quickTo(fr, "rotationX", { duration: 0.6, ease: "power3" });
        const ry = gsap.quickTo(fr, "rotationY", { duration: 0.6, ease: "power3" });
        const move = (e: PointerEvent) => {
          const b = fr.getBoundingClientRect();
          const px = (e.clientX - b.left) / b.width;
          const py = (e.clientY - b.top) / b.height;
          ry((px - 0.5) * 9);
          rx((0.5 - py) * 6);
          fr.style.setProperty("--mx", `${px * 100}%`);
          fr.style.setProperty("--my", `${py * 100}%`);
        };
        const leave = () => { rx(0); ry(0); };
        fr.addEventListener("pointermove", move);
        fr.addEventListener("pointerleave", leave);
        cleanup.push(() => { fr.removeEventListener("pointermove", move); fr.removeEventListener("pointerleave", leave); });
      }
    }, root);
    return () => { cleanup.forEach((f) => f()); ctx.revert(); };
  }, [flip]);

  const bg = media.variant === "dark" ? "section--forest" : media.variant === "mist" ? "section--mist" : "";
  const text = (
    <div className={`relative z-10 ${flip ? "lg:order-2" : "lg:order-1"}`}>
      <p data-in className="eyebrow">Chapter {media.chapter}</p>
      <h3 data-in className={`mt-4 !text-[clamp(1.9rem,6vw,4rem)] !leading-[1.05] sm:!text-[clamp(2.2rem,6vw,4rem)] sm:!leading-[1] ${dark ? "!text-white" : ""}`}>
        <Link href={href} className="no-underline hover:underline">{name}</Link>
      </h3>

      {chips.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Generations">
          {chips.map((x) => (
            <li key={x} data-chip className={`rounded-full px-3.5 py-1.5 font-display text-sm font-bold tracking-wide ${dark ? "bg-white/10 text-emerald-light ring-1 ring-white/20" : "bg-emerald/10 text-emerald"}`}>{x}</li>
          ))}
        </ul>
      )}

      <p data-in className={`mt-5 max-w-[46ch] text-[1.05rem] leading-relaxed ${dark ? "text-white/80" : "text-[#33423b]"}`}>{chips.length ? desc : row.covers}</p>

      <div data-in className="mt-7 flex flex-wrap items-end gap-x-5 gap-y-1">
        {c.price ? (
          <p className={`leading-none ${dark ? "text-white" : "text-forest"}`}>
            <span className={`block text-[.72rem] font-bold uppercase tracking-[.16em] ${dark ? "text-emerald-light" : "text-emerald"}`}>{c.label} from</span>
            <span className="mt-1.5 block font-display text-[2.2rem] font-bold tracking-tight sm:text-[2.6rem] md:text-[3.2rem]">{c.price}</span>
            {c.vat && <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-white/60" : "text-ink/55"}`}>{c.vat}</span>}
          </p>
        ) : (
          <p className="font-display text-2xl font-bold"><Md text={`**${c.bold}**`} /></p>
        )}
      </div>

      <div data-in className="mt-7 flex flex-col gap-3 sm:flex-row">
        {c.quote && <Link href={c.quote.href} className="btn btn--primary" data-magnetic>{c.quote.text} <ArrowRight size={18} aria-hidden /></Link>}
        <Link href={href} className={`btn btn--ghost ${dark ? "!border-white/35 !text-white" : ""}`}>{name} engines</Link>
      </div>
    </div>
  );

   const picture = (
    <div className="relative" style={{ perspective: 1400 }}>
      <div ref={frame} className="group relative aspect-[4/3] w-full overflow-hidden rounded-[28px] shadow-soft ring-1 ring-black/5 lg:aspect-[5/4]" style={{ transformStyle: "preserve-3d", willChange: "transform, clip-path" }}>
        <Photo m={media} w={1800} eager={media.chapter === "01"} className="absolute inset-0 h-full w-full scale-[1.1] object-cover" />
        {hasVideo && <video data-photo className="absolute inset-0 h-full w-full scale-[1.1] object-cover" src={`/media/${media.key}.mp4`} autoPlay muted loop playsInline aria-hidden />}
        <span data-sheen aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.22), transparent 60%)" }} />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <span className="hex absolute left-4 top-4 h-9 w-8 bg-emerald" aria-hidden />
      </div>
    </div>
  );
  return (
    <div ref={root} className={`relative overflow-hidden ${bg} section`}>
      <span data-outline aria-hidden className="outline-word pointer-events-none absolute left-0 top-[14%] z-20 select-none" style={{ WebkitTextStrokeColor: dark ? "rgba(24,183,119,.45)" : "rgba(8,121,77,.32)" }} />
      <div className={`wrap relative grid items-center gap-10 lg:gap-16 ${flip ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"}`}>
        {text}
        <div className={`order-first ${flip ? "lg:order-1" : "lg:order-2"}`}>{picture}</div>
      </div>
    </div>
  );
}

export default function ModelShowcase({ intro, groups, outro, videos = [] }: { intro: string[]; groups: ModelGroup[]; outro: string[]; videos?: string[] }) {
  // Pull the three feature cars out of the groups; everything else stays in the compact list.
  const featured: { row: ModelRow; media: CarMedia }[] = [];
  const rest: ModelGroup[] = groups.map((g) => ({
    title: g.title,
    rows: g.rows.filter((r) => {
      const media = FEATURES[nameOf(r.model)];
      if (media) { featured.push({ row: r, media }); return false; }
      return true;
    }),
  }));
  featured.sort((a, b) => a.media.chapter.localeCompare(b.media.chapter));

  return (
    <>
      <div className="wrap pb-10 lg:pb-14">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">The Range Rover family</p>
          <h2 data-split id="choose-your-jaguar-land-rover-or-range-rover-model-h">Choose Your Jaguar, Land Rover or Range Rover Model</h2>
          {intro.map((t, i) => <p key={i} className="lede mt-6"><Md text={t} /></p>)}
        </div>
      </div>

      {featured.map((f, i) => (
        <Chapter key={f.media.key} row={f.row} media={f.media} flip={i % 2 === 1} hasVideo={videos.includes(f.media.key)} />
      ))}

      <div className="wrap section">
        <p className="eyebrow mb-8">More models</p>
        {rest.filter((g) => g.rows.length).map((g) => (
          <div key={g.title} className="mb-12 last:mb-0">
            <h3 className="mb-3" data-reveal>{g.title}</h3>
            <ul className="rules" data-stagger="0.06">
              {g.rows.map((r) => {
                const c = parseCta(r.cta);
                return (
                  <li key={r.model} className="group grid gap-1.5 md:grid-cols-[200px_1fr_auto] md:items-center md:gap-8">
                    <strong className="font-display text-xl text-forest transition-transform duration-300 group-hover:translate-x-1.5"><Md text={r.model} /></strong>
                    <span className="text-[.97rem] text-[#33423b]">{r.covers}</span>
                    <span className="text-[.95rem]"><Md text={r.cta} /></span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <div className="mt-10 max-w-3xl">
          {outro.map((t, i) => (i === 0 ? <p key={i} className="note"><Md text={t} /></p> : <p key={i} className="mt-5 font-semibold"><Md text={t} /></p>))}
        </div>
      </div>
    </>
  );
}