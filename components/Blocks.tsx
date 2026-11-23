import type { ReactNode } from "react";
import { Block } from "@/lib/content";
import { inline, Md } from "./Md";
import {
  CarFront, ClipboardList, FileCheck2, Handshake, Truck, Search, Wrench, type LucideIcon,
} from "lucide-react";

/* ---------------- decorative hexagon outline (GSAP parallax / line draw) ---------------- */
export function HexDeco({ className = "", draw = false, parallax = 0.25, spin }: { className?: string; draw?: boolean; parallax?: number; spin?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 200 230" className={`pointer-events-none absolute ${className}`} data-parallax={parallax} data-spin={spin}>
      <polygon data-draw={draw ? "" : undefined} points="100,6 190,58 190,172 100,224 10,172 10,58" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <polygon points="100,46 154,77 154,153 100,184 46,153 46,77" fill="none" stroke="currentColor" strokeWidth="1" opacity=".55" />
      <polygon points="100,84 120,96 120,134 100,146 80,134 80,96" fill="currentColor" opacity=".18" />
    </svg>
  );
}

/* ---------------- section frame: editorial split with sticky heading ---------------- */
export function Sec({
  id, title, index, tone = "white", wide = false, children, deco = false,
}: { id?: string; title: ReactNode; index?: number; tone?: "white" | "mist" | "forest"; wide?: boolean; children: ReactNode; deco?: boolean }) {
  const cls = tone === "forest" ? "section section--forest" : tone === "mist" ? "section section--mist" : "section";
  return (
    <section id={id} className={`${cls} overflow-hidden`} aria-labelledby={id ? `${id}-h` : undefined}>
      {deco && <HexDeco className={`-right-20 top-10 h-[420px] w-[360px] ${tone === "forest" ? "text-emerald-light/40" : "text-emerald/25"}`} draw />}
      <div className={`wrap relative ${wide ? "" : "lg:grid lg:grid-cols-[minmax(0,4.6fr)_minmax(0,7.4fr)] lg:gap-16"}`}>
        <div className={wide ? "mb-10 max-w-3xl" : "mb-9 lg:mb-0"}>
          <div className={wide ? "" : "lg:sticky lg:top-28"}>
            {index !== undefined && <p className="eyebrow mb-4" data-reveal>{String(index).padStart(2, "0")}</p>}
            <h2 id={id ? `${id}-h` : undefined} data-split>{typeof title === "string" ? title : title}</h2>
          </div>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

/* ---------------- responsive table ---------------- */
export function DataTable({ head, align, rows }: { head: string[]; align: ("l" | "r")[]; rows: string[][] }) {
  return (
    <table className="dt">
      <thead>
        <tr>{head.map((h, i) => <th key={i} scope="col" className={align[i] === "r" ? "r" : ""}>{h || <span className="sr-only">Detail</span>}</th>)}</tr>
      </thead>
      <tbody data-stagger="0.05">
        {rows.map((r, ri) => (
          <tr key={ri}>
            {r.map((c, ci) => (
              <td key={ci} data-label={head[ci]} className={`${align[ci] === "r" ? "r" : ""} ${ci === 0 || c.length > 24 ? "span2" : ""}`.trim()}>
                {ci === 0 ? <strong>{inline(c, `c${ri}${ci}`)}</strong> : inline(c, `c${ri}${ci}`)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---------------- rules list (no cards): bold lead-in in the left column ---------------- */
const LEAD = /^\*\*(.+?)\*\*:?\s*([\s\S]*)$/;
export function RuleList({ items, hex = false }: { items: string[]; hex?: boolean }) {
  return (
    <ul className="rules" data-stagger="0.06">
      {items.map((it, i) => {
        const m = LEAD.exec(it);
        if (m && m[2]) {
          return (
            <li key={i} className="grid gap-1 md:grid-cols-[minmax(150px,240px)_1fr] md:gap-8">
              <strong className="font-display text-[1.05rem] leading-snug text-forest">{inline(m[1], `l${i}`)}</strong>
              <span className="text-[#26332d]">{inline(m[2], `r${i}`)}</span>
            </li>
          );
        }
        return (
          <li key={i} className={hex ? "relative pl-8" : ""}>
            {hex && <span aria-hidden className="hex absolute left-0 top-[1.45rem] h-3.5 w-3 bg-emerald" />}
            {inline(it, `p${i}`)}
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- steps with GSAP line-draw connector ---------------- */
const ICONS: LucideIcon[] = [ClipboardList, FileCheck2, Handshake, Truck, CarFront];
const ICONS4: LucideIcon[] = [Search, Wrench, FileCheck2, Truck];
export function Steps({ items }: { items: string[] }) {
  const icons = items.length === 4 ? ICONS4 : ICONS;
  return (
    <div data-draw-scope className="relative">
      <div aria-hidden data-grow="y" className="absolute left-[27px] top-6 h-[calc(100%-3rem)] w-[2px] origin-top bg-emerald-light lg:hidden" />
      <div aria-hidden data-grow="x" className="absolute left-0 top-[30px] hidden h-[2px] w-full origin-left bg-emerald-light lg:block" />
      <ol className={`relative grid gap-7 sm:gap-9 ${items.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5"} lg:gap-6`} data-stagger="0.12">
        {items.map((it, i) => {
          const Icon = icons[i] ?? ClipboardList;
          const m = LEAD.exec(it);
          return (
            <li key={i} className="relative grid grid-cols-[56px_1fr] gap-5 lg:block">
              <span className="hex relative z-10 grid h-[62px] w-[56px] place-items-center bg-forest text-white lg:mb-6">
                <Icon size={22} aria-hidden />
              </span>
              <div>
                <p className="font-display text-xs font-bold tracking-[.2em] text-emerald">STEP {i + 1}</p>
                <h3 className="mt-1 !text-[1.2rem]">{m ? inline(m[1], `s${i}`) : null}</h3>
                <p className="mt-2 text-[.97rem] text-[#33423b]">{inline(m ? m[2] : it, `t${i}`)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------- FAQ (native details) ---------------- */
export function Faq({ blocks }: { blocks: Block[] }) {
  const qa: { q: string; a: string }[] = [];
  const rest: Block[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.t === "h" && b.level === 3) {
      const n = blocks[i + 1];
      qa.push({ q: b.text, a: n && n.t === "p" ? n.text : "" });
      i++;
    } else rest.push(b);
  }
  return (
    <>
      <div className="faq border-t border-forest/10" data-stagger="0.05">
        {qa.map((x, i) => (
          <details key={i} open={i === 0}>
            <summary>
              <span>{x.q}</span>
              <span className="plus" aria-hidden>+</span>
            </summary>
            <div className="ans"><Md text={x.a} /></div>
          </details>
        ))}
      </div>
      <BlockRenderer blocks={rest} />
    </>
  );
}

/* ---------------- CTA row: first link primary, other links ghost ---------------- */
export function CtaRow({ text, dark = false }: { text: string; dark?: boolean }) {
  const parts = text.split(" · ");
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {parts.map((p, i) => {
        const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(p);
        const tel = /\*\*(0[\d ]{9,})\*\*/.exec(p);
        if (link) {
          const cls = i === 0 ? "btn btn--primary" : dark ? "btn btn--ghost !border-white/40 !text-white" : "btn btn--ghost";
          return <a key={i} href={link[2]} className={cls} data-magnetic>{link[1]}</a>;
        }
        if (tel) {
          return <a key={i} href={`tel:${tel[1].replace(/\s/g, "")}`} className={dark ? "btn btn--ghost !border-white/40 !text-white" : "btn btn--ghost"}>{p.replace(/\*\*/g, "")}</a>;
        }
        return <span key={i} className="self-center">{inline(p, `c${i}`)}</span>;
      })}
    </div>
  );
}

const NOTE = /^(\*\*(Price note|Fitment note|Recovery note|Important):\*\*|\*Prices are)/;

/* ---------------- generic ordered renderer: keeps every supplied block, in order ---------------- */
export function BlockRenderer({ blocks, wideTables = false }: { blocks: Block[]; wideTables?: boolean }) {
  const out: ReactNode[] = [];
  let proseRun: string[] = [];
  const flush = (k: string) => {
    if (proseRun.length) {
      const run = proseRun;
      out.push(<div key={k} className="prose">{run.map((t, i) => <p key={i}><Md text={t} /></p>)}</div>);
      proseRun = [];
    }
  };
  blocks.forEach((b, i) => {
    const k = `b${i}`;
    if (b.t === "p") {
      if (/^\*\*[^*]+\*\*$/.test(b.text)) { flush(`${k}f`); out.push(<p key={k} className="mb-1 mt-12 font-display text-xl font-semibold text-forest" data-reveal><Md text={b.text} /></p>); }
      else if (NOTE.test(b.text)) { flush(`${k}f`); out.push(<p key={k} className="note mt-8" data-reveal><Md text={b.text} /></p>); }
      else proseRun.push(b.text);
      return;
    }
    flush(`${k}f`);
    if (b.t === "h") out.push(<h3 key={k} className="mb-4 mt-12 first:mt-0" data-reveal>{b.text}</h3>);
    else if (b.t === "ul") out.push(<div key={k} className="my-6"><RuleList items={b.items} /></div>);
    else if (b.t === "ol") out.push(<div key={k} className="my-6"><RuleList items={b.items} /></div>);
    else if (b.t === "table") out.push(<div key={k} className="my-6" data-reveal><DataTable head={b.head} align={b.align} rows={b.rows} /></div>);
  });
  flush("end");
  return <>{out}</>;
}
