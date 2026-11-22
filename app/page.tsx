import type { Metadata } from "next";
import { loadDoc, toSections } from "@/lib/content";
import { Md, inline } from "@/components/Md";
import { BlockRenderer, CtaRow, Faq, HexDeco, Sec, Steps } from "@/components/Blocks";
import HexScene from "@/components/HexScene";
import QuotePanel from "@/components/QuotePanel";
import { ShieldCheck, Clock, Truck } from "lucide-react";
import ModelShowcase, { type ModelGroup } from "@/components/ModelShowcase";
import fs from "node:fs";
import path from "node:path";
import { WhyChoose, CodeShowcase } from "@/components/Showpieces";
import EngineCatalogue from "@/components/EngineCatalogue";
import Hero from "@/components/Hero";

const doc = loadDoc("homepage.md");

export const metadata: Metadata = {
  title: doc.meta.title,
  description: doc.meta.description,
  alternates: { canonical: "https://jaguarlandroverspecialist.uk/" },
  robots: doc.meta.index ? undefined : { index: false, follow: false },
};

/** "**JLR Engine Rebuild Prices — from £4,794 incl. VAT** (based on £3,995 ex VAT)" → parts */
function hook(text: string) {
  const m = /^\*\*(.+?) — from (£[\d,]+) incl\. VAT\*\*\s*(.*)$/.exec(text);
  if (!m) return null;
  return { label: m[1], price: m[2], note: m[3] };
}

export default function Home() {
  const { intro, sections } = toSections(doc.blocks);
  const h1 = intro.find((b) => b.t === "h" && b.level === 1);
  const paras = intro.filter((b) => b.t === "p") as { t: "p"; text: string }[];
  const lede = paras[0];
  const hooks = paras.slice(1, 4);
  const cta = paras[4];

  const find = (s: string) => sections.find((x) => x.title.startsWith(s));
  const order = sections.map((s) => s.id);
  const idx = (id: string) => order.indexOf(id) + 1;

  return (
    <>
      {/* ================= HERO ================= */}
          <Hero
        title={h1 && h1.t === "h" ? h1.text : ""}
        lede={lede && <Md text={lede.text} />}
        cta={cta && <CtaRow text={cta.text} dark />}
quote={<QuotePanel id="get-quote" extras preset="rebuild" wide />} 
               list={
          <ul className="grid gap-2.5" data-hero data-reveal data-delay="0.9">
            {hooks.map((h, i) => {
              const p = hook(h.text);
              return (
                <li key={i} className="group/price relative flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl bg-white/[.06] px-4 py-3.5 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[.10] hover:ring-emerald-light/50">
                  <span aria-hidden className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-emerald-light opacity-60 transition-opacity group-hover/price:opacity-100" />
                  {p ? (
                    <>
                      <span className="min-w-0 flex-1 basis-[46%] pl-2 text-[.9rem] font-bold leading-tight text-white sm:text-[.95rem]">
                        {p.label}<span className="sr-only"> — </span>
                        {p.note && <span className="mt-1 block text-[.74rem] font-medium text-white/60">{p.note}</span>}
                      </span>
                      <span className="flex items-baseline gap-1.5 pl-2 text-right font-display leading-none text-white">
                        <span className="text-[.64rem] font-semibold uppercase tracking-widest text-emerald-light">from</span>
                        <span className="text-[1.65rem] font-bold sm:text-[2rem]">{p.price}</span>
                        <span className="text-[.64rem] font-semibold uppercase tracking-wider text-white/60">incl. VAT</span>
                      </span>
                    </>
                  ) : <Md text={h.text} />}
                </li>
              );
            })}
          </ul>
        }
      />

      {/* ================= trust strip (from supplied copy) ================= */}
      <section aria-label="Why customers choose us" className="border-y border-forest/10 bg-white">
        <ul className="wrap grid divide-y divide-forest/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0" data-stagger="0.1">
          {[
            { i: Clock, a: "More than 15 years", b: "of industry experience" },
            { i: ShieldCheck, a: "12-month warranty", b: "unlimited mileage, subject to the written terms" },
            { i: Truck, a: "UK-wide recovery from £70", b: "no recovery markup" },
          ].map((s, i) => (
            <li key={i} className="flex items-center gap-4 py-6 sm:px-6 first:sm:pl-0">
              <span className="hex grid h-12 w-11 shrink-0 place-items-center bg-emerald/10 text-emerald"><s.i size={20} aria-hidden /></span>
              <span className="leading-tight"><strong className="block font-display text-lg text-forest">{s.a}</strong><span className="text-sm text-ink/65">{s.b}</span></span>
            </li>
          ))}
        </ul>
      </section>

      {/* ================= SECTIONS (supplied order) ================= */}
      {sections.map((s) => {
        const n = idx(s.id);
        if (s.title.startsWith("How It Works")) {
          const ol = s.blocks.find((b) => b.t === "ol");
          const rest = s.blocks.filter((b) => b !== ol);
          return (
            <Sec key={s.id} id={s.id} title={s.title} index={n} tone="mist" wide>
              {ol && ol.t === "ol" && <Steps items={ol.items} />}
              <div className="mt-12"><BlockRenderer blocks={rest} /></div>
            </Sec>
          );
        }
        if (s.title.startsWith("Frequently")) {
          return <Sec key={s.id} id={s.id} title={s.title} index={n}><Faq blocks={s.blocks} /></Sec>;
        }
        if (s.title.startsWith("UK-Wide Recovery")) {
          return (
            <Sec key={s.id} id={s.id} title={s.title} index={n} tone="forest" deco>
              <BlockRenderer blocks={s.blocks} />
            </Sec>
          );
        }
        if (s.title.startsWith("Request Your")) {
          const [p1, p2] = s.blocks.filter((b) => b.t === "p") as { t: "p"; text: string }[];
          return (
            <section key={s.id} id={s.id} className="section section--forest overflow-hidden" aria-labelledby={`${s.id}-h`}>
              <HexDeco className="-left-16 top-1/2 h-[360px] w-[320px] -translate-y-1/2 text-emerald-light/30" draw />
              <div className="wrap relative text-center">
                <h2 id={`${s.id}-h`} data-split className="mx-auto max-w-4xl">{s.title}</h2>
                <p className="lede mx-auto mt-6 !text-white/85" data-reveal>{p1 && <Md text={p1.text} />}</p>
                <div className="mx-auto mt-9 flex max-w-3xl justify-center" data-reveal>{p2 && <CtaRow text={p2.text} dark />}</div>
              </div>
            </section>
          );
        }
        if (s.title.startsWith("Choose Your")) {
          // Section 2: model showcase. Same supplied copy, rows and links, redesigned.
          const firstH = s.blocks.findIndex((b) => b.t === "h");
          const intro = s.blocks.slice(0, firstH).flatMap((b) => (b.t === "p" ? [b.text] : []));
          const groups: ModelGroup[] = [];
          let outro: string[] = [];
          s.blocks.slice(firstH).forEach((b, i, arr) => {
            if (b.t === "h") groups.push({ title: b.text, rows: [] });
            else if (b.t === "table") groups[groups.length - 1].rows = b.rows.map((r) => ({ model: r[0], covers: r[1], cta: r[2] }));
            else if (b.t === "p") outro.push(b.text);
            void i; void arr;
          });
          const videos = ["range-rover", "range-rover-sport", "range-rover-velar"].filter((k) =>
            fs.existsSync(path.join(process.cwd(), "public", "media", `${k}.mp4`))
          );
          return (
            <section key={s.id} id={s.id} className="section !pb-0 overflow-hidden" aria-labelledby={`${s.id}-h`}>
              <ModelShowcase intro={intro} groups={groups} outro={outro} videos={videos} />
            </section>
          );
        }
        if (s.title.startsWith("Why Choose")) {
          const paras = s.blocks.flatMap((b) => (b.t === "p" ? [b.text] : []));
          return <WhyChoose key={s.id} id={s.id} index={n} title={s.title} paras={paras} />;
        }
        if (s.title.startsWith("Find Jaguar")) {
          const firstH = s.blocks.findIndex((b) => b.t === "h");
          const intro = s.blocks.slice(0, firstH).flatMap((b) => (b.t === "p" ? [b.text] : []));
          const groups: { title: string; head: string[]; rows: string[][] }[] = [];
          const outro: string[] = [];
          s.blocks.slice(firstH).forEach((b) => {
            if (b.t === "h") groups.push({ title: b.text, head: [], rows: [] });
            else if (b.t === "table") { const g = groups[groups.length - 1]; g.head = b.head; g.rows = b.rows; }
            else if (b.t === "p") outro.push(b.text);
          });
          return (
            <Sec key={s.id} id={s.id} title={s.title} index={n} wide>
              <EngineCatalogue intro={intro} groups={groups} outro={outro} />
            </Sec>
          );
        }
        const wide = s.title.startsWith("Find Jaguar") || s.title.startsWith("Choose Your");
        const tone = s.title.startsWith("Engine Rebuilding") || s.title.startsWith("Engines for Sale") || s.title.startsWith("Common Engine") ? "mist" : "white";
        return (
          <Sec key={s.id} id={s.id} title={s.title} index={n} wide={wide} tone={tone}>
            <BlockRenderer blocks={s.blocks} />
          </Sec>
        );
      })}
    </>
  );
}