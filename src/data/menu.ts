export type MenuItem = { name: string; price: string; description?: string; tag?: string; note?: string };
export type MenuGroup = { title?: string; items: MenuItem[] };
export type Category = { id: string; label: string; title: string; note?: string; groups: MenuGroup[] };

const acomp = "Acompanha: Feijão a escolher ou pirão, arroz, macarrão, farofa, salada da rainha ou salada crua e molho da casa.";

export const menu: Category[] = [
  { id: "pratos", label: "Pratos Principais", title: "Pratos Principais", groups: [{ items: [
    { name: "Feijoada", price: "38,00", description: "Acompanha: Arroz, farofa, couve frita e vinagrete." },
    { name: "Arrumadinho de Charque", tag: "Casa", price: "34,00", description: "Acompanha: Feijão a escolher ou pirão, arroz, vinagrete, salada da rainha ou salada crua e molho da casa." },
    { name: "Costela no Bafo", tag: "Especial", price: "32,00", description: acomp },
    { name: "Carne Guisada", price: "30,00", description: acomp },
    { name: "Galinha Guisada", price: "28,00", description: acomp },
    { name: "Asa de Frango Crocante (5 unidades)", price: "28,00", description: acomp },
  ] }] },
  { id: "parmegiana", label: "À Parmegiana", title: "À Parmegiana", note: "Acompanham: macarrão, batata frita e salada da rainha ou salada crua", groups: [{ items: [
    { name: "Carne à Parmegiana", price: "32,00", description: "Filé bovino empanado com molho especial e queijo gratinado." },
    { name: "Frango à Parmegiana", price: "28,00", description: "Filé de frango empanado, coberto com queijo derretido e molho de tomate caseiro." },
  ] }] },
  { id: "caldinhos", label: "Caldinhos", title: "Caldinhos", note: "Receitas tradicionais servidas bem quentes", groups: [{ items: [
    { name: "Caldinhos Tradicionais", price: "12,00", description: "Nordestino • Feijão • Cabeça de Galo • Quenga" },
    { name: "Caldinhos Especiais", tag: "Premium", price: "16,00", description: "Fava com Charque • Peixe • Camarão" },
  ] }] },
  { id: "petiscos", label: "Petiscos & Combos", title: "Petiscos & Combos", groups: [
    { title: "Combos", items: [
      { name: "Combo Petisco da Rainha (Simples)", tag: "Combo da Casa", price: "25,00", description: "1 Porção de Batata Frita Simples + 1 Porção de Frango Crocante (5 unidades)." },
      { name: "Combo Petisco da Rainha (Especial)", tag: "Combo Especial", price: "32,00", description: "1 Porção de Batata Frita com Cheddar e Bacon + 1 Porção de Frango Crocante (5 unidades)." },
    ] },
    { title: "Petiscos", items: [
      { name: "Batata Frita Simples", price: "12,00", description: "Porção crocante e sequinha, frita na hora." },
      { name: "Batata Frita com Cheddar e Bacon", price: "18,00", description: "Porção de batata frita coberta com cheddar cremoso e cubos de bacon crocante." },
      { name: "Porção de Frango Crocante (5 un)", price: "18,00", description: "Asinhas de frango empanadas e super crocantes." },
      { name: "Porção de Frango Crocante (10 un)", tag: "Família", price: "35,00", description: "Porção tamanho família com 10 asinhas de frango empanadas e crocantes." },
      { name: "Pão de Alho (Unidade)", price: "8,00", description: "Pão dourado na brasa com creme de alho especial da casa." },
      { name: "Porção de Pão de Alho (3 unidades)", price: "22,00", description: "Três unidades de pão de alho dourados na brasa com desconto especial." },
    ] },
  ] },
  { id: "porcoes", label: "Porções", title: "Porções e Adicionais", groups: [{ items: [
    { name: "Feijão", price: "10,00" }, { name: "Arroz", price: "8,00" }, { name: "Macarrão", price: "8,00" },
    { name: "Pirão", price: "8,00" }, { name: "Farofa", price: "3,00" },
    { name: "Frango Crocante", price: "5,00", note: "unidade" }, { name: "Linguiça Toscana", price: "5,00", note: "unidade" },
    { name: "Molho da Casa", price: "3,00" },
  ] }] },
  { id: "bebidas", label: "Bebidas", title: "Bebidas & Cervejas", groups: [
    { title: "Refrigerantes & Sucos", items: [
      { name: "Guaraná (Lata)", price: "8,00" }, { name: "Guaraná Açaí (Lata)", price: "8,00" },
      { name: "Suco da Fruta (Copo)", price: "6,00" }, { name: "Água com Gás", price: "4,00" }, { name: "Água Mineral", price: "3,00" },
    ] },
    { title: "Cervejas Geladas", items: [
      { name: "Heineken (Long Neck)", price: "12,00" }, { name: "Budweiser (Long Neck)", price: "10,00" }, { name: "Brahma (Lata 350 ml)", price: "7,00" },
    ] },
  ] },
];
