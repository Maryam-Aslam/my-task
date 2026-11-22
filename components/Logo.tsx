export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3" aria-label="JLR Specialist">
      <svg width="34" height="38" viewBox="0 0 34 38" aria-hidden="true">
        <polygon points="17,1 32,9.5 32,28.5 17,37 2,28.5 2,9.5" fill="none" stroke={light ? "#18b777" : "#08794d"} strokeWidth="2.2" />
        <polygon points="17,10 25,14.5 25,23.5 17,28 9,23.5 9,14.5" fill={light ? "#18b777" : "#08794d"} />
      </svg>
      <span className="font-display text-[1.05rem] font-bold leading-none tracking-tight" style={{ color: light ? "#fff" : "#063c29" }}>
        JLR<span className="mx-1.5 opacity-40">/</span><span className="font-semibold">SPECIALIST</span>
      </span>
    </span>
  );
}
