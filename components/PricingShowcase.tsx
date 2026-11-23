"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { BlockRenderer } from "@/components/Blocks";
import type { Block } from "@/lib/content";

const DEFAULT_IMG = "/media/pricing-bg.png";
const FALLBACK_IMG = "/media/quote.png";

const CUT =
  "[--c:16px] sm:[--c:24px] [clip-path:polygon(0_0,calc(100%-var(--c))_0,100%_var(--c),100%_100%,var(--c)_100%,0_calc(100%-var(--c)))]";

const reduced = () =>
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

interface PricingShowcaseProps {
  id: string;
  index: number;
  title: string;
  blocks: Block[];
  imageSrc?: string;
}

export default function PricingShowcase({
  id,
  index,
  title,
  blocks,
  imageSrc = DEFAULT_IMG,
}: PricingShowcaseProps) {
  const root = useRef<HTMLElement>(null);
  const [src, setSrc] = useState(imageSrc);
  const [imgOk, setImgOk] = useState(true);

  const formattedIndex = String(index).padStart(2, "0");

  useEffect(() => {
    setSrc(imageSrc || DEFAULT_IMG);
    setImgOk(true);
  }, [imageSrc]);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced()) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const once = { trigger: el, start: "top 84%", once: true };

      gsap.from(q("[data-ps-anim]"), {
        y: 28,
        opacity: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: once,
      });

      gsap.to(q("[data-ps-bg]"), {
        scale: 1.06,
        duration: 16,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const handleImgError = () => {
    if (src !== FALLBACK_IMG) {
      setSrc(FALLBACK_IMG);
    } else {
      setImgOk(false);
    }
  };

  return (
    <section
      id={id}
      ref={root}
      aria-labelledby={`${id}-heading`}
      className="group relative isolate scroll-mt-24 overflow-x-clip border-y border-[#3ee3a0]/25 bg-[#04160f] py-12 text-white sm:py-20 lg:py-24"
    >
      {/* Full-bleed background image across the entire section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-ps-bg
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            onError={handleImgError}
            className="h-full w-full object-cover object-center opacity-65 transition-transform duration-1000 ease-out"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-b from-[#03130c]/88 via-[#041b12]/78 to-[#03130c]/94" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(24,183,119,0.18),transparent_55%)]" />
      </div>

      {/* Top emerald accent line */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-[#18b777] via-[#3ee3a0] to-[#08794D]"
      />

      <div className="wrap relative z-10 min-w-0 space-y-8 sm:space-y-12">
        {/* Responsive Section Header */}
        <div className="min-w-0 max-w-3xl">
          <div
            data-ps-anim
            className="inline-flex items-center gap-2 rounded-full border border-[#3ee3a0]/35 bg-[#041c13]/80 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#3ee3a0] backdrop-blur-md sm:px-3.5 sm:py-1.5 sm:text-xs"
          >
            <span className="hex h-2 w-2 bg-[#3ee3a0] sm:h-2.5 sm:w-2.5" aria-hidden />
            <span>{formattedIndex}</span>
          </div>

          <h2
            id={`${id}-heading`}
            data-ps-anim
            className="mt-3.5 font-display text-2xl font-extrabold leading-[1.15] tracking-tight !text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)] sm:mt-4 sm:text-4xl lg:text-[2.65rem]"
          >
            {title}
          </h2>

          <p
            data-ps-anim
            className="mt-3 text-sm leading-relaxed text-white/85 sm:mt-4 sm:text-lg"
          >
            Transparent starting figures across rebuild, supply &amp; fit, and
            application-specific Range Rover Sport engines—backed by workshop
            diagnostics and clear written terms.
          </p>

          <div
            data-ps-anim
            className="mt-5 flex flex-col items-stretch gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
          >
            <Link
              href="#get-quote"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#08794D] to-[#14b574] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_26px_-8px_rgba(20,181,116,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-6px_rgba(20,181,116,0.9)] sm:px-6"
            >
              <span>Lock In Your Quote</span>
              <ArrowUpRight size={16} aria-hidden />
            </Link>

            <span className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full border border-white/15 bg-[#041c13]/80 px-3.5 py-2 text-xs font-semibold text-white/85 backdrop-blur-md sm:justify-start sm:px-4">
              <ShieldCheck size={15} className="shrink-0 text-[#3ee3a0]" aria-hidden />
              <span>Written scope before work starts</span>
            </span>
          </div>
        </div>

        {/* Responsive Chamfered Dark Emerald Pricing Box */}
        <div
          data-ps-anim
          className={`min-w-0 bg-[#3ee3a0]/35 p-[1.5px] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85)] ${CUT}`}
        >
          <div
            className={`min-w-0 bg-[#04160f]/90 p-4 text-white backdrop-blur-md sm:p-8 ${CUT} [&_a]:!text-[#3ee3a0] hover:[&_a]:!underline [&_blockquote]:mt-5 [&_blockquote]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-[#3ee3a0] [&_blockquote]:bg-[#08261a]/90 [&_blockquote]:px-4 [&_blockquote]:py-3.5 [&_blockquote]:text-xs [&_blockquote]:!text-white/90 sm:[&_blockquote]:mt-6 sm:[&_blockquote]:px-5 sm:[&_blockquote]:py-4 sm:[&_blockquote]:text-sm [&_p]:text-xs [&_p]:!text-white/85 sm:[&_p]:text-sm [&_strong]:!text-white [&_strong_a]:!text-[#3ee3a0] [&_table]:my-4 [&_table]:w-full [&_table]:min-w-[540px] [&_table]:border-collapse [&_td]:border-b [&_td]:border-white/15 [&_td]:px-3 [&_td]:py-3 [&_td]:text-xs [&_td]:!text-white sm:[&_td]:px-4 sm:[&_td]:py-4 sm:[&_td]:text-sm [&_td_a]:!text-[#3ee3a0] [&_th]:border-b [&_th]:border-[#3ee3a0]/30 [&_th]:bg-[#08261a] [&_th]:px-3 [&_th]:py-3 [&_th]:text-left [&_th]:font-display [&_th]:text-[11px] [&_th]:font-extrabold [&_th]:uppercase [&_th]:tracking-[0.12em] [&_th]:!text-[#3ee3a0] sm:[&_th]:px-4 sm:[&_th]:py-3.5 sm:[&_th]:text-xs sm:[&_th]:tracking-[0.14em] [&_tr]:transition-colors hover:[&_tbody_tr]:bg-[#3ee3a0]/[0.08]`}
          >
            <div className="overflow-x-auto">
              <BlockRenderer blocks={blocks} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}