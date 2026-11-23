"use client";

import { useState } from "react";
import { Md } from "@/components/Md";
import { Plus, X } from "lucide-react";

type Block =
  | { t: "h"; level: number; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "table"; head: string[]; rows: string[][] };

interface FaqItem {
  question: string;
  answerBlocks: Block[];
}

function parseFaqBlocks(blocks: Block[]): FaqItem[] {
  const items: FaqItem[] = [];
  let current: FaqItem | null = null;

  for (const b of blocks) {
    if (b.t === "h" && b.level >= 2) {
      if (current) items.push(current);
      current = { question: b.text, answerBlocks: [] };
    } else if (current) {
      current.answerBlocks.push(b);
    } else if (b.t === "p") {
      const boldMatch = /^\*\*(.+?)\*\*\s*([\s\S]*)$/.exec(b.text);
      if (boldMatch) {
        items.push({
          question: boldMatch[1],
          answerBlocks: boldMatch[2] ? [{ t: "p", text: boldMatch[2] }] : [],
        });
      }
    }
  }

  if (current) items.push(current);
  return items;
}

/** light = white section style, default = dark/green style */
export default function ExclusiveFaq({ blocks, light = false }: { blocks: Block[]; light?: boolean }) {
  const items = parseFaqBlocks(blocks);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const qColor = (open: boolean) => (light ? (open ? "#08794D" : "#063C29") : open ? "#34d399" : "#ffffff");
  const aColor = light ? "#2b3a34" : "#f3f7f5";

  return (
    <div className="faq space-y-3" role="region" aria-label="Frequently asked questions">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;

        const shell = light
          ? isOpen
            ? "border-emerald/50 bg-white shadow-[0_18px_40px_-18px_rgba(6,60,41,0.35)]"
            : "border-forest/12 bg-white hover:border-emerald/40 hover:shadow-[0_12px_30px_-18px_rgba(6,60,41,0.3)]"
          : isOpen
            ? "border-emerald-light/60 bg-[#04140e]/85 shadow-[0_16px_36px_-12px_rgba(0,0,0,0.8)]"
            : "border-white/20 bg-[#04140e]/45 hover:border-emerald-light/40 hover:bg-[#04140e]/65";

        const icon = light
          ? isOpen
            ? "rotate-90 border-emerald bg-emerald text-white"
            : "border-forest/20 bg-emerald/10 text-emerald"
          : isOpen
            ? "rotate-90 border-emerald-light bg-emerald text-white"
            : "border-white/30 bg-white/10 text-white";

        return (
          <div
            key={`${item.question}-${idx}`}
            className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${light ? "" : "backdrop-blur-md"} ${shell}`}
          >
            {/* emerald accent bar on the open item (light style) */}
            {light && (
              <span
                aria-hidden
                className={`absolute inset-y-0 left-0 w-1 origin-top bg-gradient-to-b from-emerald-light to-emerald transition-transform duration-300 ${
                  isOpen ? "scale-y-100" : "scale-y-0"
                }`}
              />
            )}

            <button
              type="button"
              onClick={() => handleToggle(idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors"
            >
              <span
                style={{ color: qColor(isOpen) }}
                className="text-base font-semibold leading-snug sm:text-[1.02rem]"
              >
                {item.question}
              </span>

              <span
                aria-hidden="true"
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${icon}`}
              >
                {isOpen ? <X size={14} /> : <Plus size={14} />}
              </span>
            </button>

            {isOpen && (
              <div
                style={{ color: aColor }}
                className={`border-t px-5 pb-5 pt-3.5 text-sm leading-relaxed ${light ? "border-forest/10" : "border-white/15"}`}
              >
                {item.answerBlocks.map((ab, abIdx) => {
                  if (ab.t === "p") {
                    return (
                      <p key={abIdx} style={{ color: aColor }} className="m-0 text-sm leading-relaxed [&+p]:mt-3">
                        <Md text={ab.text} />
                      </p>
                    );
                  }
                  if (ab.t === "ul") {
                    return (
                      <ul key={abIdx} style={{ color: aColor }} className="mt-2 list-disc space-y-1.5 pl-5">
                        {ab.items.map((li, liIdx) => (
                          <li key={liIdx} style={{ color: aColor }}>
                            <Md text={li} />
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (ab.t === "ol") {
                    return (
                      <ol key={abIdx} style={{ color: aColor }} className="mt-2 list-decimal space-y-1.5 pl-5">
                        {ab.items.map((li, liIdx) => (
                          <li key={liIdx} style={{ color: aColor }}>
                            <Md text={li} />
                          </li>
                        ))}
                      </ol>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}