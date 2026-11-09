import Link from "next/link";
import { produtos, formatarMoeda } from "../produtos/dados";

export default function Dashboard() {
  const totalProdutos = produtos.length;
  const totalUnidades = produtos.reduce((soma, p) => soma + p.estoque, 0);
  const valorEmEstoque = produtos.reduce((soma, p) => soma + p.preco * p.estoque, 0);
  const estoqueBaixo = produtos.filter((p) => p.estoque <= 5).length;

  const cards = [
    { titulo: "Produtos cadastrados", valor: String(totalProdutos) },
    { titulo: "Unidades em estoque", valor: String(totalUnidades) },
    { titulo: "Valor em estoque", valor: formatarMoeda(valorEmEstoque) },
    { titulo: "Itens com estoque baixo", valor: String(estoqueBaixo) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Visão geral do estoque da loja.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.titulo} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{c.titulo}</p>
            <p className="mt-2 text-2xl font-bold">{c.valor}</p>
          </div>
        ))}
      </div>

      <Link
        href="/produtos"
        className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-400"
      >
        <div>
          <p className="font-semibold">Listagem de produtos</p>
          <p className="text-sm text-slate-500">Consulte todos os produtos, preços e situação do estoque.</p>
        </div>
        <span className="text-sm font-medium text-indigo-600">Acessar →</span>
      </Link>
    </div>
  );
}
