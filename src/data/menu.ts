import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MenuItem = {
  id: string;
  name: string;
  price: string;
  description?: string | null;
  tag?: string | null;
};
export type MenuGroup = { title?: string | null; items: MenuItem[] };
export type Category = {
  id: string;
  label: string;
  title: string;
  note?: string | null;
  groups: MenuGroup[];
};

// Content comes from the database: normalize to safe plain text (React escapes on render; no HTML is ever injected).
/* eslint-disable no-control-regex */
const WHITESPACE_CONTROLS = /[\u0009\u000A\u000D\u2028\u2029]/g;
const REMOVED_CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const INVISIBLE_CHARS = /[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g;
/* eslint-enable no-control-regex */

export const sanitizeMenuText = (value: unknown, max = 300): string | null => {
  if (typeof value !== "string") return null;
  const text = value
    .replace(WHITESPACE_CONTROLS, " ")
    .replace(REMOVED_CONTROLS, "")
    .replace(INVISIBLE_CHARS, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  return text || null;
};

export const formatPrice = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" && value.trim() === "") return "—";
  const n =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(n) || n < 0) return "—";
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export async function fetchMenu(): Promise<Category[]> {
  const [cats, prods] = await Promise.all([
    supabase.from("categories").select("id,slug,label,title,note,position").order("position"),
    supabase
      .from("products")
      .select("id,category_id,group_name,name,description,tag,price,position")
      .order("position"),
  ]);
  if (cats.error) throw cats.error;
  if (prods.error) throw prods.error;
  return cats.data
    .map((c) => {
      const groups: MenuGroup[] = [];
      for (const p of prods.data.filter((p) => p.category_id === c.id)) {
        const name = sanitizeMenuText(p.name, 120);
        if (!name) continue;
        const title = sanitizeMenuText(p.group_name, 60);
        let g = groups.find((g) => (g.title ?? null) === title);
        if (!g) groups.push((g = { title, items: [] }));
        g.items.push({
          id: p.id,
          name,
          description: sanitizeMenuText(p.description),
          tag: sanitizeMenuText(p.tag, 30),
          price: formatPrice(p.price),
        });
      }
      const slug =
        String(c.slug)
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "") || c.id;
      return {
        id: slug,
        label: sanitizeMenuText(c.label, 40) ?? "",
        title: sanitizeMenuText(c.title, 60) ?? "",
        note: sanitizeMenuText(c.note),
        groups,
      };
    })
    .filter((c) => c.groups.length > 0);
}

export const menuQuery = queryOptions({
  queryKey: ["menu"],
  queryFn: fetchMenu,
  staleTime: 60_000,
});

export { sanitizeMenuText as cleanText, formatPrice as brl };
