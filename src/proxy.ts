import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verificarToken } from "./lib/auth";

// Toda rota passa por aqui, exceto as do matcher abaixo.
// "/" é a tela de login (pública); todas as demais exigem token válido.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const sessao = token ? await verificarToken(token) : null;

  if (pathname === "/") {
    // Já autenticado não precisa ver o login de novo.
    if (sessao) return NextResponse.redirect(new URL("/dashboard", request.url));
    return NextResponse.next();
  }

  if (!sessao) {
    const login = new URL("/", request.url);
    login.searchParams.set("motivo", token ? "expirada" : "restrita");
    login.searchParams.set("next", pathname + search);
    const resposta = NextResponse.redirect(login);
    if (token) resposta.cookies.delete(COOKIE_NAME); // token inválido/expirado é descartado
    return resposta;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
