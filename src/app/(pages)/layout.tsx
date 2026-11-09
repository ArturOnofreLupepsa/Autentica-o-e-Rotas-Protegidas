import Link from "next/link";
import BotaoSair from "../../components/BotaoSair";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold text-indigo-600">Dashpczão</span>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
            <Link href="/produtos" className="hover:text-indigo-600">Produtos</Link>
            <Link href="/usuarios" className="hover:text-indigo-600">Usuários</Link>
            <BotaoSair />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
