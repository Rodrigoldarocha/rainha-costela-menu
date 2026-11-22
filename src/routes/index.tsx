import { createFileRoute, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useDeferredValue, memo } from "react";
import logo from "@/assets/emblema-coroa-rc.png.asset.json";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { menuQuery, type MenuItem } from "@/data/menu";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, MapPin, Search } from "lucide-react";

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
  pendingComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8" aria-busy="true" aria-live="polite">
      <div className="mb-10 h-8 w-48 animate-pulse rounded bg-muted mx-auto" />
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted/70" />
          </div>
        ))}
      </div>
    </div>
  ),
  pendingMs: 150,
  component: Index,
  errorComponent: RouteErrorComponent,
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

const Item = memo(function Item({ item }: { item: MenuItem }) {
  const nameMatch = item.name.match(/^(.*?)(\s*\([^)]*\))\s*$/);
  const primaryName = nameMatch?.[1]?.trim() ?? item.name;
  const nameDetail = nameMatch?.[2]?.trim() ?? null;
  const isSignature = item.tag === "Especial" || /costela no bafo/i.test(item.name) || /combo petisco da rainha/i.test(item.name);
  return (
    <li className={`menu-item ${isSignature ? "menu-item-signature" : ""}`}>
      {isSignature && (
        <span className="mb-2 inline-block text-xs font-medium uppercase text-gold">Especialidade da Rainha</span>
      )}
      {item.tag && (
        <span className="mb-1.5 inline-block text-xs font-medium uppercase text-gold">{item.tag}</span>
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1">
        <h4 className="min-w-0 font-serif text-xl leading-snug font-semibold text-foreground text-pretty break-words">{primaryName}</h4>
        <p className="shrink-0 text-base font-semibold text-gold-soft whitespace-nowrap tabular-nums">
          <span className="mr-0.5 text-xs text-gold">R$</span>{item.price}
        </p>
      </div>
      {nameDetail && <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{nameDetail}</p>}
      {item.description && (
        <p className="mt-1.5 max-w-[34rem] text-sm leading-relaxed text-muted-foreground">{item.description}</p>
      )}
    </li>
  );
});

function RouteErrorComponent({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Não foi possível carregar o cardápio</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente ou volte ao início.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Tentar novamente
          </Button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Voltar ao cardápio
          </a>
        </div>
      </div>
    </div>
  );
}

function Index() {
  const { data: menu } = useSuspenseQuery(menuQuery);
  const qc = useQueryClient();
  const [active, setActive] = useState(menu[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [showTop, setShowTop] = useState(false);

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
      { rootMargin: `-96px 0px -${Math.max(0, window.innerHeight - 220)}px 0px` },
    );
    menu.forEach((c) => { const el = document.getElementById(c.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [menu]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    navRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: reducedMotion ? "auto" : "smooth" });
  }, [active]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredMenu = useMemo(() => (normalizedSearch
    ? menu
        .map((c) => ({
          ...c,
          groups: c.groups
            .map((g) => ({
              ...g,
              items: g.items.filter((it) =>
                [it.name, it.description ?? "", it.tag ?? "", c.label, c.title].some((value) =>
                  value.toLowerCase().includes(normalizedSearch),
                ),
              ),
            }))
            .filter((g) => g.items.length > 0),
        }))
        .filter((c) => c.groups.length > 0)
    : menu), [menu, normalizedSearch]);

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: "Rainha da Costela",
            slogan: "O simples que encanta",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Rua Barros Barreto, 376",
              addressLocality: "Santo Amaro",
              addressRegion: "PE",
              addressCountry: "BR",
            },
            servesCuisine: "Brazilian",
            menu: "https://rainha-costela-menu.lovable.app/",
          }),
        }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:ring-2 focus:ring-gold"
      >
        Pular para o cardápio
      </a>
      <header className="brand-stage px-5 py-5 text-center sm:px-8 sm:py-12">
        <img
          src={logo.url}
          alt="Emblema Rainha da Costela: coroa e monograma RC"
          width={1254}
          height={1254}
          decoding="async"
          fetchPriority="high"
          className="mx-auto block size-20 object-contain sm:size-36"
        />
        <h1 className="mt-3 font-display text-[2rem] font-semibold leading-tight text-foreground sm:mt-4 sm:text-5xl">
          Rainha da Costela
        </h1>
        <p className="mt-2 font-serif text-lg italic text-gold-soft sm:text-2xl">O simples que encanta</p>
        <p className="mx-auto mt-3 flex max-w-md items-start justify-center gap-2 text-sm leading-relaxed text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
          <span className="min-w-0">{ADDRESS}</span>
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Preparo artesanal e fogo lento. Aprecie sem pressa.
        </p>
        <Button asChild variant="link" className="mt-1 min-h-11 text-gold-soft sm:mt-3">
          <a href="#main-content">Cardápio <ArrowDown aria-hidden="true" /></a>
        </Button>
      </header>

      <div className="menu-intro mx-auto grid max-w-6xl gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] sm:items-center sm:px-8 sm:py-9">
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">Cardápio</h2>
          <div className="mt-3 h-px w-12 bg-gold" aria-hidden="true" />
        </div>
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gold" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar prato, caldinho ou bebida..."
            className="min-h-12 w-full rounded-md border border-input bg-card py-3 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
            aria-label="Buscar no cardápio"
          />
        </div>
      </div>

      <nav aria-label="Categorias" className="category-bar sticky top-0 z-20 border-y border-border bg-background/95 backdrop-blur-md">
        <div ref={navRef} className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 sm:px-8">
          {filteredMenu.map((c) => (
            <a
              key={c.id}
              data-id={c.id}
              href={`#${c.id}`}
              aria-current={active === c.id ? "true" : undefined}
              className={`shrink-0 min-h-11 rounded-md border border-transparent px-4 py-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                active === c.id ? "border-gold/35 bg-gold/10 text-gold-soft" : "text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
            >
              {c.label}
            </a>
          ))}
        </div>
      </nav>

      <main id="main-content" className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        {filteredMenu.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">Cardápio indisponível no momento.</p>
        ) : filteredMenu.map((c) => (
          <section key={c.id} id={c.id} className="menu-section scroll-mt-24 pt-9 sm:pt-12">
            <div className="mb-5 border-b border-border pb-5 sm:mb-6">
              <h2 className="font-display text-2xl font-semibold leading-snug text-gold-soft sm:text-3xl">{c.title}</h2>
              {c.note && <p className="mt-4 font-serif text-base italic text-muted-foreground">* {c.note}</p>}
            </div>
            <div className="space-y-8">
              {c.groups.map((g, i) => (
                <div key={i} className="min-w-0">
                  {g.title && (
                    <h3 className="mb-4 text-sm font-semibold text-muted-foreground">{g.title}</h3>
                  )}
                  <ul className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                    {g.items.map((it) => <Item key={it.id} item={it} />)}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {showTop && (
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
          className="back-to-top fixed z-30 size-12 rounded-md border-gold/40 bg-background text-gold-soft"
          aria-label="Voltar ao topo"
        >
          <ArrowUp aria-hidden="true" />
        </Button>
      )}

      <footer className="brand-footer border-t border-border bg-card px-5 py-9 text-center sm:py-12">
        <img src={logo.url} alt="" width={1254} height={1254} loading="lazy" className="mx-auto mb-3 size-16 object-contain" />
        <p className="font-display text-2xl text-foreground">Rainha da Costela</p>
        <p className="mt-2 text-sm text-muted-foreground">{ADDRESS}</p>
        <div className="my-4"><Ornament /></div>
        <p className="font-serif text-base italic text-gold-soft">O simples que encanta</p>
      </footer>
    </div>
  );
}
