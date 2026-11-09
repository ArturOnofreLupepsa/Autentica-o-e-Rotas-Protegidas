export type Endereco = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  cpf: string; // somente dígitos
  telefone: string; // somente dígitos
  dataNascimento: string; // ISO (aaaa-mm-dd)
  endereco: Endereco;
  senha: string;
};

export type UsuarioInput = Omit<Usuario, "id">;

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function requisicao<T>(caminho: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!resposta.ok) throw new Error(`Falha na API (${resposta.status})`);
  return (await resposta.json()) as T;
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const usuarios = await requisicao<Usuario[]>("/usuarios");
  return usuarios.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function buscarUsuario(id: number | string): Promise<Usuario> {
  return requisicao<Usuario>(`/usuarios/${id}`);
}

export function criarUsuario(dados: UsuarioInput): Promise<Usuario> {
  return requisicao<Usuario>("/usuarios", { method: "POST", body: JSON.stringify(dados) });
}

export function atualizarUsuario(id: number, dados: Partial<UsuarioInput>): Promise<Usuario> {
  return requisicao<Usuario>(`/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(dados) });
}

export async function excluirUsuario(id: number): Promise<void> {
  await requisicao<unknown>(`/usuarios/${id}`, { method: "DELETE" });
}

// Verifica se CPF ou e-mail já pertencem a outro usuário.
export async function verificarDuplicidade(
  cpf: string,
  email: string,
  ignorarId?: number,
): Promise<{ cpf?: boolean; email?: boolean }> {
  const [porCpf, porEmail] = await Promise.all([
    requisicao<Usuario[]>(`/usuarios?cpf=${encodeURIComponent(cpf)}`),
    requisicao<Usuario[]>(`/usuarios?email=${encodeURIComponent(email)}`),
  ]);
  return {
    cpf: porCpf.some((u) => u.id !== ignorarId),
    email: porEmail.some((u) => u.id !== ignorarId),
  };
}
