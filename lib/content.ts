import fs from "node:fs";
import path from "node:path";

export type Block =
  | { t: "h"; level: number; text: string; id: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "table"; head: string[]; align: ("l" | "r")[]; rows: string[][] }
  | { t: "hr" };

export type Doc = {
  meta: { title: string; description: string; index: boolean };
  blocks: Block[];
};

export type Section = { title: string; id: string; blocks: Block[] };

export const slug = (s: string) =>
  s
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function splitRow(line: string): string[] {
  let l = line.trim();
  if (l.startsWith("|")) l = l.slice(1);
  if (l.endsWith("|")) l = l.slice(0, -1);
  return l.split("|").map((c) => c.trim());
}

export function loadDoc(file: string): Doc {
  let raw = fs.readFileSync(path.join(process.cwd(), "content", file), "utf8");
  const meta = { title: "", description: "", index: true };
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const m = line.match(/^(\w+):\s*(.*)$/);
      if (!m) continue;
      const v = m[2].replace(/^"|"$/g, "");
      if (m[1] === "title") meta.title = v;
      if (m[1] === "description") meta.description = v;
      if (m[1] === "index") meta.index = v !== "false";
    }
    raw = raw.slice(fm[0].length);
  }
  // Developer notes live in HTML comments: never customer-visible.
  raw = raw.replace(/<!--[\s\S]*?-->/g, "");
  const lines = raw.split("\n").filter((l) => l.trim() !== ">");

  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      blocks.push({ t: "h", level: h[1].length, text: h[2].trim(), id: slug(h[2]) });
      i++; continue;
    }
    if (/^---+\s*$/.test(line)) { blocks.push({ t: "hr" }); i++; continue; }
    if (line.trim().startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++]);
      const head = splitRow(rows[0]);
      const align = splitRow(rows[1]).map((c) => (c.endsWith(":") ? "r" : "l")) as ("l" | "r")[];
      blocks.push({ t: "table", head, align, rows: rows.slice(2).map(splitRow) });
      continue;
    }
    if (/^- /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2).trim());
      blocks.push({ t: "ul", items });
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s/, "").trim());
      blocks.push({ t: "ol", items });
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length && lines[i].trim() &&
      !/^(#{1,6}\s|- |\d+\.\s|\||---+\s*$)/.test(lines[i])
    ) para.push(lines[i++].trim());
    blocks.push({ t: "p", text: para.join(" ") });
  }
  return { meta, blocks };
}

/** Splits into: intro (everything before the first H2) and H2 sections. */
export function toSections(blocks: Block[]) {
  const intro: Block[] = [];
  const sections: Section[] = [];
  let cur: Section | null = null;
  for (const b of blocks) {
    if (b.t === "h" && b.level === 2) {
      cur = { title: b.text, id: b.id, blocks: [] };
      sections.push(cur);
    } else if (cur) cur.blocks.push(b);
    else intro.push(b);
  }
  return { intro, sections };
}
