"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { excluirUsuario, listarUsuarios, type Usuario } from "../../../lib/usuarios";
import { isoParaDataBr, mascaraCPF, mascaraTelefone } from "../../../lib/mascaras";

type Situacao = "carregando" | "pronto" | "erro";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [situacao, setSituacao] = useState<Situacao>("carregando");
  const [tentativa, setTentativa] = useState(0);

  const [alvo, setAlvo] = useState<Usuario | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

  useEffect(() => {
    let ativo = true;
    listarUsuarios()
      .then((lista) => {
        if (!ativo) return;
        setUsuarios(lista);
        setSituacao("pronto");
      })
      .catch(() => {
        if (ativo) setSituacao("erro");
      });
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  useEffect(() => {
    if (!alvo) return;
    const fecharComEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAlvo(null);
    };
    window.addEventListener("keydown", fecharComEsc);
    return () => window.removeEventListener("keydown", fecharComEsc);
  }, [alvo]);

  function tentarNovamente() {
    setSituacao("carregando");
    setTentativa((n) => n + 1);
  }

  function pedirExclusao(usuario: Usuario) {
    setErroExclusao("");
    setAlvo(usuario);
  }

  async function confirmarExclusao() {
    if (!alvo) return;
    setExcluindo(true);
    setErroExclusao("");
    try {
      await excluirUsuario(alvo.id);
      setUsuarios((lista) => lista.filter((u) => u.id !== alvo.id));
      setAlvo(null);
    } catch {
      setErroExclusao("Não foi possível excluir o usuário. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="mt-1 text-sm text-slate-500">
            {situacao === "pronto"
              ? `${usuarios.length} ${usuarios.length === 1 ? "usuário cadastrado" : "usuários cadastrados"}.`
              : "Listagem de usuários cadastrados no sistema."}
          </p>
        </div>
        <Link
          href="/usuarios/novo"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          + Novo usuário
        </Link>
      </div>

      {situacao === "carregando" && (
        <p className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Carregando usuários...
        </p>
      )}

      {situacao === "erro" && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Não foi possível carregar os usuários.</p>
          <p className="mt-1">
            Verifique se a API está em execução com <code className="font-mono">npm run api</code>.
          </p>
          <button
            type="button"
            onClick={tentarNovamente}
            className="mt-4 rounded-lg border border-red-300 bg-white px-3 py-1.5 font-medium transition hover:bg-red-100"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {situacao === "pronto" && usuarios.length === 0 && (
        <p className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Nenhum usuário cadastrado. Clique em &ldquo;Novo usuário&rdquo; para começar.
        </p>
      )}

      {situacao === "pronto" && usuarios.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">CPF</th>
                <th className="px-4 py-3 font-semibold">Telefone</th>
                <th className="px-4 py-3 font-semibold">Nascimento</th>
                <th className="px-4 py-3 font-semibold">Cidade/UF</th>
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{u.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{mascaraCPF(u.cpf)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{mascaraTelefone(u.telefone)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{isoParaDataBr(u.dataNascimento)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {u.endereco.cidade}/{u.endereco.uf}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/usuarios/${u.id}/editar`}
                      className="rounded-md px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                    >
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => pedirExclusao(u)}
                      className="ml-1 rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {alvo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-exclusao"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
          onClick={() => !excluindo && setAlvo(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="titulo-exclusao" className="text-lg font-bold">
              Excluir usuário
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Tem certeza de que deseja excluir <strong>{alvo.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            {erroExclusao && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {erroExclusao}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAlvo(null)}
                disabled={excluindo}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarExclusao}
                disabled={excluindo}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {excluindo ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
