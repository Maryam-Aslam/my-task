export default function Logo({ light = false }: { light?: boolean }) {
  const accent = light ? "#18b777" : "#08794d";
  const textColor = light ? "#fff" : "#063c29";

  return (
    <span
      className="group inline-flex select-none items-center gap-3 transition-transform duration-300 ease-out hover:scale-[1.02]"
      aria-label="JLR Specialist"
    >
      <svg
        width="34"
        height="38"
        viewBox="0 0 34 38"
        aria-hidden="true"
        className="overflow-visible shrink-0"
      >
        {/* Outer hexagon with subtle rotation & glow on hover */}
        <polygon
          points="17,1 32,9.5 32,28.5 17,37 2,28.5 2,9.5"
          fill="none"
          stroke={accent}
          strokeWidth="2.2"
          className="origin-center transition-transform duration-500 ease-out group-hover:rotate-[30deg] group-hover:scale-105"
        />

        {/* Inner hexagon core with gentle scale & ambient pulse */}
        <polygon
          points="17,10 25,14.5 25,23.5 17,28 9,23.5 9,14.5"
          fill={accent}
          className="origin-center transition-all duration-300 ease-out group-hover:scale-90 group-hover:opacity-90"
        />
      </svg>

      <span
        className="font-display text-[1.05rem] font-bold leading-none tracking-tight transition-transform duration-300 ease-out group-hover:translate-x-0.5"
        style={{ color: textColor }}
      >
        JLR
        <span
          className="mx-1.5 inline-block opacity-40 transition-all duration-300 group-hover:rotate-12 group-hover:opacity-90"
          style={{ color: accent }}
        >
          /
        </span>
        <span className="font-semibold">SPECIALIST</span>
      </span>
    </span>
  );
}