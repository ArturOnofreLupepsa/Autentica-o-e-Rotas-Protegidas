import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { COOKIE_NAME, DURACAO_SESSAO_SEGUNDOS, assinarToken } from "../../../../lib/auth";
import { API_URL, type Usuario } from "../../../../lib/usuarios";

// Compara em tempo constante (hash dos dois lados garante o mesmo tamanho).
function senhasIguais(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

const ERRO_CREDENCIAIS = { erro: "E-mail ou senha inválidos." };

export async function POST(request: Request) {
  let corpo: { email?: unknown; senha?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Requisição inválida." }, { status: 400 });
  }

  if (typeof corpo.email !== "string" || typeof corpo.senha !== "string") {
    return NextResponse.json({ erro: "Informe e-mail e senha." }, { status: 400 });
  }
  const email = corpo.email.trim().toLowerCase();

  let usuarios: Usuario[];
  try {
    const resposta = await fetch(`${API_URL}/usuarios?email=${encodeURIComponent(email)}`, { cache: "no-store" });
    if (!resposta.ok) throw new Error(String(resposta.status));
    usuarios = (await resposta.json()) as Usuario[];
  } catch {
    return NextResponse.json(
      { erro: "Serviço de autenticação indisponível. Verifique se a API está em execução (npm run api)." },
      { status: 503 },
    );
  }

  const usuario = usuarios[0];
  // Sempre executa a comparação (mesmo sem usuário) para não revelar, pelo tempo de resposta, se o e-mail existe.
  const senhaConfere = senhasIguais(usuario?.senha ?? "senha-fantasma", corpo.senha);
  if (!usuario || !senhaConfere) {
    // Mensagem genérica: não informa se o erro foi no e-mail ou na senha.
    return NextResponse.json(ERRO_CREDENCIAIS, { status: 401 });
  }

  const token = await assinarToken({ sub: String(usuario.id), nome: usuario.nome, email: usuario.email });

  const resposta = NextResponse.json({ nome: usuario.nome });
  resposta.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true, // inacessível a JavaScript: mitiga roubo de token via XSS
    sameSite: "lax", // mitiga CSRF
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  });
  return resposta;
}
