import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MenuItem = { id: string; name: string; price: string; description?: string | null; tag?: string | null };
export type MenuGroup = { title?: string | null; items: MenuItem[] };
export type Category = { id: string; label: string; title: string; note?: string | null; groups: MenuGroup[] };

const brl = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
      let g = groups.find((g) => (g.title ?? null) === (p.group_name ?? null));
      if (!g) groups.push((g = { title: p.group_name, items: [] }));
      g.items.push({ id: p.id, name: p.name, description: p.description, tag: p.tag, price: brl(Number(p.price)) });
    }
    return { id: c.slug, label: c.label, title: c.title, note: c.note, groups };
  }).filter((c) => c.groups.length > 0);
}

export const menuQuery = queryOptions({ queryKey: ["menu"], queryFn: fetchMenu });
