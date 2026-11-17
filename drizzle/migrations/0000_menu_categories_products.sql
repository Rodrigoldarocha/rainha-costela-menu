CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  title text NOT NULL,
  note text,
  position int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  group_name text,
  name text NOT NULL,
  description text,
  tag text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  position int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_id);
GRANT SELECT ON public.categories, public.products TO anon, authenticated;
GRANT ALL ON public.categories, public.products TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "Public read products" ON public.products FOR SELECT TO anon, authenticated USING (active);
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories, public.products;

INSERT INTO public.categories (slug,label,title,note,position) VALUES
('pratos','Pratos Principais','Pratos Principais',NULL,1),
('parmegiana','À Parmegiana','À Parmegiana','Acompanham: macarrão, batata frita e salada da rainha ou salada crua',2),
('caldinhos','Caldinhos','Caldinhos','Receitas tradicionais servidas bem quentes',3),
('petiscos','Petiscos & Combos','Petiscos & Combos',NULL,4),
('porcoes','Porções','Porções e Adicionais',NULL,5),
('bebidas','Bebidas','Bebidas & Cervejas',NULL,6);

INSERT INTO public.products (category_id,group_name,name,description,tag,price,position)
SELECT c.id, v.g, v.n, v.d, v.t, v.p, v.pos FROM (VALUES
('pratos',NULL,'Feijoada','Acompanha: Arroz, farofa, couve frita e vinagrete.',NULL,38.00,1),
('pratos',NULL,'Arrumadinho de Charque','Acompanha: Feijão a escolher ou pirão, arroz, vinagrete, salada da rainha ou salada crua e molho da casa.','Casa',34.00,2),
('pratos',NULL,'Costela no Bafo','Acompanha: Feijão a escolher ou pirão, arroz, macarrão, farofa, salada da rainha ou salada crua e molho da casa.','Especial',32.00,3),
('pratos',NULL,'Carne Guisada','Acompanha: Feijão a escolher ou pirão, arroz, macarrão, farofa, salada da rainha ou salada crua e molho da casa.',NULL,30.00,4),
('pratos',NULL,'Galinha Guisada','Acompanha: Feijão a escolher ou pirão, arroz, macarrão, farofa, salada da rainha ou salada crua e molho da casa.',NULL,28.00,5),
('pratos',NULL,'Asa de Frango Crocante (5 unidades)','Acompanha: Feijão a escolher ou pirão, arroz, macarrão, farofa, salada da rainha ou salada crua e molho da casa.',NULL,28.00,6),
('parmegiana',NULL,'Carne à Parmegiana',NULL,NULL,32.00,1),
('parmegiana',NULL,'Frango à Parmegiana',NULL,NULL,28.00,2),
('caldinhos',NULL,'Caldinhos Tradicionais','Nordestino • Feijão • Cabeça de Galo • Quenga',NULL,12.00,1),
('caldinhos',NULL,'Caldinhos Especiais','Fava com Charque • Peixe • Camarão','Premium',16.00,2),
('petiscos','Combos','Combo Petisco da Rainha (Simples)','1 Porção de Batata Frita Simples + 1 Porção de Frango Crocante (5 unidades).','Combo da Casa',25.00,1),
('petiscos','Combos','Combo Petisco da Rainha (Especial Cheddar e Bacon)','1 Porção de Batata Frita com Cheddar e Bacon + 1 Porção de Frango Crocante (5 unidades).','Combo Especial',32.00,2),
('petiscos','Petiscos','Batata Frita Simples','Porção crocante e sequinha, frita na hora.',NULL,12.00,3),
('petiscos','Petiscos','Batata Frita com Cheddar e Bacon','Porção de batata frita coberta com cheddar cremoso e cubos de bacon crocante.',NULL,18.00,4),
('petiscos','Petiscos','Porção de Frango Crocante (5 unidades)','Asinhas de frango empanadas e super crocantes.',NULL,18.00,5),
('petiscos','Petiscos','Porção de Frango Crocante (10 unidades)','Porção tamanho família com 10 asinhas de frango empanadas e crocantes.','Família',35.00,6),
('petiscos','Petiscos','Pão de Alho (Unidade)','Pão dourado na brasa com creme de alho especial da casa.',NULL,8.00,7),
('petiscos','Petiscos','Porção de Pão de Alho (3 unidades)','Três unidades de pão de alho dourados na brasa com desconto especial.',NULL,22.00,8),
('porcoes',NULL,'Feijão',NULL,NULL,10.00,1),
('porcoes',NULL,'Arroz',NULL,NULL,8.00,2),
('porcoes',NULL,'Macarrão',NULL,NULL,8.00,3),
('porcoes',NULL,'Pirão',NULL,NULL,8.00,4),
('porcoes',NULL,'Farofa',NULL,NULL,3.00,5),
('porcoes',NULL,'Frango Crocante (unidade)',NULL,NULL,5.00,6),
('porcoes',NULL,'Linguiça Toscana (unidade)',NULL,NULL,5.00,7),
('porcoes',NULL,'Molho da Casa',NULL,NULL,3.00,8),
('bebidas','Refrigerantes & Sucos','Guaraná (Lata)',NULL,NULL,8.00,1),
('bebidas','Refrigerantes & Sucos','Guaraná Açaí (Lata)',NULL,NULL,8.00,2),
('bebidas','Refrigerantes & Sucos','Suco da Fruta (Copo)',NULL,NULL,6.00,3),
('bebidas','Refrigerantes & Sucos','Água com Gás',NULL,NULL,4.00,4),
('bebidas','Refrigerantes & Sucos','Água Mineral',NULL,NULL,3.00,5),
('bebidas','Cervejas Geladas','Heineken (Long Neck)',NULL,NULL,12.00,6),
('bebidas','Cervejas Geladas','Budweiser (Long Neck)',NULL,NULL,10.00,7),
('bebidas','Cervejas Geladas','Brahma (Lata 350 ml)',NULL,NULL,7.00,8)
) AS v(s,g,n,d,t,p,pos) JOIN public.categories c ON c.slug = v.s;