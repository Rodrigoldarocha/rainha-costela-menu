import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MenuItem = { id: string; name: string; price: string; description?: string | null; tag?: string | null };
export type MenuGroup = { title?: string | null; items: MenuItem[] };
export type Category = { id: string; label: string; title: string; note?: string | null; groups: MenuGroup[] };

// Content comes from the database: normalize to safe plain text (React escapes on render; no HTML is ever injected).
const clean = (v: unknown, max = 300): string | null => {
  if (typeof v !== "string") return null;
  const t = v.replace(/[\u0000-\u001F\u007F<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  return t || null;
};
const brl = (n: number) => !Number.isFinite(n) || n < 0 ? "—" : n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export async function fetchMenu(): Promise<Category[]> {
  const [cats, prods] = await Promise.all([
    supabase.from("categories").select("id,slug,label,title,note,position").order("position"),
    supabase.from("products").select("id,category_id,group_name,name,description,tag,price,position").order("position"),
  ]);
  if (cats.error) throw cats.error;
  if (prods.error) throw prods.error;
  return cats.data.map((c) => {
    const groups: MenuGroup[] = [];
    for (const p of prods.data.filter((p) => p.category_id === c.id)) {
      const name = clean(p.name, 120);
      if (!name) continue;
      const title = clean(p.group_name, 60);
      let g = groups.find((g) => (g.title ?? null) === title);
      if (!g) groups.push((g = { title, items: [] }));
      g.items.push({ id: p.id, name, description: clean(p.description), tag: clean(p.tag, 30), price: brl(Number(p.price)) });
    }
    const slug = String(c.slug).toLowerCase().replace(/[^a-z0-9-]/g, "") || c.id;
    return { id: slug, label: clean(c.label, 40) ?? "", title: clean(c.title, 60) ?? "", note: clean(c.note), groups };
  }).filter((c) => c.groups.length > 0);
}

export const menuQuery = queryOptions({ queryKey: ["menu"], queryFn: fetchMenu, staleTime: 60_000 });

export { clean as cleanText, brl };
