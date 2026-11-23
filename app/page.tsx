import type { Metadata } from "next";
import { loadDoc, toSections } from "@/lib/content";
import { Md } from "@/components/Md";
import { BlockRenderer, HexDeco, Sec, Steps } from "@/components/Blocks";
import QuotePanel from "@/components/QuotePanel";
import { ShieldCheck, Clock, Truck } from "lucide-react";
import ModelShowcase, { type ModelGroup } from "@/components/ModelShowcase";
import fs from "node:fs";
import path from "node:path";
import { WhyChoose } from "@/components/Showpieces";
import EngineCatalogue from "@/components/EngineCatalogue";
import Hero from "@/components/Hero";
import ImageSec from "@/components/ImageSec";
import ExclusiveFaq from "@/components/ExclusiveFaq";

const doc = loadDoc("homepage.md");

/* ✏️ Sections that get a big background picture (title starts with ... -> image in /public/media) */
const SECTION_BG: Record<string, string> = {
  "Engine Rebuilding": "/media/image.png",
};

const SHOWCASE_VIDEOS = ["range-rover", "range-rover-sport", "range-rover-velar"].filter((k) =>
  fs.existsSync(path.join(process.cwd(), "public", "media", `${k}.mp4`))
);

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

  const order = sections.map((s) => s.id);
  const idx = (id: string) => order.indexOf(id) + 1;

  return (
    <>
      {/* ================= HERO ================= */}
      <Hero
        title={h1 && h1.t === "h" ? h1.text : ""}
        lede={lede && <Md text={lede.text} />}
        ctaText={cta ? cta.text : ""}
        quote={<QuotePanel id="get-quote" extras preset="rebuild" wide />}
        prices={hooks.flatMap((h) => {
          const x = hook(h.text);
          return x ? [{ label: x.label, price: x.price, note: x.note }] : [];
        })}
      />

      {/* ================= trust strip (from supplied copy) ================= */}
      <section aria-label="Why customers choose us" className="border-y border-forest/10 bg-white">
        <ul className="wrap grid divide-y divide-forest/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0" data-stagger="0.1">
          {[
            { i: Clock, a: "More than 15 years", b: "of industry experience" },
            { i: ShieldCheck, a: "12-month warranty", b: "unlimited mileage, subject to the written terms" },
            { i: Truck, a: "UK-wide recovery from £70", b: "no recovery markup" },
          ].map((s, i) => (
            <li key={i} className="flex items-center gap-4 py-5 sm:py-6 sm:px-6 first:sm:pl-0">
              <span className="hex grid h-11 w-10 shrink-0 place-items-center bg-emerald/10 text-emerald sm:h-12 sm:w-11">
                <s.i size={20} aria-hidden />
              </span>
              <span className="leading-tight">
                <strong className="block font-display text-base text-forest sm:text-lg">{s.a}</strong>
                <span className="text-xs text-ink/65 sm:text-sm">{s.b}</span>
              </span>
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
              <div className="mt-12">
                <BlockRenderer blocks={rest} />
              </div>
            </Sec>
          );
        }

        /* ================= FAQ — white ================= */
        if (s.title.startsWith("Frequently")) {
          return (
            <Sec key={s.id} id={s.id} title={s.title} index={n} tone="white">
              <ExclusiveFaq light blocks={s.blocks as never} />
            </Sec>
          );
        }

        if (s.title.startsWith("UK-Wide Recovery")) {
          const shortDesc =
            "Based in Ramsden Heath, Billericay, Essex. Vehicle collection starts from £70 depending on distance, location, and access—with full pricing confirmed upfront, zero markup, and separate return transport.";
          const recoveryNote =
            "An independent recovery provider confirms the full payable total before booking, with no markup added.";

          return (
            <div key={s.id} className="relative overflow-hidden bg-forest">
              <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/image-two.png"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#041810]/90 via-[#063C29]/70 to-[#041810]/75" />
              </div>

              {/* Left-side hex animation */}
              <HexDeco
                className="-left-14 top-1/2 z-10 h-[340px] w-[290px] -translate-y-1/2 text-emerald-light/25"
                draw
              />

              <div className="relative z-10 [&>.section]:!bg-transparent [&_.section\_\_index]:!text-white [&_[data-sec-index]]:!text-white">
                <Sec id={s.id} title={s.title} index={n} tone="forest" deco={false}>
                  <div className="max-w-2xl space-y-5 text-white">
                    <p className="text-base leading-relaxed text-white/90 sm:text-[1.05rem]">
                      {shortDesc}
                    </p>

                    <div className="rounded-xl border border-emerald-light/30 bg-[#041810]/70 px-4 py-3 text-sm leading-relaxed text-white/90 backdrop-blur-sm">
                      <span className="font-bold text-emerald-light">Recovery note: </span>
                      <span>{recoveryNote}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-sm font-semibold">
                      <a
                        href="/vehicle-collection-and-delivery/"
                        className="text-emerald-light underline decoration-emerald-light/50 underline-offset-4 transition hover:text-white"
                      >
                        Vehicle collection and delivery
                      </a>
                      <span className="text-white/30" aria-hidden>
                        ·
                      </span>
                      <a
                        href="/contact-us/"
                        className="text-emerald-light underline decoration-emerald-light/50 underline-offset-4 transition hover:text-white"
                      >
                        Contact the workshop
                      </a>
                    </div>
                  </div>
                </Sec>
              </div>
            </div>
          );
        }

        if (s.title.startsWith("Choose Your")) {
          const firstH = s.blocks.findIndex((b) => b.t === "h");
          const intro = s.blocks.slice(0, firstH).flatMap((b) => (b.t === "p" ? [b.text] : []));
          const groups: ModelGroup[] = [];
          const outro: string[] = [];

          s.blocks.slice(firstH).forEach((b) => {
            if (b.t === "h") groups.push({ title: b.text, rows: [] });
            else if (b.t === "table") {
              groups[groups.length - 1].rows = b.rows.map((r) => ({
                model: r[0],
                covers: r[1],
                cta: r[2],
              }));
            } else if (b.t === "p") {
              outro.push(b.text);
            }
          });

          return (
            <section
              key={s.id}
              id={s.id}
              className="section !pb-0 overflow-hidden"
              aria-labelledby={`${s.id}-h`}
            >
              <ModelShowcase intro={intro} groups={groups} outro={outro} videos={SHOWCASE_VIDEOS} />
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
            else if (b.t === "table") {
              const g = groups[groups.length - 1];
              g.head = b.head;
              g.rows = b.rows;
            } else if (b.t === "p") {
              outro.push(b.text);
            }
          });

          return (
            <Sec key={s.id} id={s.id} title={s.title} index={n} wide>
              <EngineCatalogue intro={intro} groups={groups} outro={outro} />
            </Sec>
          );
        }

        if (s.title.startsWith("Replacement Engines")) {
          return (
            <div
              key={s.id}
              className="relative overflow-hidden bg-[#04140e] text-white"
              style={{
                background:
                  "radial-gradient(85% 75% at 85% 25%, #0c4d35 0%, #052419 52%, #03100b 100%)",
              }}
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-75">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/replacement-engines-bg.png"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#03110b]/92 via-[#052419]/60 to-[#03110b]/35" />
              </div>

              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 z-10 h-[3px] w-full bg-gradient-to-r from-emerald-light via-emerald to-transparent"
              />

              <div className="relative z-10 [&>.section]:!bg-transparent [&_.section\_\_index]:!text-white [&_[data-sec-index]]:!text-white">
                <Sec id={s.id} title={s.title} index={n} tone="forest" wide deco={false}>
                  <div className="max-w-3xl rounded-2xl border border-emerald-light/25 bg-[#041710]/78 p-5 shadow-[0_28px_70px_-25px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-8 [&_*]:!text-white/90 [&_h3]:!text-emerald-light [&_strong]:!text-white [&_a]:!text-emerald-light [&_table]:!w-full [&_th]:!border-white/15 [&_td]:!border-white/10">
                    <BlockRenderer blocks={s.blocks} />
                  </div>
                </Sec>
              </div>
            </div>
          );
        }

        if (s.title.startsWith("Which JLR Engine Codes")) {
          return (
            <div
              key={s.id}
              className="relative overflow-hidden bg-[#041710] text-white"
              style={{
                background:
                  "radial-gradient(85% 75% at 85% 25%, #0a4630 0%, #052016 55%, #03100b 100%)",
              }}
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-65">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/mainimg.png"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#03110b]/90 via-[#052016]/72 to-[#03110b]/45" />
              </div>

              <div className="relative z-10 [&>.section]:!bg-transparent [&>.section]:!py-12 lg:[&>.section]:!py-16 [&_.section\_\_index]:!text-white [&_[data-sec-index]]:!text-white">
                <Sec id={s.id} title={s.title} index={n} tone="forest" wide deco={false}>
                  <div className="rounded-2xl border border-emerald-light/25 bg-[#041710]/80 p-5 shadow-[0_24px_60px_-25px_rgba(0,0,0,0.85)] backdrop-blur-md sm:p-6 [&_*]:!text-white/90 [&_p]:!text-sm [&_p]:!leading-snug [&_strong]:!text-emerald-light [&_a]:!text-emerald-light [&_ul]:!m-0 [&_ul]:grid [&_ul]:grid-cols-1 [&_ul]:gap-2.5 [&_ul]:md:grid-cols-2 [&_li]:!m-0 [&_li]:rounded-xl [&_li]:border [&_li]:border-emerald-light/20 [&_li]:bg-[#08261a]/85 [&_li]:p-3.5 [&_li]:text-xs [&_li]:leading-relaxed sm:[&_li]:text-sm [&_li]:transition [&_li]:hover:border-emerald-light/55">
                    <BlockRenderer blocks={s.blocks} />
                  </div>
                </Sec>
              </div>
            </div>
          );
        }

        /* ================= SECTION 11: WARRANTY & AFTERCARE (Sec 09 Header + Dynamic Dark Card) ================= */
        if (s.title.startsWith("Engine Rebuild Warranty")) {
          return (
            <Sec key={s.id} id={s.id} title={s.title} index={n} tone="white">
              <div className="relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 -z-10 bg-gradient-to-tr from-emerald/15 via-transparent to-emerald-light/20 opacity-70 blur-2xl transition-opacity duration-500"
                />

                <div
                  className="group relative overflow-hidden bg-[#101714] p-6 text-white shadow-[0_24px_55px_-22px_rgba(6,60,41,0.55)] ring-1 ring-white/10 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:ring-emerald-light/40 sm:p-8 [&_p]:!m-0 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-white/85 [&_p+p]:!mt-4 [&_strong]:font-semibold [&_strong]:text-white [&_a]:inline-flex [&_a]:items-center [&_a]:gap-1 [&_a]:rounded-md [&_a]:border [&_a]:border-emerald-light/25 [&_a]:bg-emerald/10 [&_a]:px-2.5 [&_a]:py-1 [&_a]:text-sm [&_a]:font-semibold [&_a]:text-emerald-light [&_a]:no-underline [&_a]:transition-all [&_a]:duration-300 hover:[&_a]:border-emerald-light/60 hover:[&_a]:bg-emerald/20 hover:[&_a]:text-white"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
                  }}
                >
                  <div className="relative mb-6 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                    <span
                      aria-hidden
                      className="block h-full w-28 animate-pulse bg-gradient-to-r from-emerald-light via-emerald to-emerald-light transition-all duration-500 ease-out group-hover:w-1/2"
                    />
                  </div>

                  <svg
                    viewBox="0 0 100 100"
                    aria-hidden
                    className="pointer-events-none absolute -bottom-8 -right-8 h-36 w-36 text-emerald-light/10 transition-transform duration-1000 ease-out group-hover:rotate-45 group-hover:scale-110"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" />
                    <polygon points="50,20 77,35.5 77,64.5 50,80 23,64.5 23,35.5" />
                  </svg>

                  <BlockRenderer blocks={s.blocks} />

                  <div className="relative z-10 mt-7 grid gap-4 border-t border-white/15 pt-5 text-xs sm:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5 transition-all duration-300 group-hover:border-emerald-light/30 group-hover:bg-emerald/[0.06]">
                      <span className="block font-bold uppercase tracking-[0.14em] text-emerald-light">
                        Workshop Rebuild &amp; Fit
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-white">
                        12-Month Unlimited Mileage
                      </span>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5 transition-all duration-300 group-hover:border-emerald-light/30 group-hover:bg-emerald/[0.06]">
                      <span className="block font-bold uppercase tracking-[0.14em] text-emerald-light">
                        Coverage Basis
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-white">
                        Subject to Written Terms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Sec>
          );
        }

        if (s.title.startsWith("Visit or Contact")) {
          const CUT =
            "[clip-path:polygon(0_0,calc(100%-26px)_0,100%_26px,100%_100%,26px_100%,0_calc(100%-26px))] sm:[clip-path:polygon(0_0,calc(100%-26px)_0,100%_26px,100%_100%,26px_100%,0_calc(100%-26px))]";
          return (
            <div key={s.id} className="relative isolate overflow-hidden bg-[#04140e] text-white">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/media/faqfinal.png"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#04140e]/90 via-[#04140e]/55 to-[#04140e]/10 max-lg:from-[#04140e]/88 max-lg:to-[#04140e]/78" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#04140e]/35 via-transparent to-[#04140e]/55" />
              </div>

              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 z-10 h-[3px] w-full bg-gradient-to-r from-emerald-light via-emerald to-transparent"
              />

              <div className="relative z-10 [&>.section]:!bg-transparent [&_.section\_\_index]:!text-white [&_[data-sec-index]]:!text-white [&_h2]:!text-white [&_h2]:drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)]">
                <Sec id={s.id} title={s.title} index={n} tone="forest" deco={false}>
                  <div className={`max-w-2xl bg-gradient-to-br from-emerald-light/70 via-white/15 to-emerald-light/20 p-px ${CUT}`}>
                    <div
                      className={`bg-[#04140e]/80 p-5 backdrop-blur-md sm:p-8 ${CUT} [&_p]:!m-0 [&_p]:!text-base [&_p]:!leading-relaxed [&_p]:!text-white/85 [&_p+p]:!mt-4 [&_strong]:!text-white [&_a]:!font-semibold [&_a]:!text-emerald-light [&_a]:underline [&_a]:decoration-emerald-light/40 [&_a]:underline-offset-4 hover:[&_a]:!text-white`}
                    >
                      <BlockRenderer blocks={s.blocks} />

                      <div className="mt-6 grid gap-5 border-t border-white/15 pt-5 sm:mt-7 sm:gap-6 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-white/15">
                        <div className="sm:pr-6">
                          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-light">
                            Workshop Location
                          </span>
                          <span className="mt-1.5 block text-base font-extrabold sm:text-lg">Ramsden Heath, Billericay</span>
                        </div>
                        <a href="tel:02034884649" className="group/p block !no-underline sm:pl-6">
                          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-light">
                            Direct Telephone
                          </span>
                          <span className="mt-1.5 block text-base font-extrabold !text-white transition-colors group-hover/p:!text-emerald-light sm:text-lg">
                            0203 488 4649
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </Sec>
              </div>
            </div>
          );
        }

        const bgKey = Object.keys(SECTION_BG).find((k) => s.title.startsWith(k));
        if (bgKey) {
          return (
            <ImageSec key={s.id} id={s.id} title={s.title} index={n} image={SECTION_BG[bgKey]}>
              <BlockRenderer blocks={s.blocks} />
            </ImageSec>
          );
        }

        const wide = s.title.startsWith("Find Jaguar") || s.title.startsWith("Choose Your");
        const tone =
          s.title.startsWith("Engine Rebuilding") ||
          s.title.startsWith("Engines for Sale") ||
          s.title.startsWith("Common Engine")
            ? "mist"
            : "white";

        return (
          <Sec key={s.id} id={s.id} title={s.title} index={n} wide={wide} tone={tone}>
            <BlockRenderer blocks={s.blocks} />
          </Sec>
        );
      })}
    </>
  );
}