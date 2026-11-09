"use client";

import { useRouter } from "next/navigation";

export default function BotaoSair() {
  const router = useRouter();

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/?motivo=saiu");
    router.refresh();
  }

  return (
    <button type="button" onClick={sair} className="text-slate-500 hover:text-red-600">
      Sair
    </button>
  );
}
