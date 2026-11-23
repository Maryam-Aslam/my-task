import type { Metadata } from "next";
import Link from "next/link";
import { loadDoc, toSections, type Block } from "@/lib/content";
import { Md, inline } from "@/components/Md";
import { BlockRenderer, HexDeco, Sec, Steps } from "@/components/Blocks";
import QuotePanel, { ServiceLinks } from "@/components/QuotePanel";
import { ArrowUpRight, BadgeCheck, HelpCircle, Layers, ShieldCheck, Truck } from "lucide-react";
import ExclusiveFaq from "@/components/ExclusiveFaq";
import PricingShowcase from "@/components/PricingShowcase";

const doc = loadDoc("range-rover-sport.md");

const HERO_DESKTOP_IMAGE = "/media/sport-hero.png";
const HERO_PHONE_IMAGE = "/media/sport-phone.png";
const SHOWCASE_IMG = "/media/pricing-bg.png";
const DELIVERY_SECTION_IMG = "/media/ukk.webp";
const SECTION_EIGHT_IMG = "/media/faq-cars-bg.png";
const SECTION_FOURTEEN_IMG = "/media/quote.png";
const SECTION_EIGHTEEN_BG = "/media/pricing-bg.png";
const FAQ_SECTION_BG = "/media/faq-cars-bg.png";

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
  const offers =
    (intro.find((b) => b.t === "ul") as Extract<Block, { t: "ul" }> | undefined)?.items ?? [];
  const priceNote = paras.find((p) => p.text.startsWith("**Price note"));
  const startNote = paras.find((p) => p.text.startsWith("*Prices"));
  const trust = paras.find((p) => p.text.startsWith("**Trust:**"));
  const trustItems = trust
    ? trust.text
        .replace("**Trust:**", "")
        .split(" · ")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  // badge/variant names for the "choose your model" tab
  const variantSec = sections.find((s) => s.title.includes("by Badge and Variant"));
  const variants = (variantSec?.blocks ?? [])
    .flatMap((b) => (b.t === "ul" ? b.items : []))
    .map((it) => /\[([^\]]+)\]/.exec(it)?.[1] ?? "")
    .filter(Boolean);

  const lastIndex = sections.length - 1;

  return (
    <div className="min-w-0 overflow-x-clip">
      {/* ================= HERO (Responsive Sport Backdrop) ================= */}
      <section
        className="group relative overflow-x-clip bg-[#04140e] pt-[84px] text-white sm:pt-[96px] lg:pt-[112px]"
        aria-labelledby="rrs-h1"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 transition-transform duration-1000 ease-out md:group-hover:scale-[1.02]"
        >
          {/* Phone image (< md) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_PHONE_IMAGE}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="block h-full w-full object-cover object-center md:hidden"
          />

          {/* Desktop / tablet image (>= md) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_DESKTOP_IMAGE}
            alt=""
            fetchPriority="high"
            decoding="async"
            className="hidden h-full w-full object-cover object-center md:block"
          />

          {/* Scrim for crisp text contrast on both mobile and desktop */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#04140e]/85 via-[#04140e]/70 to-[#04140e]/95 md:bg-gradient-to-r md:from-[#04140e]/95 md:via-[#04140e]/75 md:to-[#04140e]/30" />
        </div>

        {/* Top emerald accent line */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-[#18b777] via-emerald to-transparent"
        />

        {/* Decorative hexagon (desktop only) */}
        <HexDeco
          className="-left-24 bottom-0 z-10 hidden h-[300px] w-[260px] text-[#18b777]/20 lg:block"
          parallax={0.3}
          spin={-40}
        />

        <div className="wrap relative z-10 min-w-0 pb-12 sm:pb-16 lg:pb-24">
          <div className="max-w-3xl min-w-0 pt-2 sm:pt-6 lg:pt-10">
            <h1
              id="rrs-h1"
              className="font-display text-2xl font-extrabold leading-[1.12] tracking-tight !text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.65)] sm:text-4xl lg:text-5xl"
            >
              {h1 && h1.t === "h" ? h1.text : ""}
            </h1>

            <p className="lede mt-3.5 text-sm leading-relaxed !text-white/85 sm:mt-6 sm:text-lg">
              {lede && <Md text={lede.text} />}
            </p>

            {/* Pricing breakdown list */}
            {offers.length > 0 && (
              <ul className="mt-5 divide-y divide-white/15 rounded-2xl border border-white/15 bg-[#041710]/75 px-3.5 backdrop-blur-md sm:mt-8 sm:px-6">
                {offers.map((o, i) => {
                  const m = LEAD.exec(o);
                  const lead = m ? m[1] : "";
                  const [label, price] = lead.split(/:\s(.+)/);
                  return (
                    <li
                      key={i}
                      className="grid gap-1.5 py-3 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6 sm:py-4"
                    >
                      <div className="min-w-0">
                        <strong className="block font-display text-sm text-white sm:text-[1.05rem]">
                          {label}
                          <span className="sr-only">: </span>
                        </strong>
                        <span className="text-xs leading-relaxed text-white/75 sm:text-[.93rem]">
                          {m ? inline(m[2], `o${i}`) : inline(o)}
                        </span>
                      </div>
                      {price && (
                        <span
                          className="price-sweep justify-self-start font-display text-xl font-bold leading-none text-[#34d399] sm:justify-self-end sm:px-1 sm:text-[1.95rem]"
                          data-sweep
                        >
                          {price.replace(/\.$/, "")}.
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-4 min-w-0 space-y-2.5 sm:mt-5 sm:space-y-3 [&_strong]:!text-white">
              {startNote && (
                <p className="text-xs italic text-white/70 sm:text-[.9rem]">
                  <Md text={startNote.text} />
                </p>
              )}
              {priceNote && (
                <p className="rounded-xl border border-white/15 bg-[#041710]/75 px-3.5 py-2.5 text-xs leading-relaxed text-white/85 backdrop-blur-sm sm:px-4 sm:py-3 sm:text-sm">
                  <Md text={priceNote.text} />
                </p>
              )}
            </div>

            {trustItems.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2 sm:mt-6" aria-label="Trust">
                {trustItems.map((t, i) => (
                  <li
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#18b777]/35 bg-[#062419]/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm sm:px-3.5 sm:py-1.5"
                  >
                    <BadgeCheck size={14} className="shrink-0 text-[#34d399]" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 min-w-0 sm:mt-7 [&_a]:!border-white/25 [&_a]:!bg-[#041710]/80 [&_a]:!text-white hover:[&_a]:!border-[#18b777] hover:[&_a]:!text-[#34d399]">
              <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#34d399]">
                Choose your service
              </p>
              <ServiceLinks />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEPARATE WIDE QUOTE SECTION BELOW HERO ================= */}
      <section
        aria-label="Request a Range Rover Sport engine quote"
        className="relative overflow-x-clip border-y border-forest/10 bg-[#f4f9f6] py-12 sm:py-20"
      >
        <div className="wrap relative z-10 min-w-0">
          <div className="mx-auto min-w-0 max-w-6xl">
            <QuotePanel
              id="get-quote"
              wide
              modelTab
              model="Range Rover Sport"
              variants={variants}
              preset="rebuild"
            />
          </div>
        </div>
      </section>

      {/* ================= SECTIONS (supplied order) ================= */}
      {sections.map((s, i) => {
        const n = i + 1;
        const t = s.title;
        const isLast = i === lastIndex;

        if (t.includes("Rebuild and Supply") || t.includes("Engine Prices")) {
          return (
            <PricingShowcase
              key={s.id}
              id={s.id}
              index={n}
              title={t}
              blocks={s.blocks}
              imageSrc={SHOWCASE_IMG}
            />
          );
        }

        if (t.endsWith("Engine FAQs")) {
          const cut = s.blocks.findIndex((b) => b.t === "hr");
          const faq = cut === -1 ? s.blocks : s.blocks.slice(0, cut);
          const contact = cut === -1 ? [] : s.blocks.slice(cut + 1);
          return (
            <div key={s.id} className="min-w-0">
              <section
                id={s.id}
                aria-labelledby={`${s.id}-heading`}
                className="relative isolate scroll-mt-24 overflow-x-clip border-y border-[#3ee3a0]/25 bg-[#041710] py-14 text-white sm:py-24"
              >
                {/* Frosted dark-emerald background backdrop for glassmorphic FAQ rows */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={FAQ_SECTION_BG}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center opacity-55"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#03130c]/88 via-[#041b12]/78 to-[#03130c]/92" />
                </div>

                <div className="wrap relative z-10 min-w-0 space-y-7 sm:space-y-10">
                  <div className="max-w-3xl min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#3ee3a0]/35 bg-[#041c13]/85 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-[#3ee3a0] backdrop-blur-md">
                      <HelpCircle size={13} aria-hidden />
                      <span>{String(n).padStart(2, "0")} · FAQ</span>
                    </div>

                    <h2
                      id={`${s.id}-heading`}
                      className="mt-4 font-display text-2xl font-extrabold leading-[1.15] tracking-tight !text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)] sm:text-4xl lg:text-[2.5rem]"
                    >
                      {t}
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                      Clear answers on Range Rover Sport rebuilds, diagnostics, UK delivery, and warranty coverage.
                    </p>
                  </div>

                  <div className="min-w-0">
                    <ExclusiveFaq blocks={faq as never} />
                  </div>
                </div>
              </section>

              {contact.length > 0 && (
                <section
                  className="overflow-x-clip border-t border-forest/10 bg-white py-14 text-forest sm:py-20"
                  aria-label="Contact"
                >
                  <div className="wrap min-w-0">
                    <div className="mx-auto max-w-4xl min-w-0 rounded-2xl border border-forest/12 bg-[#f8fbf9] p-5 shadow-sm sm:p-8 [&_a]:font-semibold [&_a]:text-emerald hover:[&_a]:underline [&_h2]:text-forest [&_h3]:text-forest [&_p]:text-sm [&_p]:text-forest/85 sm:[&_p]:text-base [&_strong]:text-forest">
                      <BlockRenderer blocks={contact} />
                    </div>
                  </div>
                </section>
              )}
            </div>
          );
        }

        if (t.startsWith("How to Order")) {
          const ol = s.blocks.find((b) => b.t === "ol");
          return (
            <Sec
              key={s.id}
              id={s.id}
              title={t}
              index={n}
              tone={isLast ? "white" : "mist"}
              wide
            >
              {ol && ol.t === "ol" && <Steps items={ol.items} />}
              <div className="mt-10 sm:mt-12">
                <a href="#get-quote" className="btn btn--primary" data-magnetic>
                  Request Your Free Engine Quote
                </a>
              </div>
            </Sec>
          );
        }

        // Section 06: Full-screen edge-to-edge UK delivery showcase (QuotePanel removed)
        if (n === 6 || t.includes("Engine Only with UK Delivery")) {
          return (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-heading`}
              className="group relative isolate flex min-h-[70vh] scroll-mt-24 items-center overflow-x-clip border-y border-[#3ee3a0]/30 bg-[#041710] py-16 text-white sm:min-h-[78vh] sm:py-28 lg:py-32"
            >
              {/* Full-screen background image */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={DELIVERY_SECTION_IMG}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center opacity-75 transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#03130c]/88 via-[#041b12]/76 to-[#03130c]/92 lg:bg-gradient-to-r lg:from-[#03130c]/92 lg:via-[#041b12]/78 lg:to-[#03130c]/60" />
              </div>

              {/* Top emerald accent bar */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] bg-gradient-to-r from-[#18b777] via-[#3ee3a0] to-[#08794D]"
              />

              <div className="wrap relative z-10 w-full min-w-0">
                <div className="grid items-start gap-7 sm:gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
                  {/* Left Full-Screen Editorial Column */}
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#3ee3a0]/40 bg-[#041c13]/85 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-[#3ee3a0] backdrop-blur-md">
                      <span className="hex h-2 w-2 bg-[#3ee3a0]" aria-hidden />
                      <span>{String(n).padStart(2, "0")}</span>
                    </div>

                    <h2
                      id={`${s.id}-heading`}
                      className="mt-4 font-display text-2xl font-extrabold leading-[1.15] tracking-tight !text-white drop-shadow-[0_3px_22px_rgba(0,0,0,0.75)] sm:mt-5 sm:text-4xl lg:text-[2.85rem]"
                    >
                      {t}
                    </h2>

                    <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-[#3ee3a0]/30 bg-[#041c13]/85 px-3.5 py-2 text-xs font-semibold text-white/90 backdrop-blur-md sm:mt-5 sm:px-4">
                      <Truck size={15} className="shrink-0 text-[#3ee3a0]" aria-hidden />
                      <span>Nationwide UK dispatch · Checked engine specification</span>
                    </div>

                    <div className="mt-6 sm:mt-7">
                      <Link
                        href="#get-quote"
                        className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#08794D] to-[#14b574] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-8px_rgba(20,181,116,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-6px_rgba(20,181,116,0.9)] sm:w-auto"
                      >
                        <span>Request UK Delivery Quote</span>
                        <ArrowUpRight size={16} aria-hidden />
                      </Link>
                    </div>
                  </div>

                  {/* Right Translucent Dark-Emerald Glass Panel */}
                  <div className="min-w-0 rounded-2xl border border-[#3ee3a0]/30 bg-[#041710]/82 p-5 text-white shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md sm:p-8 lg:p-10 [&_a]:!font-semibold [&_a]:!text-[#3ee3a0] hover:[&_a]:!underline [&_blockquote]:mt-5 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-[#3ee3a0] [&_blockquote]:bg-[#07261a]/90 [&_blockquote]:px-4 [&_blockquote]:py-3.5 [&_blockquote]:text-xs [&_blockquote]:!text-white/90 sm:[&_blockquote]:mt-6 sm:[&_blockquote]:px-5 sm:[&_blockquote]:py-4 sm:[&_blockquote]:text-sm [&_li]:!text-white/90 [&_li_strong]:!text-white [&_p]:text-sm [&_p]:leading-relaxed [&_p]:!text-white/90 sm:[&_p]:text-base [&_p_strong]:!text-white [&_span]:!text-inherit [&_strong]:!text-white [&_ul]:my-3 [&_ul]:space-y-2.5 sm:[&_ul]:my-4 sm:[&_ul]:space-y-3">
                    <BlockRenderer blocks={s.blocks} />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // Section 08: Bespoke editorial showcase with framed dark-emerald artwork + elevated white content sheet
        if (n === 8) {
          return (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-heading`}
              className="scroll-mt-24 overflow-x-clip border-y border-forest/10 bg-gradient-to-b from-[#f4f9f6] via-white to-[#f4f9f6] py-14 sm:py-24"
            >
              <div className="wrap min-w-0 space-y-8 sm:space-y-10 lg:space-y-12">
                <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald/25 bg-white px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-emerald shadow-sm">
                      <span className="hex h-2.5 w-2.5 bg-[#18b777]" aria-hidden />
                      <span>{String(n).padStart(2, "0")}</span>
                    </div>

                    <h2
                      id={`${s.id}-heading`}
                      className="mt-4 font-display text-2xl font-extrabold leading-[1.15] tracking-tight text-forest sm:text-4xl lg:text-[2.5rem]"
                    >
                      {t}
                    </h2>

                    <div className="mt-4 h-[2px] w-24 bg-gradient-to-r from-[#08794D] via-[#18b777] to-transparent sm:mt-5" />

                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-forest/75 sm:mt-5 sm:text-base">
                      Practical technical guidance, real-world Range Rover Sport engine considerations, and specialist workshop notes to help you plan with confidence.
                    </p>
                  </div>

                  <div className="relative isolate min-h-[210px] overflow-hidden rounded-2xl border border-[#3ee3a0]/35 bg-[#041710] p-5 text-white shadow-[0_24px_60px_-24px_rgba(4,23,16,0.55)] sm:min-h-[240px] sm:p-7">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={SECTION_EIGHT_IMG}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center opacity-70"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-[#03130c]/95 via-[#052418]/65 to-[#03130c]/50"
                    />

                    <div className="relative z-20 flex h-full flex-col justify-between">
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#3ee3a0]/30 bg-[#041c13]/85 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#3ee3a0] backdrop-blur-sm">
                        <ShieldCheck size={13} aria-hidden />
                        <span>JLR Technical Notes</span>
                      </span>

                      <div className="mt-8 border-l-2 border-[#3ee3a0] pl-3.5 sm:mt-10">
                        <p className="font-display text-base font-bold text-white sm:text-lg">
                          Informed by Workshop Diagnostics
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-white/80">
                          Clear explanations before committing to parts, rebuild scope, or fitting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 rounded-2xl border border-forest/12 border-t-[3px] border-t-[#08794D] bg-white p-4 text-forest shadow-[0_20px_50px_-24px_rgba(4,23,16,0.18)] sm:p-8 lg:p-10 [&_a]:font-semibold [&_a]:text-emerald hover:[&_a]:underline [&_blockquote]:mt-5 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-emerald [&_blockquote]:bg-[#f4f9f6] [&_blockquote]:px-4 [&_blockquote]:py-3.5 [&_blockquote]:text-xs [&_blockquote]:text-forest/85 sm:[&_blockquote]:mt-6 sm:[&_blockquote]:px-5 sm:[&_blockquote]:py-4 sm:[&_blockquote]:text-sm [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-forest sm:[&_h3]:mt-7 sm:[&_h3]:text-xl [&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-forest/85 sm:[&_li]:text-base [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-forest/85 sm:[&_p]:text-base [&_strong]:font-bold [&_strong]:text-forest [&_table]:my-4 [&_table]:w-full [&_table]:min-w-[480px] [&_table]:border-collapse [&_td]:border-b [&_td]:border-forest/10 [&_td]:px-3 [&_td]:py-3 [&_td]:text-xs [&_td]:text-forest/90 sm:[&_td]:px-4 sm:[&_td]:py-4 sm:[&_td]:text-sm [&_th]:border-b [&_th]:border-forest/15 [&_th]:bg-[#f4f9f6] [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-display [&_th]:text-[11px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:tracking-[0.14em] [&_th]:text-forest/80 sm:[&_th]:px-4 sm:[&_th]:text-xs [&_ul]:my-3 [&_ul]:space-y-2.5 sm:[&_ul]:my-4 sm:[&_ul]:space-y-3">
                  <div className="overflow-x-auto">
                    <BlockRenderer blocks={s.blocks} />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // Section 14: Split matrix card with visible left image + clean white content column
        if (n === 14) {
          return (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-heading`}
              className="scroll-mt-24 overflow-x-clip border-y border-forest/10 bg-[#f7fbf9] py-14 sm:py-24"
            >
              <div className="wrap min-w-0">
                <div className="min-w-0 overflow-hidden rounded-3xl border border-forest/12 bg-white shadow-[0_24px_60px_-25px_rgba(4,23,16,0.18)]">
                  <div className="grid min-w-0 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                    {/* Left Feature Rail with properly stacked background image */}
                    <div className="relative isolate flex min-h-[260px] flex-col justify-between overflow-hidden bg-[#041710] p-5 text-white sm:min-h-[300px] sm:p-8 lg:min-h-full lg:p-10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={SECTION_FOURTEEN_IMG}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center opacity-65"
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[#03130c]/85 via-[#052418]/68 to-[#020d09]/92"
                      />

                      <div className="relative z-20 min-w-0">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#3ee3a0]/35 bg-[#041c13]/85 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.2em] text-[#3ee3a0] backdrop-blur-sm">
                          <Layers size={13} aria-hidden />
                          <span>Section {String(n).padStart(2, "0")}</span>
                        </span>

                        <h2
                          id={`${s.id}-heading`}
                          className="mt-4 font-display text-2xl font-extrabold leading-[1.15] tracking-tight !text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)] sm:text-3xl lg:text-[2.15rem]"
                        >
                          {t}
                        </h2>
                      </div>

                      <div className="relative z-20 mt-8 rounded-2xl border border-[#3ee3a0]/25 bg-[#041c13]/85 p-4 backdrop-blur-sm sm:mt-10">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3ee3a0]">
                          Specification Breakdown
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-white/85">
                          Structured by build detail and engine configuration so you can compare options cleanly.
                        </p>
                      </div>
                    </div>

                    {/* Right Clean Content Column */}
                    <div className="min-w-0 p-4 text-forest sm:p-8 lg:p-10 [&_a]:font-semibold [&_a]:text-emerald hover:[&_a]:underline [&_blockquote]:mt-5 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-emerald [&_blockquote]:bg-[#f4f9f6] [&_blockquote]:px-4 [&_blockquote]:py-3.5 [&_blockquote]:text-xs [&_blockquote]:text-forest/85 sm:[&_blockquote]:mt-6 sm:[&_blockquote]:px-5 sm:[&_blockquote]:py-4 sm:[&_blockquote]:text-sm [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-forest sm:[&_h3]:text-xl [&_li]:text-sm [&_li]:leading-relaxed [&_li]:text-forest/85 sm:[&_li]:text-base [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-forest/85 sm:[&_p]:text-base [&_strong]:font-bold [&_strong]:text-forest [&_table]:my-4 [&_table]:w-full [&_table]:min-w-[480px] [&_table]:border-collapse [&_td]:border-b [&_td]:border-forest/10 [&_td]:px-3 [&_td]:py-3 [&_td]:text-xs [&_td]:text-forest/90 sm:[&_td]:px-4 sm:[&_td]:py-4 sm:[&_td]:text-sm [&_th]:border-b [&_th]:border-forest/15 [&_th]:bg-[#f4f9f6] [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-display [&_th]:text-[11px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:tracking-[0.14em] [&_th]:text-forest/80 sm:[&_th]:px-4 sm:[&_th]:text-xs [&_ul]:my-3 [&_ul]:space-y-2.5 sm:[&_ul]:my-4 sm:[&_ul]:space-y-3">
                      <div className="overflow-x-auto">
                        <BlockRenderer blocks={s.blocks} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // Section 18: Full-bleed background showcase + crisp white band above footer when last
        if (n === 18) {
          return (
            <section
              key={s.id}
              id={s.id}
              aria-labelledby={`${s.id}-heading`}
              className={`group relative isolate scroll-mt-24 overflow-x-clip py-16 sm:py-28 ${
                isLast
                  ? "border-t border-forest/10 bg-white text-forest"
                  : "border-y border-[#3ee3a0]/25 bg-[#041710] text-white"
              }`}
            >
              {/* Full-bleed section background */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={SECTION_EIGHTEEN_BG}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center opacity-70 transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                />
                {isLast ? (
                  <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/92 via-white/86 to-white/96" />
                ) : (
                  <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#03130c]/88 via-[#041b12]/78 to-[#03130c]/94" />
                )}
              </div>

              <div className="wrap relative z-20 min-w-0 space-y-7 sm:space-y-10">
                <div className="max-w-3xl min-w-0">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.2em] ${
                      isLast
                        ? "border border-emerald/25 bg-white text-emerald shadow-sm"
                        : "border border-[#3ee3a0]/35 bg-[#041c13]/85 text-[#3ee3a0] backdrop-blur-md"
                    }`}
                  >
                    <span
                      className={`hex h-2 w-2 ${isLast ? "bg-[#18b777]" : "bg-[#3ee3a0]"}`}
                      aria-hidden
                    />
                    <span>{String(n).padStart(2, "0")}</span>
                  </div>

                  <h2
                    id={`${s.id}-heading`}
                    className={`mt-4 font-display text-2xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.5rem] ${
                      isLast ? "text-forest" : "!text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)]"
                    }`}
                  >
                    {t}
                  </h2>
                </div>

                <div
                  className={`min-w-0 rounded-2xl p-4 sm:p-8 lg:p-10 ${
                    isLast
                      ? "border border-forest/12 bg-white text-forest shadow-[0_20px_50px_-24px_rgba(4,23,16,0.16)] [&_a]:font-semibold [&_a]:text-emerald hover:[&_a]:underline [&_blockquote]:mt-5 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-emerald [&_blockquote]:bg-[#f4f9f6] [&_blockquote]:px-4 [&_blockquote]:py-3.5 [&_blockquote]:text-xs [&_blockquote]:text-forest/85 sm:[&_blockquote]:mt-6 sm:[&_blockquote]:px-5 sm:[&_blockquote]:py-4 sm:[&_blockquote]:text-sm [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-forest [&_li]:text-sm [&_li]:text-forest/85 sm:[&_li]:text-base [&_p]:text-sm [&_p]:text-forest/85 sm:[&_p]:text-base [&_strong]:text-forest [&_table]:my-4 [&_table]:w-full [&_table]:min-w-[480px] [&_table]:border-collapse [&_td]:border-b [&_td]:border-forest/10 [&_td]:px-3 [&_td]:py-3 [&_td]:text-xs [&_td]:text-forest/90 sm:[&_td]:px-4 sm:[&_td]:py-4 sm:[&_td]:text-sm [&_th]:border-b [&_th]:border-forest/15 [&_th]:bg-[#f4f9f6] [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-display [&_th]:text-[11px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:tracking-[0.14em] [&_th]:text-forest/80 sm:[&_th]:px-4 sm:[&_th]:text-xs [&_ul]:my-3 [&_ul]:space-y-2.5 sm:[&_ul]:my-4 sm:[&_ul]:space-y-3"
                      : "border border-[#3ee3a0]/30 bg-[#041710]/85 text-white shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md [&_a]:!font-semibold [&_a]:!text-[#3ee3a0] hover:[&_a]:!underline [&_blockquote]:mt-5 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-[#3ee3a0] [&_blockquote]:bg-[#07261a]/90 [&_blockquote]:px-4 [&_blockquote]:py-3.5 [&_blockquote]:text-xs [&_blockquote]:!text-white/90 sm:[&_blockquote]:mt-6 sm:[&_blockquote]:px-5 sm:[&_blockquote]:py-4 sm:[&_blockquote]:text-sm [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:!text-white [&_li]:text-sm [&_li]:!text-white/90 sm:[&_li]:text-base [&_p]:text-sm [&_p]:!text-white/90 sm:[&_p]:text-base [&_strong]:!text-white [&_table]:my-4 [&_table]:w-full [&_table]:min-w-[480px] [&_table]:border-collapse [&_td]:border-b [&_td]:border-white/15 [&_td]:px-3 [&_td]:py-3 [&_td]:text-xs [&_td]:!text-white sm:[&_td]:px-4 sm:[&_td]:py-4 sm:[&_td]:text-sm [&_th]:border-b [&_th]:border-[#3ee3a0]/30 [&_th]:bg-[#08261a] [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-display [&_th]:text-[11px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:tracking-[0.14em] [&_th]:!text-[#3ee3a0] sm:[&_th]:px-4 sm:[&_th]:text-xs [&_ul]:my-3 [&_ul]:space-y-2.5 sm:[&_ul]:my-4 sm:[&_ul]:space-y-3"
                  }`}
                >
                  <div className="overflow-x-auto">
                    <BlockRenderer blocks={s.blocks} />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        const wide =
          t.includes("by Year, Generation") ||
          t.includes("Prices") ||
          t.includes("by Badge") ||
          t.startsWith("Rebuild, Supply") ||
          t.startsWith("Common Engine");
        const mist =
          t.includes("by Year") || t.startsWith("Rebuild, Supply") || t.includes("Cost Breakdown");

        return (
          <Sec
            key={s.id}
            id={s.id}
            title={t}
            index={n}
            wide={wide}
            tone={isLast ? "white" : mist ? "mist" : "white"}
          >
            <BlockRenderer blocks={s.blocks} />
          </Sec>
        );
      })}
    </div>
  );
}