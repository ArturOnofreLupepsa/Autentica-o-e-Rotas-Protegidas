"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import UsuarioForm from "../../../../../components/UsuarioForm";
import { buscarUsuario, type Usuario } from "../../../../../lib/usuarios";

type Situacao = "carregando" | "pronto" | "erro";

export default function EditarUsuario() {
  const { id } = useParams<{ id: string }>();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [situacao, setSituacao] = useState<Situacao>("carregando");

  useEffect(() => {
    let ativo = true;
    buscarUsuario(id)
      .then((dados) => {
        if (!ativo) return;
        setUsuario(dados);
        setSituacao("pronto");
      })
      .catch(() => {
        if (ativo) setSituacao("erro");
      });
    return () => {
      ativo = false;
    };
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/usuarios" className="text-sm font-medium text-indigo-600 hover:underline">
        ← Voltar para a listagem
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Editar usuário</h1>
      <p className="mt-1 text-sm text-slate-500">Altere os dados do usuário e salve.</p>

      {situacao === "carregando" && (
        <p className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Carregando dados...
        </p>
      )}

      {situacao === "erro" && (
        <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Usuário não encontrado ou API indisponível. Verifique se ela está em execução com{" "}
          <code className="font-mono">npm run api</code>.
        </p>
      )}

      {situacao === "pronto" && usuario && <UsuarioForm usuario={usuario} />}
    </div>
  );
}
