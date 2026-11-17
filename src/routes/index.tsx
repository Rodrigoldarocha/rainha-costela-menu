import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/rainha-logo.png.asset.json";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { menuQuery, type MenuItem } from "@/data/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cardápio | Rainha da Costela — O simples que encanta" },
      { name: "description", content: "Cardápio digital da Rainha da Costela: pratos, parmegianas, caldinhos, petiscos e bebidas. Rua Barros Barreto, 376 • Santo Amaro – PE." },
      { property: "og:title", content: "Cardápio | Rainha da Costela" },
      { property: "og:description", content: "O simples que encanta. Confira nosso cardápio completo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(menuQuery),
  pendingComponent: () => <p className="p-10 text-center text-muted-foreground">Carregando cardápio...</p>,
  pendingMs: 150,
  component: Index,
  errorComponent: () => <p className="p-10 text-center text-muted-foreground">Não foi possível carregar o cardápio. Tente novamente.</p>,
  notFoundComponent: () => <p className="p-10 text-center text-muted-foreground">Cardápio indisponível.</p>,
});

const ADDRESS = "Rua Barros Barreto, 376 • Santo Amaro – PE";

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden>
      <span className="ornament-line w-16" />
      <span className="size-1.5 rotate-45 bg-gold" />
      <span className="ornament-line w-16" />
    </div>
  );
}

function Item({ item }: { item: MenuItem }) {
  return (
    <li className="py-5 first:pt-0 last:pb-0">
      {item.tag && (
        <span className="mb-1.5 inline-block font-display text-[10px] tracking-[0.25em] uppercase text-gold">{item.tag}</span>
      )}
      <div className="flex items-baseline gap-3">
        <h4 className="font-serif text-[1.35rem] leading-tight font-semibold text-foreground">{item.name}</h4>
        <span className="leader" aria-hidden />
        <p className="shrink-0 font-display text-base font-semibold text-gold-soft whitespace-nowrap">
          <span className="mr-0.5 text-xs text-gold">R$</span>{item.price}
        </p>
      </div>
      {item.description && (
        <p className="mt-1.5 max-w-[34rem] text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      )}
    </li>
  );
}

function Index() {
  const { data: menu } = useSuspenseQuery(menuQuery);
  const qc = useQueryClient();
  const [active, setActive] = useState(menu[0]?.id ?? "");

  useEffect(() => {
    const ch = supabase
      .channel(`menu-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => qc.invalidateQueries({ queryKey: ["menu"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => qc.invalidateQueries({ queryKey: ["menu"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-35% 0px -60% 0px" },
    );
    menu.forEach((c) => { const el = document.getElementById(c.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [menu]);

  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:ring-2 focus:ring-gold"
      >
        Pular para o cardápio
      </a>
      <header className="brand-stage relative overflow-hidden px-6 pt-10 pb-10 text-center sm:pt-14 sm:pb-12">
        <div className="relative mx-auto w-fit">
          <div className="brand-halo" aria-hidden />
          <div className="brand-frame relative">
            <img
              src={logo.url}
              alt="Logo Rainha da Costela"
              width={512}
              height={341}
              decoding="async"
              fetchPriority="high"
              className="block h-auto w-[15rem] object-contain sm:w-[19rem] lg:w-[21rem]"
            />
          </div>
        </div>
        <h1 className="mt-7 font-display text-[1.9rem] leading-none font-bold tracking-[0.1em] text-foreground sm:text-5xl">
          Rainha da Costela
        </h1>
        <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-3" aria-hidden>
          <span className="ornament-line flex-1" />
          <span className="size-1.5 rotate-45 bg-gold" />
          <span className="ornament-line flex-1" />
        </div>
        <p className="mt-3 font-serif text-xl italic text-gold-soft sm:text-2xl">O simples que encanta</p>
        <p className="mt-5 text-xs tracking-wide text-muted-foreground">{ADDRESS}</p>
      </header>

      <nav aria-label="Categorias" className="sticky top-0 z-20 border-y border-border bg-background/90 backdrop-blur-md">
        <div ref={navRef} className="no-scrollbar mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 py-3">
          {menu.map((c) => (
            <a
              key={c.id}
              data-id={c.id}
              href={`#${c.id}`}
              aria-current={active === c.id ? "true" : undefined}
              className={`shrink-0 rounded-sm border px-4 py-3 font-display text-[11px] tracking-[0.15em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                active === c.id ? "border-gold bg-gold text-primary-foreground" : "border-transparent text-muted-foreground hover:text-gold-soft"
              }`}
            >
              {c.label}
            </a>
          ))}
        </div>
      </nav>

      <main id="main-content" className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
        {menu.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">Cardápio indisponível no momento.</p>
        ) : menu.map((c) => (
          <section key={c.id} id={c.id} className="scroll-mt-20 pt-12">
            <div className="mb-7 text-center">
              <h2 className="font-display text-xl font-semibold tracking-[0.2em] uppercase text-gold">{c.title}</h2>
              <div className="mt-3"><Ornament /></div>
              {c.note && <p className="mt-3 font-serif text-base italic text-muted-foreground">* {c.note}</p>}
            </div>
            <div className="space-y-8">
              {c.groups.map((g, i) => (
                <div key={i} className="rounded-sm border border-border bg-card/60 p-5 sm:p-7">
                  {g.title && (
                    <h3 className="mb-5 border-b border-border pb-3 font-display text-xs tracking-[0.25em] uppercase text-gold-soft">{g.title}</h3>
                  )}
                  <ul className="divide-y divide-border">
                    {g.items.map((it) => <Item key={it.id} item={it} />)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="border-t border-border bg-wood px-6 py-10 text-center">
        <p className="font-display text-lg tracking-[0.12em] text-foreground">Rainha da Costela</p>
        <p className="mt-2 text-sm text-muted-foreground">{ADDRESS}</p>
        <div className="my-4"><Ornament /></div>
        <p className="font-serif text-base italic text-gold-soft">O simples que encanta</p>
      </footer>
    </div>
  );
}
