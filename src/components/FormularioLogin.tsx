"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const AVISOS: Record<string, string> = {
  restrita: "Faça login para acessar esta página.",
  expirada: "Sua sessão expirou. Entre novamente.",
  saiu: "Você saiu com segurança.",
};

// Só aceita caminhos internos: evita open redirect (ex.: ?next=https://site-malicioso.com).
function destinoSeguro(next?: string): string {
  if (next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) return next;
  return "/dashboard";
}

type Props = { motivo?: string; next?: string };

export default function FormularioLogin({ motivo, next }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const aviso = motivo ? AVISOS[motivo] : undefined;

  async function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErro("Informe um e-mail válido.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      if (!resposta.ok) {
        const dados = (await resposta.json().catch(() => null)) as { erro?: string } | null;
        setErro(dados?.erro ?? "Não foi possível entrar. Tente novamente.");
        return;
      }

      router.replace(destinoSeguro(next));
      router.refresh();
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900">
      <form
        onSubmit={entrar}
        noValidate
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-center text-2xl font-bold text-indigo-600">Dashpczão</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Acesse sua conta para continuar</p>

        {aviso && (
          <p role="status" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-sm text-amber-800">
            {aviso}
          </p>
        )}

        <label htmlFor="email" className="mt-6 block text-sm font-medium">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@exemplo.com"
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />

        <label htmlFor="senha" className="mt-4 block text-sm font-medium">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />

        {erro && (
          <p role="alert" className="mt-3 text-sm text-red-600">{erro}</p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
