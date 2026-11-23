"use client";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { gsap } from "@/lib/gsap";

const SIDE_IMG = "/media/quote.png";

export type Service = "rebuild" | "supply-fit" | "engine-only";
const SERVICES: { v: Service; label: string; sub: string }[] = [
  { v: "rebuild", label: "Engine rebuild", sub: "Full workshop remanufacture" },
  { v: "supply-fit", label: "Supply & fit", sub: "Replacement + installation" },
  { v: "engine-only", label: "Engine only", sub: "UK-wide pallet delivery" },
];

const PLATE =
  /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}\s?[A-Z]{3}$|^[A-Z]{3}\s?[0-9]{1,3}[A-Z]$|^[0-9]{1,4}\s?[A-Z]{1,3}$|^[A-Z]{1,3}\s?[0-9]{1,4}$/;
const reduced = () =>
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Dispatches a preselect request to every QuotePanel on the page. */
export function chooseService(s: Service) {
  window.dispatchEvent(new CustomEvent("jlr:service", { detail: s }));
}

export function ServiceLinks({ labels }: { labels?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Choose your service">
      {SERVICES.map((s) => (
        <a
          key={s.v}
          href="#get-quote"
          onClick={() => chooseService(s.v)}
          className="btn btn--ghost btn--sm"
        >
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
  tone?: "light" | "dark";
  /** secondary placement: heading rendered as a paragraph so the page keeps one clean outline */
  compact?: boolean;
  /** two-column layout on desktop: intro panel + form */
  wide?: boolean;
};

export default function QuotePanel({
  id,
  model = "",
  preset = "rebuild",
  modelTab = false,
  extras = false,
  title = "Request Your Free Engine Quote",
  line = "Enter your registration and we’ll match your exact engine.",
  variants = [],
  compact = false,
  wide = false,
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
    if (!id) return;
    const h = (e: Event) => setService((e as CustomEvent<Service>).detail);
    window.addEventListener("jlr:service", h);
    return () => window.removeEventListener("jlr:service", h);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const h = (e: Event) => {
      setTab("reg");
      setReg(String((e as CustomEvent<string>).detail ?? "").toUpperCase());
    };
    window.addEventListener("jlr:reg", h);
    return () => window.removeEventListener("jlr:reg", h);
  }, [id]);

  const engineOnly = service === "engine-only";
  const cta =
    tab === "model"
      ? "Find My Engine"
      : engineOnly
        ? "Request Current Price & Availability"
        : "Get Free Quote";
  const svcIndex = Math.max(
    0,
    SERVICES.findIndex((s) => s.v === service)
  );

  /* ---------------- clean, subtle GSAP entrance & cursor spotlight ---------------- */
  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;
    const cleanups: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const once = { trigger: el, start: "top 88%", once: true };

      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", clearProps: "transform,opacity", scrollTrigger: once }
      );
      gsap.from(q("[data-qh]"), {
        y: 18,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        delay: 0.15,
        ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: once,
      });
      gsap.from(q("[data-qf]"), {
        y: 16,
        opacity: 0,
        duration: 0.65,
        stagger: 0.07,
        delay: 0.2,
        ease: "power2.out",
        clearProps: "transform,opacity",
        scrollTrigger: once,
      });

      if (isFine()) {
        const move = (e: PointerEvent) => {
          const b = el.getBoundingClientRect();
          const nx = ((e.clientX - b.left) / b.width) * 100;
          const ny = ((e.clientY - b.top) / b.height) * 100;
          el.style.setProperty("--qx", `${nx}%`);
          el.style.setProperty("--qy", `${ny}%`);
        };
        el.addEventListener("pointermove", move);
        cleanups.push(() => el.removeEventListener("pointermove", move));
      }
    }, el);

    return () => {
      cleanups.forEach((c) => c());
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!done || !el || reduced()) return;
    const q = gsap.utils.selector(el);
    gsap.fromTo(
      q("[data-qok]"),
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }
    );
  }, [done]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (tab === "reg") {
      const v = reg.replace(/\s/g, "").toUpperCase();
      if (!PLATE.test(v)) {
        setErr("Please enter a valid UK registration, e.g. AB12 CDE.");
        if (!reduced()) {
          gsap.fromTo(
            root.current?.querySelector("[data-qplate]") ?? [],
            { x: -6 },
            { x: 0, duration: 0.45, ease: "elastic.out(1.2,.35)" }
          );
        }
        return;
      }
    }
    setErr("");
    setDone(true);
  }

  const CUT =
    "[--c:14px] sm:[--c:18px] lg:[--c:26px] [clip-path:polygon(0_0,calc(100%-var(--c))_0,100%_var(--c),100%_100%,var(--c)_100%,0_calc(100%-var(--c)))]";

  const field =
    "w-full rounded-xl border border-white/15 bg-white/[0.05] px-3.5 text-sm text-white placeholder:text-white/35 min-h-[44px] sm:px-4 sm:text-base sm:min-h-[50px] transition-all duration-200 focus:border-[#3ee3a0] focus:bg-white/[0.08] focus:ring-2 focus:ring-[#3ee3a0]/25 focus:outline-none";
  const label =
    "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#3ee3a0] sm:mb-2 sm:text-[11px] sm:tracking-[0.18em]";

  const STEPS = [
    { num: "01", title: "Select your service", desc: "Rebuild, supply & fit, or engine-only" },
    { num: "02", title: "Enter registration", desc: "We verify your exact JLR engine code" },
    { num: "03", title: "Written quotation", desc: "Clear breakdown with no hidden extras" },
  ];

  const head = (
    <div
      className={`relative flex flex-col justify-between bg-[#05160f] p-4 text-white sm:p-8 ${
        wide ? "lg:p-11" : ""
      }`}
    >
      {/* Subtle top emerald accent bar */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-[3px] w-20 bg-gradient-to-r from-[#3ee3a0] to-[#08794D] sm:w-24"
      />

      <div>
        <div
          data-qh
          className="inline-flex items-center gap-1.5 rounded-full border border-[#3ee3a0]/25 bg-[#3ee3a0]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#3ee3a0] sm:gap-2 sm:px-3 sm:py-1 sm:text-[11px] sm:tracking-[0.18em]"
        >
          <Sparkles size={11} aria-hidden />
          <span>Free Written Quotation</span>
        </div>

        {compact ? (
          <p
            data-qh
            className="mt-3 font-display text-xl font-extrabold leading-tight tracking-tight text-white sm:mt-4 sm:text-[1.85rem]"
          >
            {title}
          </p>
        ) : (
          <h2
            data-qh
            className="mt-3 !text-xl !font-extrabold !leading-tight !tracking-tight !text-white sm:mt-4 sm:!text-[1.95rem]"
          >
            {title}
          </h2>
        )}

        <p data-qh className="mt-2 text-xs leading-relaxed text-white/75 sm:mt-3 sm:text-[0.95rem]">
          {line}
        </p>

        {/* Compact step list on mobile, full spacing on sm+ */}
        <ol data-qh className="mt-5 space-y-2.5 border-t border-white/10 pt-4 sm:mt-8 sm:space-y-4 sm:pt-7">
          {STEPS.map((step) => (
            <li key={step.num} className="flex items-start gap-2.5 sm:gap-3.5">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#3ee3a0]/35 bg-[#3ee3a0]/10 font-display text-[11px] font-bold text-[#3ee3a0] sm:h-7 sm:w-7 sm:rounded-lg sm:text-xs">
                {step.num}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white sm:text-sm">{step.title}</p>
                <p className="text-[11px] text-white/60 sm:text-xs">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div
        data-qh
        className="mt-5 flex items-center gap-2 border-t border-white/10 pt-3.5 text-[11px] font-medium text-white/75 sm:mt-8 sm:gap-2.5 sm:pt-5 sm:text-xs"
      >
        <ShieldCheck size={15} aria-hidden className="shrink-0 text-[#3ee3a0]" />
        <span>No obligation · Direct workshop quote · Zero spam</span>
      </div>
    </div>
  );

  return (
    <div id={id} ref={root} className="quote-panel relative min-w-0 scroll-mt-24 sm:scroll-mt-28">
      {/* Subtle outer ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl bg-emerald/15 opacity-60 blur-2xl sm:-inset-3"
      />

      {/* Crisp chamfered frame with subtle emerald border */}
      <div className={`bg-[#3ee3a0]/30 p-[1px] shadow-[0_28px_70px_-20px_rgba(3,19,12,0.65)] ${CUT}`}>
        <div
          className={`relative min-w-0 overflow-hidden bg-[#071c14] ${CUT} ${
            wide ? "lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""
          }`}
        >
          {/* Subtle cursor spotlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 [.quote-panel:hover_&]:opacity-100"
            style={{
              background:
                "radial-gradient(500px circle at var(--qx,50%) var(--qy,30%), rgba(62,227,160,0.08), transparent 65%)",
            }}
          />

          {head}

          {/* Right / Form Column with subtle engine watermark */}
          <div className="relative isolate flex min-w-0 flex-col justify-center border-t border-white/10 bg-[#081f16] p-4 sm:p-8 lg:border-l lg:border-t-0 lg:p-11">
            {imgOk && (
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={SIDE_IMG}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={() => setImgOk(false)}
                  className="h-full w-full object-cover object-right opacity-20 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#081f16] via-[#081f16]/90 to-[#081f16]/70" />
              </div>
            )}

            <div className="relative z-[1] min-w-0">
              {done ? (
                <div
                  data-qok
                  role="status"
                  className="rounded-2xl border border-[#3ee3a0]/30 bg-[#05160f]/90 p-5 text-white backdrop-blur-md sm:p-6"
                >
                  <p className="font-display text-base font-bold text-[#3ee3a0] sm:text-lg">
                    Enquiry captured (demo)
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-white/80 sm:text-sm">
                    This is a safe demo interaction: nothing has been sent and no price is
                    generated. A live build posts to the existing lead API.
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#3ee3a0] underline underline-offset-4 hover:text-white sm:text-sm"
                    onClick={() => setDone(false)}
                  >
                    Start again
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="space-y-4 sm:space-y-6">
                  {modelTab && (
                    <div
                      data-qf
                      role="tablist"
                      aria-label="How to identify your vehicle"
                      className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-[#04120c] p-1 sm:gap-1.5 sm:p-1.5"
                    >
                      {(
                        [
                          ["reg", "By registration"],
                          ["model", "By model & variant"],
                        ] as const
                      ).map(([k, t]) => (
                        <button
                          key={k}
                          type="button"
                          role="tab"
                          aria-selected={tab === k}
                          onClick={() => {
                            setTab(k);
                            setErr("");
                          }}
                          className={`min-h-[38px] rounded-lg px-2 text-[11px] font-bold tracking-wide transition-all duration-200 sm:min-h-[42px] sm:px-3 sm:text-sm ${
                            tab === k
                              ? "bg-[#0e3a28] text-[#3ee3a0] shadow-sm ring-1 ring-[#3ee3a0]/35"
                              : "text-white/65 hover:text-white"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Compact Segmented Service Selector on Mobile */}
                  <fieldset data-qf className="min-w-0">
                    <legend className={label}>Select Service</legend>
                    <div className="relative grid grid-cols-3 rounded-xl border border-white/12 bg-[#04120c] p-1">
                      <span
                        aria-hidden
                        className="absolute bottom-1 left-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-lg bg-gradient-to-r from-[#08794D] to-[#12a368] shadow-[0_4px_14px_-4px_rgba(20,181,116,0.75)] transition-transform duration-300 ease-out"
                        style={{ transform: `translateX(${svcIndex * 100}%)` }}
                      />
                      {SERVICES.map((s) => {
                        const on = service === s.v;
                        return (
                          <label
                            key={s.v}
                            className={`relative z-10 flex min-h-[38px] cursor-pointer items-center justify-center rounded-lg px-1.5 text-center text-[11px] font-bold leading-tight transition-colors duration-200 sm:min-h-[46px] sm:px-2 sm:text-[13px] ${
                              on ? "text-white" : "text-white/65 hover:text-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`${uid}-svc`}
                              className="sr-only"
                              checked={on}
                              onChange={() => setService(s.v)}
                            />
                            <span>{s.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Compact Registration or Model Input on Mobile */}
                  {tab === "reg" ? (
                    <div data-qf className="min-w-0">
                      <label htmlFor={`${uid}-reg`} className={label}>
                        Vehicle Registration
                      </label>
                      <div
                        data-qplate
                        className="flex min-h-[48px] overflow-hidden rounded-xl border-2 border-[#d4b100] bg-[#ffd800] text-ink shadow-[0_10px_24px_-12px_rgba(0,0,0,0.65)] transition-all duration-200 focus-within:ring-4 focus-within:ring-[#3ee3a0]/35 sm:min-h-[60px]"
                      >
                        <span
                          aria-hidden
                          className="grid w-9 shrink-0 place-items-center bg-[#0b3a99] text-[9px] font-extrabold tracking-wider text-[#ffd800] sm:w-11 sm:text-[10px]"
                        >
                          GB
                        </span>
                        <input
                          id={`${uid}-reg`}
                          value={reg}
                          onChange={(e) => setReg(e.target.value.toUpperCase())}
                          inputMode="text"
                          autoCapitalize="characters"
                          autoComplete="off"
                          spellCheck={false}
                          placeholder="AB12 CDE"
                          aria-invalid={!!err}
                          aria-describedby={err ? `${uid}-err` : undefined}
                          className="w-full min-w-0 bg-transparent px-2.5 text-center font-display text-lg font-extrabold uppercase tracking-[0.12em] text-ink placeholder:text-ink/35 focus:outline-none sm:px-3 sm:text-[1.75rem] sm:tracking-[0.16em]"
                        />
                      </div>
                      {err && (
                        <p id={`${uid}-err`} role="alert" className="mt-1.5 text-xs font-semibold text-red-400">
                          {err}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div data-qf className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5">
                      <div className="sm:col-span-2">
                        <label htmlFor={`${uid}-m`} className={label}>
                          Model
                        </label>
                        <input id={`${uid}-m`} defaultValue={model} className={field} />
                      </div>
                      <div>
                        <label htmlFor={`${uid}-y`} className={label}>
                          Year
                        </label>
                        <input id={`${uid}-y`} inputMode="numeric" placeholder="2018" className={field} />
                      </div>
                      <div>
                        <label htmlFor={`${uid}-v`} className={label}>
                          Engine or badge
                        </label>
                        <input
                          id={`${uid}-v`}
                          list={`${uid}-vl`}
                          placeholder="e.g. 3.0 SDV6"
                          className={field}
                        />
                        <datalist id={`${uid}-vl`}>
                          {variants.map((v) => (
                            <option key={v} value={v} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  )}

                  {/* Optional Details Drawer */}
                  {extras && (
                    <details
                      data-qf
                      className="group rounded-xl border border-white/12 bg-[#04120c]/75 px-3.5 transition-colors open:border-[#3ee3a0]/30 sm:px-4"
                    >
                      <summary className="flex min-h-[42px] cursor-pointer list-none items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider text-white/85 sm:min-h-[48px] sm:text-[13px]">
                        <span>Add contact details &amp; symptoms (optional)</span>
                        <span
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/10 text-[#3ee3a0] transition-transform duration-200 group-open:rotate-45"
                          aria-hidden
                        >
                          +
                        </span>
                      </summary>
                      <div className="mb-3.5 mt-2 grid gap-3 border-t border-white/10 pt-3 sm:mb-4 sm:gap-3.5 sm:grid-cols-2 sm:pt-3.5">
                        <div>
                          <label htmlFor={`${uid}-n`} className={label}>
                            Name
                          </label>
                          <input id={`${uid}-n`} autoComplete="name" className={field} />
                        </div>
                        <div>
                          <label htmlFor={`${uid}-t`} className={label}>
                            Telephone
                          </label>
                          <input id={`${uid}-t`} type="tel" autoComplete="tel" className={field} />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor={`${uid}-e`} className={label}>
                            Email
                          </label>
                          <input id={`${uid}-e`} type="email" autoComplete="email" className={field} />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor={`${uid}-s`} className={label}>
                            Symptoms
                          </label>
                          <textarea id={`${uid}-s`} rows={3} className={`${field} py-2.5 sm:py-3`} />
                        </div>
                        <div>
                          <label htmlFor={`${uid}-vin`} className={label}>
                            VIN or engine code
                          </label>
                          <input id={`${uid}-vin`} className={field} />
                        </div>
                        <div>
                          <label htmlFor={`${uid}-pc`} className={label}>
                            Postcode
                          </label>
                          <input id={`${uid}-pc`} autoComplete="postal-code" className={field} />
                        </div>
                      </div>
                    </details>
                  )}

                  {/* Compact Primary Submit CTA on Mobile */}
                  <button
                    data-qf
                    type="submit"
                    className="btn btn--primary w-full !min-h-[46px] !rounded-xl !bg-gradient-to-r !from-[#08794D] !to-[#14b574] !text-sm !font-bold !tracking-wide !shadow-[0_12px_28px_-8px_rgba(20,181,116,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:!shadow-[0_16px_34px_-6px_rgba(20,181,116,0.85)] sm:!min-h-[56px] sm:!text-base"
                    data-magnetic
                  >
                    <span className="inline-flex items-center gap-2">
                      {cta} <ArrowRight size={17} aria-hidden />
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}