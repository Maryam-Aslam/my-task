"use client";
import { useEffect, useId, useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

export type Service = "rebuild" | "supply-fit" | "engine-only";
const SERVICES: { v: Service; label: string }[] = [
  { v: "rebuild", label: "Engine rebuild" },
  { v: "supply-fit", label: "Supply & fit" },
  { v: "engine-only", label: "Engine only (supply)" },
];

const PLATE = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}\s?[A-Z]{3}$|^[A-Z]{3}\s?[0-9]{1,3}[A-Z]$|^[0-9]{1,4}\s?[A-Z]{1,3}$|^[A-Z]{1,3}\s?[0-9]{1,4}$/;

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
  tone?: "light" | "dark";
  /** secondary placement: heading rendered as a paragraph so the page keeps one clean outline */
  compact?: boolean;
};

export default function QuotePanel({
  id, model = "", preset = "rebuild", modelTab = false, extras = false,
  title = "Request Your Free Engine Quote",
  line = "Enter your registration and we’ll match your exact engine.",
  variants = [], tone = "light", compact = false,
}: Props) {
  const uid = useId();
  const [tab, setTab] = useState<"reg" | "model">("reg");
  const [service, setService] = useState<Service>(preset);
  const [reg, setReg] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!id) return; // only the primary panel reacts to the service buttons
    const h = (e: Event) => setService((e as CustomEvent<Service>).detail);
    window.addEventListener("jlr:service", h);
    return () => window.removeEventListener("jlr:service", h);
  }, [id]);

  const engineOnly = service === "engine-only";
  const cta = tab === "model" ? "Find My Engine" : engineOnly ? "Request Current Price & Availability" : "Get Free Quote";
  const dark = tone === "dark";

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (tab === "reg") {
      const v = reg.replace(/\s/g, "").toUpperCase();
      if (!PLATE.test(v)) { setErr("Please enter a valid UK registration, e.g. AB12 CDE."); return; }
    }
    setErr(""); setDone(true);
  }

  const field = `w-full rounded-xl border bg-white px-4 text-base text-ink placeholder:text-ink/40 min-h-[52px] ${dark ? "border-white/20" : "border-forest/20"} focus:border-emerald`;
  const label = `mb-1.5 block text-[.72rem] font-bold uppercase tracking-[.14em] ${dark ? "text-white/70" : "text-emerald"}`;

  return (
    <div
      id={id}
      className={`quote-panel relative scroll-mt-28 rounded-[28px] p-5 sm:p-7 ${dark ? "bg-white/[.07] text-white ring-1 ring-white/15" : "bg-white shadow-soft ring-1 ring-forest/10"}`}
    >
      <span aria-hidden className="hex pointer-events-none absolute -right-3 -top-3 h-10 w-9 bg-emerald" />
      {compact ? (
        <p className={`font-display text-[1.45rem] font-bold leading-tight sm:text-[1.7rem] ${dark ? "text-white" : "text-forest"}`}>{title}</p>
      ) : (
        <h2 className={`!text-[1.45rem] !leading-tight sm:!text-[1.7rem] ${dark ? "!text-white" : ""}`}>{title}</h2>
      )}
      <p className={`mt-1.5 text-[.95rem] ${dark ? "text-white/80" : "text-ink/70"}`}>{line}</p>

      {done ? (
        <div role="status" className="mt-6 rounded-2xl bg-emerald/10 p-5 text-forest">
          <p className="flex items-center gap-2 font-bold"><Check size={18} /> Enquiry captured (demo)</p>
          <p className="mt-2 text-sm text-forest/80">This is a safe demo interaction: nothing has been sent and no price is generated. A live build posts to the existing lead API.</p>
          <button className="link mt-3 text-sm" onClick={() => setDone(false)}>Start again</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-5">
          {modelTab && (
            <div role="tablist" aria-label="How to identify your vehicle" className={`mb-5 grid grid-cols-2 gap-1 rounded-full p-1 ${dark ? "bg-white/10" : "bg-mist ring-1 ring-forest/10"}`}>
              {([["reg", "Enter your registration"], ["model", "Choose your model & variant"]] as const).map(([k, t]) => (
                <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setErr(""); }}
                  className={`min-h-[44px] rounded-full px-2 text-[.8rem] font-bold leading-tight transition-colors ${tab === k ? "bg-forest text-white" : dark ? "text-white/80" : "text-forest"}`}>
                  {t}
                </button>
              ))}
            </div>
          )}

          <fieldset className="mb-4">
            <legend className={label}>Service</legend>
            <div className="grid grid-cols-3 gap-1.5">
              {SERVICES.map((s) => (
                <label key={s.v} className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border px-1.5 text-center text-[.78rem] font-bold leading-tight transition-colors ${service === s.v ? "border-emerald bg-emerald text-white" : dark ? "border-white/25 text-white/85" : "border-forest/20 text-forest"}`}>
                  <input type="radio" name={`${uid}-svc`} className="sr-only" checked={service === s.v} onChange={() => setService(s.v)} />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>

          {tab === "reg" ? (
            <div>
              <label htmlFor={`${uid}-reg`} className={label}>Registration</label>
              <div className="flex min-h-[56px] overflow-hidden rounded-xl border-2 border-[#d9b800] bg-[#ffd800] text-ink">
                <span aria-hidden className="grid w-9 shrink-0 place-items-center bg-[#0b3a99] text-[.6rem] font-extrabold leading-none text-[#ffd800]">GB</span>
                <input id={`${uid}-reg`} value={reg} onChange={(e) => setReg(e.target.value.toUpperCase())} inputMode="text" autoCapitalize="characters" autoComplete="off" spellCheck={false}
                  placeholder="AB12 CDE" aria-invalid={!!err} aria-describedby={err ? `${uid}-err` : undefined}
                  className="w-full min-w-0 bg-transparent px-3 text-center font-display text-[1.5rem] font-bold uppercase tracking-[.12em] placeholder:text-ink/35 focus:outline-none" />
              </div>
              {err && <p id={`${uid}-err`} role="alert" className="mt-2 text-sm font-semibold text-red-600">{err}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
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
            <details className="group mt-4">
              <summary className={`flex min-h-[44px] cursor-pointer list-none items-center justify-between text-sm font-bold ${dark ? "text-white" : "text-forest"}`}>
                Add your details & symptoms (optional)
                <span className="text-emerald transition-transform group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div><label htmlFor={`${uid}-n`} className={label}>Name</label><input id={`${uid}-n`} autoComplete="name" className={field} /></div>
                <div><label htmlFor={`${uid}-t`} className={label}>Telephone</label><input id={`${uid}-t`} type="tel" autoComplete="tel" className={field} /></div>
                <div className="sm:col-span-2"><label htmlFor={`${uid}-e`} className={label}>Email</label><input id={`${uid}-e`} type="email" autoComplete="email" className={field} /></div>
                <div className="sm:col-span-2"><label htmlFor={`${uid}-s`} className={label}>Symptoms</label><textarea id={`${uid}-s`} rows={3} className={`${field} py-3`} /></div>
                <div><label htmlFor={`${uid}-vin`} className={label}>VIN or engine code</label><input id={`${uid}-vin`} className={field} /></div>
                <div><label htmlFor={`${uid}-pc`} className={label}>Postcode</label><input id={`${uid}-pc`} autoComplete="postal-code" className={field} /></div>
              </div>
            </details>
          )}

          <button type="submit" className="btn btn--primary mt-5 w-full" data-magnetic>
            {cta} <ArrowRight size={18} aria-hidden />
          </button>
          <p className={`mt-3 flex items-center gap-2 text-[.82rem] ${dark ? "text-white/70" : "text-ink/60"}`}>
            <ShieldCheck size={15} aria-hidden /> Free, no obligation. Secure enquiry, no spam.
          </p>
        </form>
      )}
    </div>
  );
}
