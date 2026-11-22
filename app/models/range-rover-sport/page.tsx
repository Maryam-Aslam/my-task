import type { Metadata } from "next";
import { loadDoc, toSections, type Block } from "@/lib/content";
import { Md, inline } from "@/components/Md";
import { BlockRenderer, Faq, HexDeco, Sec, Steps } from "@/components/Blocks";
import HexScene from "@/components/HexScene";
import QuotePanel, { ServiceLinks } from "@/components/QuotePanel";
import { BadgeCheck } from "lucide-react";

const doc = loadDoc("range-rover-sport.md");

export const metadata: Metadata = {
  title: doc.meta.title,
  description: doc.meta.description,
  alternates: { canonical: "https://jaguarlandroverspecialist.uk/models/range-rover-sport/" },
  robots: doc.meta.index ? undefined : { index: false, follow: false },
};

const LEAD = /^\*\*(.+?)\*\*\s*([\s\S]*)$/;

export default function RangeRoverSport() {
  const { intro, sections } = toSections(doc.blocks);
  const h1 = intro.find((b) => b.t === "h" && b.level === 1);
  const paras = intro.filter((b) => b.t === "p") as { t: "p"; text: string }[];
  const lede = paras[0];
  const offers = (intro.find((b) => b.t === "ul") as Extract<Block, { t: "ul" }> | undefined)?.items ?? [];
  const priceNote = paras.find((p) => p.text.startsWith("**Price note"));
  const startNote = paras.find((p) => p.text.startsWith("*Prices"));
  const trust = paras.find((p) => p.text.startsWith("**Trust:**"));
  const trustItems = trust ? trust.text.replace("**Trust:**", "").split(" · ").map((t) => t.trim()) : [];

  // badge/variant names for the "choose your model" tab
  const variantSec = sections.find((s) => s.title.includes("by Badge and Variant"));
  const variants = (variantSec?.blocks ?? [])
    .flatMap((b) => (b.t === "ul" ? b.items : []))
    .map((it) => /\[([^\]]+)\]/.exec(it)?.[1] ?? "")
    .filter(Boolean);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="mesh relative overflow-hidden pt-[88px] lg:pt-[110px]" aria-labelledby="rrs-h1">
        <div className="scene-mask pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-60 lg:inset-x-auto lg:left-[48%] lg:right-[-6%] lg:top-6 lg:h-[560px] lg:opacity-100">
          <HexScene variant="vee" className="h-full w-full" />
        </div>
        <HexDeco className="-left-24 bottom-0 hidden h-[300px] w-[260px] text-emerald/20 lg:block" parallax={0.3} spin={-40} />

        <div className="wrap relative grid grid-cols-[minmax(0,1fr)] gap-10 pb-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14 lg:pb-24">
          <div className="pt-6 lg:pt-12">
            <h1 id="rrs-h1" data-split data-hero>{h1 && h1.t === "h" ? h1.text : ""}</h1>
            <p className="lede mt-6" data-reveal data-hero data-delay="0.7">{lede && <Md text={lede.text} />}</p>

            <ul className="mt-8 divide-y divide-forest/10 border-y border-forest/10" data-reveal data-hero data-delay="0.9">
              {offers.map((o, i) => {
                const m = LEAD.exec(o);
                const lead = m ? m[1] : "";
                const [label, price] = lead.split(/:\s(.+)/);
                return (
                  <li key={i} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
                    <div>
                      <strong className="block font-display text-[1.05rem] text-forest">
                        {label}<span className="sr-only">: </span>
                      </strong>
                      <span className="text-[.93rem] text-[#33423b]">{m ? inline(m[2], `o${i}`) : inline(o)}</span>
                    </div>
                    {price && (
                      <span className="price-sweep justify-self-start px-1 font-display text-[1.6rem] font-bold leading-none text-forest sm:justify-self-end sm:text-[1.95rem]" data-sweep>
                        {price.replace(/\.$/, "")}.
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 space-y-3" data-reveal data-hero data-delay="1.0">
              {startNote && <p className="text-[.9rem] italic text-ink/65"><Md text={startNote.text} /></p>}
              {priceNote && <p className="note"><Md text={priceNote.text} /></p>}
            </div>

            {trustItems.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2" data-reveal data-hero data-delay="1.1" aria-label="Trust">
                {trustItems.map((t, i) => (
                  <li key={i} className="badge"><BadgeCheck size={15} aria-hidden />{t}</li>
                ))}
              </ul>
            )}

            <div className="mt-7" data-reveal data-hero data-delay="1.2">
              <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-emerald">Choose your service</p>
              <ServiceLinks />
            </div>
          </div>

          <div className="relative z-10 lg:pt-52" data-reveal data-hero data-delay="1.15">
            <QuotePanel id="get-quote" modelTab model="Range Rover Sport" variants={variants} preset="rebuild" />
          </div>
        </div>
      </section>

      {/* ================= SECTIONS (supplied order) ================= */}
      {sections.map((s, i) => {
        const n = i + 1;
        const t = s.title;

        if (t.endsWith("Engine FAQs")) {
          const cut = s.blocks.findIndex((b) => b.t === "hr");
          const faq = cut === -1 ? s.blocks : s.blocks.slice(0, cut);
          const contact = cut === -1 ? [] : s.blocks.slice(cut + 1);
          return (
            <div key={s.id}>
              <Sec id={s.id} title={t} index={n}><Faq blocks={faq} /></Sec>
              {contact.length > 0 && (
                <section className="section section--forest overflow-hidden" aria-label="Contact">
                  <HexDeco className="-right-16 top-1/2 h-[340px] w-[300px] -translate-y-1/2 text-emerald-light/30" draw />
                  <div className="wrap relative max-w-4xl">
                    <BlockRenderer blocks={contact} />
                  </div>
                </section>
              )}
            </div>
          );
        }
        if (t.startsWith("How to Order")) {
          const ol = s.blocks.find((b) => b.t === "ol");
          return (
            <Sec key={s.id} id={s.id} title={t} index={n} tone="mist" wide>
              {ol && ol.t === "ol" && <Steps items={ol.items} />}
              <div className="mt-12"><a href="#get-quote" className="btn btn--primary" data-magnetic>Request Your Free Engine Quote</a></div>
            </Sec>
          );
        }
        if (t.includes("Engine Only with UK Delivery")) {
          return (
            <Sec key={s.id} id={s.id} title={t} index={n} tone="mist">
              <BlockRenderer blocks={s.blocks} />
              <div className="mt-10 max-w-xl" data-reveal>
                <QuotePanel compact preset="engine-only" model="Range Rover Sport" />
              </div>
            </Sec>
          );
        }
        const wide =
          t.includes("by Year, Generation") || t.includes("Prices") || t.includes("by Badge") ||
          t.startsWith("Rebuild, Supply") || t.startsWith("Common Engine");
        const mist = t.includes("by Year") || t.startsWith("Rebuild, Supply") || t.includes("Cost Breakdown");
        return (
          <Sec key={s.id} id={s.id} title={t} index={n} wide={wide} tone={mist ? "mist" : "white"}>
            <BlockRenderer blocks={s.blocks} />
          </Sec>
        );
      })}
    </>
  );
}
