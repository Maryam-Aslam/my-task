import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/** Tiny inline-markdown renderer: **bold**, *italic*, [text](url). Keeps supplied copy verbatim. */
export function inline(text: string, key = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let n = 0;
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)/;
  while (rest) {
    const m = re.exec(rest);
    if (!m) { out.push(rest); break; }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const k = `${key}-${n++}`;
    if (m[1] !== undefined) out.push(<strong key={k}>{inline(m[1], k)}</strong>);
    else if (m[2] !== undefined) out.push(<em key={k}>{inline(m[2], k)}</em>);
    else {
      const href = m[4];
      out.push(
        href.startsWith("/") ? (
          <Link key={k} href={href}>{m[3]}</Link>
        ) : (
          <a key={k} href={href}>{m[3]}</a>
        )
      );
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return out.map((o, i) => <Fragment key={`${key}-f${i}`}>{o}</Fragment>);
}

export function Md({ text }: { text: string }) {
  return <>{inline(text)}</>;
}

export const plain = (t: string) =>
  t.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
