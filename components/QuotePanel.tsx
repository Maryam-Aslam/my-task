"use client";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { gsap } from "@/lib/gsap";

/* ✏️ Optional picture for the green side panel (put in /public/media). Missing file = gradient only. */
const SIDE_IMG = "/media/quote.png";

export type Service = "rebuild" | "supply-fit" | "engine-only";
const SERVICES: { v: Service; label: string }[] = [
  { v: "rebuild", label: "Engine rebuild" },
  { v: "supply-fit", label: "Supply & fit" },
  { v: "engine-only", label: "Engine only (supply)" },
];

const PLATE = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}\s?[A-Z]{3}$|^[A-Z]{3}\s?[0-9]{1,3}[A-Z]$|^[0-9]{1,4}\s?[A-Z]{1,3}$|^[A-Z]{1,3}\s?[0-9]{1,4}$/;
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Dispatches a preselect request to every QuotePanel on the page. */
export function chooseService(s: Service) {
  window.dispatchEvent(new CustomEvent("jlr:service", { detail: s }));
}

export function ServiceLinks({ labels }: { labels?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Choose your service">
      {SERVICES.map((s) => (
        <a key={s.v} href="#get-quote" onClick={() => chooseService(s.v)} className="btn btn--ghost btn--sm">
          {s.label}
        </a>
      ))}
      {labels ? null : null}
    </div>
  );
}

type Props = {
  id?: string;
  model?: string;
  preset?: Service;
  /** show model/variant tab (Range Rover Sport page) */
  modelTab?: boolean;
  /** extra optional lead fields (homepage) */
  extras?: boolean;
  title?: string;
  line?: string;
  variants?: string[];
  tone?: "light" | "dark"; // kept for compatibility — the panel is now one dark design everywhere
  /** secondary placement: heading rendered as a paragraph so the page keeps one clean outline */
  compact?: boolean;
  /** two-column layout on desktop: intro panel + form */
  wide?: boolean;
};

export default function QuotePanel({
  id, model = "", preset = "rebuild", modelTab = false, extras = false,
  title = "Request Your Free Engine Quote",
  line = "Enter your registration and we’ll match your exact engine.",
  variants = [], compact = false, wide = false,
}: Props) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"reg" | "model">("reg");
  const [service, setService] = useState<Service>(preset);
  const [reg, setReg] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    if (!id) return; // only the primary panel reacts to the service buttons
    const h = (e: Event) => setService((e as CustomEvent<Service>).detail);
    window.addEventListener("jlr:service", h);
    return () => window.removeEventListener("jlr:service", h);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const h = (e: Event) => { setTab("reg"); setReg(String((e as CustomEvent<string>).detail ?? "").toUpperCase()); };
    window.addEventListener("jlr:reg", h);
    return () => window.removeEventListener("jlr:reg", h);
  }, [id]);

  const engineOnly = service === "engine-only";
  const cta = tab === "model" ? "Find My Engine" : engineOnly ? "Request Current Price & Availability" : "Get Free Quote";
  const svcIndex = Math.max(0, SERVICES.findIndex((s) => s.v === service));

  /* ---------------- animation: scroll entrance, idle motion, cursor ---------------- */
  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const once = { trigger: el, start: "top 86%", once: true };

      gsap.fromTo(el, { y: 70, opacity: 0, rotateX: 8, transformPerspective: 1400, transformOrigin: "50% 100%" },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.2, ease: "expo.out", clearProps: "transform,opacity", scrollTrigger: once });
      gsap.from(q("[data-qh]"), { y: 26, opacity: 0, duration: 0.9, stagger: 0.12, delay: 0.25, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: once });
      gsap.from(q("[data-qf]"), { y: 24, opacity: 0, duration: 0.8, stagger: 0.1, delay: 0.35, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: once });

      /* side panel: slow rotating rings, drifting hexes, image push, light sweep */
      gsap.to(q("[data-qring]"), { rotate: 360, duration: 60, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      gsap.to(q("[data-qring2]"), { rotate: -360, duration: 90, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      (q("[data-qdrift]") as HTMLElement[]).forEach((d, i) => {
        gsap.to(d, { y: gsap.utils.random(-22, -10), x: gsap.utils.random(-10, 10), rotate: gsap.utils.random(-30, 30), duration: gsap.utils.random(3.5, 6), ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.25 });
      });
      gsap.to(q("[data-qimg]"), { scale: 1.12, duration: 16, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(q("[data-qimgwrap]"), { yPercent: 8, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      gsap.fromTo(q("[data-qsweep]"), { xPercent: -200 }, { xPercent: 500, duration: 2.6, ease: "power2.inOut", repeat: -1, repeatDelay: 5, delay: 1.5 });

      /* animated gradient border */
      gsap.fromTo(q("[data-qborder]"), { backgroundPositionX: "0%" }, { backgroundPositionX: "300%", duration: 7, ease: "none", repeat: -1 });

      /* button shine + backdrop glow */
      gsap.fromTo(q("[data-qshine]"), { xPercent: -200 }, { xPercent: 500, duration: 1.6, ease: "power2.inOut", repeat: -1, repeatDelay: 3.2, delay: 2 });
      gsap.to(q("[data-qglow]"), { scale: 1.2, opacity: 0.9, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      (q("[data-qfloat]") as HTMLElement[]).forEach((d, i) => {
        gsap.to(d, { y: gsap.utils.random(-40, -20), x: gsap.utils.random(-16, 16), rotate: gsap.utils.random(-40, 40), duration: gsap.utils.random(4, 7), ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.3 });
      });

      /* cursor: light on the panel + image drifts opposite */
      if (isFine()) {
        const ix = gsap.quickTo(q("[data-qimgwrap2]")[0] ?? el, "x", { duration: 1, ease: "power3" });
        const iy = gsap.quickTo(q("[data-qimgwrap2]")[0] ?? el, "y", { duration: 1, ease: "power3" });
        const move = (e: PointerEvent) => {
          const b = el.getBoundingClientRect();
          const nx = (e.clientX - b.left) / b.width, ny = (e.clientY - b.top) / b.height;
          el.style.setProperty("--qx", `${nx * 100}%`);
          el.style.setProperty("--qy", `${ny * 100}%`);
          if (q("[data-qimgwrap2]")[0]) { ix(-(nx - 0.5) * 30); iy(-(ny - 0.5) * 20); }
        };
        el.addEventListener("pointermove", move);
        cleanups.push(() => el.removeEventListener("pointermove", move));
      }
    }, el);
    return () => { cleanups.forEach((c) => c()); ctx.revert(); };
  }, []);

  /* success: check draws itself, hexes burst out */
  useEffect(() => {
    const el = root.current;
    if (!done || !el || reduced()) return;
    const q = gsap.utils.selector(el);
    gsap.fromTo(q("[data-qok]"), { y: 20, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "expo.out" });
    gsap.fromTo(q("[data-qtick]"), { strokeDashoffset: 30 }, { strokeDashoffset: 0, duration: 0.8, delay: 0.25, ease: "power2.out" });
    gsap.fromTo(q("[data-qburst]"), { x: 0, y: 0, scale: 0, opacity: 1 }, {
      x: () => gsap.utils.random(-120, 120), y: () => gsap.utils.random(-90, 60), scale: () => gsap.utils.random(0.8, 1.6), opacity: 0,
      rotate: () => gsap.utils.random(-120, 120), duration: 1.3, stagger: 0.03, ease: "power3.out",
    });
  }, [done]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (tab === "reg") {
      const v = reg.replace(/\s/g, "").toUpperCase();
      if (!PLATE.test(v)) {
        setErr("Please enter a valid UK registration, e.g. AB12 CDE.");
        if (!reduced()) gsap.fromTo(root.current?.querySelector("[data-qplate]") ?? [], { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1.2,.3)" });
        return;
      }
    }
    setErr(""); setDone(true);
  }

  const CUT = "[--c:22px] lg:[--c:32px] [clip-path:polygon(0_0,calc(100%-var(--c))_0,100%_var(--c),100%_100%,var(--c)_100%,0_calc(100%-var(--c)))]";

  const field = "w-full rounded-xl border border-white/20 bg-white/[.06] px-4 text-base text-white placeholder:text-white/40 min-h-[52px] transition focus:border-emerald-light focus:bg-white/10 focus:shadow-[0_0_0_4px_rgba(62,227,160,.2)] focus:outline-none";
  const label = "mb-1.5 block text-[.72rem] font-bold uppercase tracking-[.16em] text-[#3ee3a0]";

  const STEPS = ["Choose your service", "Enter your registration", "Receive a written quotation"];

  const head = (
    <div className={`relative isolate overflow-hidden p-6 text-white sm:p-8 ${wide ? "lg:flex lg:flex-col lg:justify-between lg:p-10" : ""}`}>
      {/* photo + scrims */}
      {imgOk && (
        <div data-qimgwrap className="absolute inset-0 -z-10">
          <div data-qimgwrap2 className="absolute -inset-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-qimg src={SIDE_IMG} alt="" loading="lazy" decoding="async" onError={() => setImgOk(false)} className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#03130c]/92 via-[#05301f]/78 to-[#08794D]/55" />
        </div>
      )}
      {!imgOk && <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-[#03130c] via-[#05301f] to-[#08794D]" />}

      {/* rotating hex rings + hex lattice */}
      <svg data-qring aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 text-white/25" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1.5 3"><polygon points="50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5" /></svg>
      <svg data-qring2 aria-hidden className="pointer-events-none absolute -right-9 -top-9 h-56 w-56 text-[#3ee3a0]/30" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.6"><polygon points="50,18 78,34 78,66 50,82 22,66 22,34" /></svg>
      <svg aria-hidden className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 text-white/[.06]" viewBox="0 0 100 100" fill="currentColor"><polygon points="50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5" /></svg>
      {["left-[62%] top-[58%] h-4 w-[14px]", "left-[78%] top-[30%] h-3 w-[11px]", "left-[48%] top-[14%] h-3.5 w-3", "left-[86%] top-[72%] h-5 w-[18px]"].map((c, i) => (
        <span key={i} data-qdrift aria-hidden className={`hex pointer-events-none absolute ${c} ${i % 2 ? "bg-white/70" : "bg-[#3ee3a0]/60"} shadow-[0_0_12px_rgba(255,255,255,.55)]`} />
      ))}
      <span data-qsweep aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/4 w-[18%] -skew-x-[22deg] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative">
        <p data-qh className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[.22em] text-[#3ee3a0]">
          <span aria-hidden className="hex h-2.5 w-2.5 bg-[#3ee3a0]" /> Free written quotation
        </p>
        {compact ? (
          <p data-qh className="mt-3 font-display text-[1.55rem] font-extrabold leading-[1.1] text-white sm:text-[1.9rem]">{title}</p>
        ) : (
          <h2 data-qh className="mt-3 !text-[1.55rem] !font-extrabold !leading-[1.1] !text-white sm:!text-[1.9rem]">{title}</h2>
        )}
        <p data-qh className="mt-3 text-[.95rem] leading-relaxed text-white/80">{line}</p>
      </div>

      {/* 3-step path */}
      <ol data-qh className="relative mt-7 space-y-0 lg:mt-10">
        {STEPS.map((t, i) => (
          <li key={t} className="relative flex items-center gap-4 pb-5 last:pb-0">
            {i < STEPS.length - 1 && <span aria-hidden className="absolute left-[17px] top-9 h-[calc(100%-1.4rem)] w-px bg-gradient-to-b from-[#3ee3a0]/60 to-white/10" />}
            <span className="hex grid h-9 w-8 shrink-0 place-items-center bg-[#3ee3a0] text-[.8rem] font-extrabold text-[#03130c]">{i + 1}</span>
            <span className="text-sm font-semibold text-white/90">{t}</span>
          </li>
        ))}
      </ol>

      <p data-qh className="relative mt-6 flex items-center gap-2 text-[.82rem] font-semibold text-white/85 lg:mt-8">
        <ShieldCheck size={16} aria-hidden className="text-[#3ee3a0]" /> Free, no obligation. Secure enquiry, no spam.
      </p>
    </div>
  );

  return (
    <div
      id={id}
      ref={root}
      className="quote-panel relative scroll-mt-28 drop-shadow-[0_40px_50px_rgba(6,60,41,.35)]"
    >
      {/* soft glow behind the panel */}
      <div aria-hidden className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 hidden sm:block">
        <span data-qglow className="absolute left-[8%] top-0 h-48 w-48 rounded-full bg-emerald-light/30 blur-[70px]" />
        <span data-qglow className="absolute bottom-0 right-[6%] h-56 w-56 rounded-full bg-emerald/25 blur-[80px]" />
        {["left-0 top-[18%] h-6 w-[21px]", "right-0 top-[40%] h-8 w-7", "left-[4%] bottom-[8%] h-4 w-[14px]", "right-[10%] top-[2%] h-4 w-[14px]"].map((c, i) => (
          <span key={i} data-qfloat className={`hex absolute ${c} ${i % 2 ? "bg-emerald/35" : "bg-emerald-light/50"}`} />
        ))}
      </div>

      {/* animated gradient border (cut corners) */}
      <div
        data-qborder
        className={`p-[1.5px] ${CUT}`}
        style={{ backgroundImage: "linear-gradient(110deg,#08794D 0%,#3ee3a0 14%,#ffffff 22%,#3ee3a0 30%,#08794D 45%,#08794D 100%)", backgroundSize: "300% 100%" }}
      >
        <div className={`relative overflow-hidden bg-[#04140e] ${CUT} ${wide ? "lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}>
          {/* cursor light */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 [.quote-panel:hover_&]:opacity-100" style={{ background: "radial-gradient(420px circle at var(--qx,50%) var(--qy,30%), rgba(62,227,160,.10), transparent 60%)" }} />

          {head}

          <div className="relative z-[1] border-t border-white/10 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
            {done ? (
              <div data-qok role="status" className="relative overflow-hidden rounded-2xl bg-emerald/15 p-5 text-white ring-1 ring-emerald-light/30">
                <div className="relative flex items-center gap-3">
                  <span className="relative grid h-11 w-11 place-items-center rounded-full bg-emerald text-white">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path data-qtick d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="30" strokeDashoffset="0" /></svg>
                    {Array.from({ length: 10 }).map((_, i) => <span key={i} data-qburst aria-hidden className="hex absolute left-1/2 top-1/2 h-2.5 w-[9px] bg-emerald-light opacity-0" />)}
                  </span>
                  <p className="font-display text-lg font-bold">Enquiry captured (demo)</p>
                </div>
                <p className="mt-3 text-sm text-white/80">This is a safe demo interaction: nothing has been sent and no price is generated. A live build posts to the existing lead API.</p>
                <button className="mt-3 text-sm font-semibold text-[#3ee3a0] underline underline-offset-4" onClick={() => setDone(false)}>Start again</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                {modelTab && (
                  <div data-qf role="tablist" aria-label="How to identify your vehicle" className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-white/[.07] p-1 ring-1 ring-white/15">
                    {([["reg", "Enter your registration"], ["model", "Choose your model & variant"]] as const).map(([k, t]) => (
                      <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setErr(""); }}
                        className={`min-h-[44px] rounded-full px-2 text-[.8rem] font-bold leading-tight transition-all duration-300 ${tab === k ? "bg-gradient-to-r from-[#08794D] to-[#14b574] text-white shadow-[0_6px_16px_-6px_rgba(20,181,116,.8)]" : "text-white/75 hover:text-white"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}

                <fieldset data-qf className="mb-5">
                  <legend className={label}>Service</legend>
                  <div className="relative grid grid-cols-3 rounded-2xl bg-white/[.07] p-1 ring-1 ring-white/15">
                    <span
                      aria-hidden
                      className="absolute bottom-1 left-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-xl bg-gradient-to-r from-[#08794D] to-[#14b574] shadow-[0_8px_20px_-6px_rgba(20,181,116,.8)] transition-transform duration-500 [transition-timing-function:cubic-bezier(.3,1.3,.5,1)]"
                      style={{ transform: `translateX(${svcIndex * 100}%)` }}
                    />
                    {SERVICES.map((s) => {
                      const on = service === s.v;
                      return (
                        <label key={s.v} className={`relative z-10 flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl px-1.5 text-center text-[.78rem] font-bold leading-tight transition-colors duration-300 focus-within:ring-2 focus-within:ring-[#3ee3a0] ${on ? "text-white" : "text-white/70 hover:text-white"}`}>
                          <input type="radio" name={`${uid}-svc`} className="sr-only" checked={on} onChange={() => setService(s.v)} />
                          {s.label}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {tab === "reg" ? (
                  <div data-qf>
                    <label htmlFor={`${uid}-reg`} className={label}>Registration</label>
                    <div data-qplate className="flex min-h-[68px] overflow-hidden rounded-xl border-2 border-[#d9b800] bg-[#ffd800] text-ink shadow-[inset_0_2px_0_rgba(255,255,255,.55),0_14px_28px_-14px_rgba(0,0,0,.6)] transition-all duration-300 focus-within:scale-[1.015] focus-within:shadow-[0_0_0_4px_rgba(62,227,160,.4),0_18px_34px_-14px_rgba(0,0,0,.6)]">
                      <span aria-hidden className="grid w-10 shrink-0 place-items-center bg-[#0b3a99] text-[.62rem] font-extrabold leading-none text-[#ffd800]">GB</span>
                      <input id={`${uid}-reg`} value={reg} onChange={(e) => setReg(e.target.value.toUpperCase())} inputMode="text" autoCapitalize="characters" autoComplete="off" spellCheck={false}
                        placeholder="AB12 CDE" aria-invalid={!!err} aria-describedby={err ? `${uid}-err` : undefined}
                        className="w-full min-w-0 bg-transparent px-3 text-center font-display text-[1.8rem] font-bold uppercase tracking-[.14em] text-ink placeholder:text-ink/35 focus:outline-none" />
                    </div>
                    {err && <p id={`${uid}-err`} role="alert" className="mt-2 text-sm font-semibold text-red-400">{err}</p>}
                  </div>
                ) : (
                  <div data-qf className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label htmlFor={`${uid}-m`} className={label}>Model</label>
                      <input id={`${uid}-m`} defaultValue={model} className={field} />
                    </div>
                    <div>
                      <label htmlFor={`${uid}-y`} className={label}>Year</label>
                      <input id={`${uid}-y`} inputMode="numeric" placeholder="2018" className={field} />
                    </div>
                    <div>
                      <label htmlFor={`${uid}-v`} className={label}>Engine or badge</label>
                      <input id={`${uid}-v`} list={`${uid}-vl`} placeholder="e.g. 3.0 SDV6" className={field} />
                      <datalist id={`${uid}-vl`}>{variants.map((v) => <option key={v} value={v} />)}</datalist>
                    </div>
                  </div>
                )}

                {extras && (
                  <details data-qf className="group mt-5 rounded-xl border border-dashed border-white/25 px-4 transition-colors open:bg-white/[.04]">
                    <summary className="flex min-h-[50px] cursor-pointer list-none items-center justify-between text-sm font-bold text-white">
                      Add your details &amp; symptoms (optional)
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#3ee3a0]/15 text-[#3ee3a0] transition-transform duration-300 group-open:rotate-45" aria-hidden>+</span>
                    </summary>
                    <div className="mb-4 mt-2 grid gap-3 sm:grid-cols-2">
                      <div><label htmlFor={`${uid}-n`} className={label}>Name</label><input id={`${uid}-n`} autoComplete="name" className={field} /></div>
                      <div><label htmlFor={`${uid}-t`} className={label}>Telephone</label><input id={`${uid}-t`} type="tel" autoComplete="tel" className={field} /></div>
                      <div className="sm:col-span-2"><label htmlFor={`${uid}-e`} className={label}>Email</label><input id={`${uid}-e`} type="email" autoComplete="email" className={field} /></div>
                      <div className="sm:col-span-2"><label htmlFor={`${uid}-s`} className={label}>Symptoms</label><textarea id={`${uid}-s`} rows={3} className={`${field} py-3`} /></div>
                      <div><label htmlFor={`${uid}-vin`} className={label}>VIN or engine code</label><input id={`${uid}-vin`} className={field} /></div>
                      <div><label htmlFor={`${uid}-pc`} className={label}>Postcode</label><input id={`${uid}-pc`} autoComplete="postal-code" className={field} /></div>
                    </div>
                  </details>
                )}

                <button data-qf type="submit" className="btn btn--primary relative mt-6 w-full overflow-hidden !min-h-[58px] !bg-gradient-to-r !from-[#08794D] !to-[#14b574] !text-base" data-magnetic>
                  <span data-qshine aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-[22deg] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  <span className="relative inline-flex items-center gap-2">{cta} <ArrowRight size={18} aria-hidden /></span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}