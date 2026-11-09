import { produtos, statusDoEstoque, formatarMoeda, type StatusEstoque } from "./dados";

const estiloStatus: Record<StatusEstoque, string> = {
  Disponível: "bg-emerald-100 text-emerald-700",
  "Estoque baixo": "bg-amber-100 text-amber-700",
  Esgotado: "bg-red-100 text-red-700",
};

export default function Produtos() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Produtos</h1>
      <p className="mt-1 text-sm text-slate-500">
        Listagem de produtos cadastrados no estoque.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Código</th>
              <th className="px-4 py-3 font-semibold">Produto</th>
              <th className="px-4 py-3 font-semibold">Categoria</th>
              <th className="px-4 py-3 text-right font-semibold">Preço</th>
              <th className="px-4 py-3 text-right font-semibold">Estoque</th>
              <th className="px-4 py-3 font-semibold">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {produtos.map((p) => {
              const status = statusDoEstoque(p.estoque);
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">#{String(p.id).padStart(3, "0")}</td>
                  <td className="px-4 py-3 font-medium">{p.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{p.categoria}</td>
                  <td className="px-4 py-3 text-right">{formatarMoeda(p.preco)}</td>
                  <td className="px-4 py-3 text-right">{p.estoque}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${estiloStatus[status]}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
