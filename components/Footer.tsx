import Link from "next/link";
import Logo from "./Logo";

const FOOTER_BG = "/media/footer.png";

const FOOTER_LINKS = [
  { href: "/engines/", label: "Engines" },
  { href: "/models/", label: "Models" },
  { href: "/engine-inspection/", label: "Engine problems" },
  { href: "/engine-warranty/", label: "Warranty" },
  { href: "/contact-us/", label: "Contact" },
];

const HEX = "[clip-path:polygon(25%_0,75%_0,100%_50%,75%_100%,25%_100%,0_50%)]";
const CUT = "[clip-path:polygon(0_0,calc(100%-26px)_0,100%_26px,100%_100%,26px_100%,0_calc(100%-26px))]";

export default function Footer() {
  return (
    <footer className="group relative isolate overflow-hidden bg-[#04120c] text-white">
      {/* background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FOOTER_BG}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-[30%_center] transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
        />
        {/* keep the car (left) clear, darken where text sits */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,18,12,0)_0%,rgba(4,18,12,.35)_40%,rgba(4,18,12,.82)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(4,18,12,.55),rgba(4,18,12,.85))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#04120c] to-transparent" />
      </div>

      {/* animated light line */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[2px] overflow-hidden bg-white/10">
        <span className="absolute inset-y-0 w-1/3 animate-[footline_5s_linear_infinite] bg-gradient-to-r from-transparent via-[#3ee3a0] to-transparent" />
      </div>
      <style>{`@keyframes footline{from{transform:translateX(-100%)}to{transform:translateX(400%)}}@media (prefers-reduced-motion:reduce){[class*="footline"]{animation:none!important}}`}</style>

      <div className="wrap relative py-16 lg:py-24">
        {/* ===== CTA — one panel, sits right so the car stays visible ===== */}
        <div className="lg:ml-auto lg:w-[58%]">
          <div className={`bg-gradient-to-br from-[#3ee3a0]/70 via-white/15 to-[#3ee3a0]/20 p-px ${CUT}`}>
            <div className={`bg-[#04140d]/80 px-6 py-9 backdrop-blur-md sm:px-10 sm:py-11 ${CUT}`}>
              <p className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[.22em] text-[#3ee3a0]">
                <span aria-hidden className={`h-2.5 w-2.5 bg-[#3ee3a0] ${HEX}`} />
                Free written quotation
              </p>
              <h2 className="mt-4 font-display !text-white text-[1.7rem] font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
  Request Your Jaguar, Land Rover or Range Rover Engine Quote
</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
                Choose rebuild, supply-and-fit or engine-only supply, then send your registration and symptoms. We will check the engine identity and explain the options in a written quotation.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/#get-quote"
                  className="group/b relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#08794D] to-[#14b574] px-7 text-sm font-bold shadow-[0_14px_34px_-10px_rgba(20,181,116,.8)] transition hover:-translate-y-0.5"
                >
                  <span aria-hidden className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 transition-transform duration-700 group-hover/b:translate-x-[420%]" />
                  <span className="relative">Request Your Free Engine Quote</span>
                  <span aria-hidden className="relative transition-transform group-hover/b:translate-x-1">→</span>
                </Link>
                <Link
                  href="/engines/"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-7 text-sm font-bold transition hover:-translate-y-0.5 hover:border-[#3ee3a0] hover:text-[#3ee3a0]"
                >
                  Request Current Price &amp; Availability
                </Link>
              </div>

              <a
                href="tel:02034884649"
                className="group/p mt-8 flex w-fit items-center gap-4 border-t border-white/15 pt-6"
              >
                <span aria-hidden className={`relative grid h-12 w-12 place-items-center bg-[#0b8a58] ${HEX}`}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                  </svg>
                </span>
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[.2em] text-white/55">Call the workshop</span>
                  <span className="block text-2xl font-extrabold tracking-tight transition-colors group-hover/p:text-[#3ee3a0]">0203 488 4649</span>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* ===== brand + nav — open row, no boxes ===== */}
        <div className="mt-14 grid gap-10 border-t border-white/15 pt-10 lg:mt-20 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-md">
            <Logo light />
            <p className="mt-5 text-sm leading-relaxed text-white/70">
              JLR Engine Specialists Ltd · Company No. 16500838. An independent specialist, not affiliated with Jaguar Land Rover.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-semibold">
              {FOOTER_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="group/l relative inline-flex items-center gap-2 py-1 text-white/85 transition hover:text-white">
                    <span aria-hidden className={`h-1.5 w-1.5 bg-[#3ee3a0] opacity-40 transition group-hover/l:scale-150 group-hover/l:opacity-100 ${HEX}`} />
                    {item.label}
                    <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-[#3ee3a0] transition-transform duration-300 group-hover/l:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}