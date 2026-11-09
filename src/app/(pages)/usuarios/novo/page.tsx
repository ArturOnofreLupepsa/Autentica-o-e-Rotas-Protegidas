import Link from "next/link";
import UsuarioForm from "../../../../components/UsuarioForm";

export default function NovoUsuario() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/usuarios" className="text-sm font-medium text-indigo-600 hover:underline">
        ← Voltar para a listagem
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Novo usuário</h1>
      <p className="mt-1 text-sm text-slate-500">Preencha os dados para cadastrar um usuário.</p>
      <UsuarioForm />
    </div>
  );
}
