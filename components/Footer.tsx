import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-ink py-14 text-white/75">
      <div className="wrap flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md">
          <Logo light />
          <p className="mt-5 text-sm leading-relaxed">JLR Engine Specialists Ltd · Company No. 16500838. An independent specialist, not affiliated with Jaguar Land Rover.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold">
          <Link href="/engines/" className="hover:text-white">Engines</Link>
          <Link href="/models/" className="hover:text-white">Models</Link>
          <Link href="/engine-inspection/" className="hover:text-white">Engine problems</Link>
          <Link href="/engine-warranty/" className="hover:text-white">Warranty</Link>
          <Link href="/contact-us/" className="hover:text-white">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
