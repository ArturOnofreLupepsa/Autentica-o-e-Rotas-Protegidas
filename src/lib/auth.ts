// Utilitários de autenticação: JWT (HS256) assinado com Web Crypto.
// Usa apenas APIs padrão (crypto.subtle), então funciona no proxy e nas rotas de API.

export const COOKIE_NAME = "dashpczao_token";
export const DURACAO_SESSAO_SEGUNDOS = 60 * 60; // 1 hora

export type SessaoPayload = {
  sub: string; // id do usuário
  nome: string;
  email: string;
  iat: number;
  exp: number;
};

const encoder = new TextEncoder();

function segredo(): string {
  const valor = process.env.AUTH_SECRET;
  if (valor && valor.length >= 32) return valor;
  // Em produção, nunca assinar com segredo previsível: falha fechada.
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET ausente ou curto (mínimo de 32 caracteres).");
  }
  return "segredo-apenas-para-desenvolvimento-local-0123456789";
}

function paraBase64Url(bytes: Uint8Array): string {
  let binario = "";
  for (const b of bytes) binario += String.fromCharCode(b);
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64Url(texto: string): Uint8Array<ArrayBuffer> {
  const base64 = texto.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (texto.length % 4)) % 4);
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function jsonParaBase64Url(objeto: unknown): string {
  return paraBase64Url(encoder.encode(JSON.stringify(objeto)));
}

function importarChave(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(segredo()), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function assinarToken(dados: Pick<SessaoPayload, "sub" | "nome" | "email">): Promise<string> {
  const agora = Math.floor(Date.now() / 1000);
  const payload: SessaoPayload = { ...dados, iat: agora, exp: agora + DURACAO_SESSAO_SEGUNDOS };
  const corpo = `${jsonParaBase64Url({ alg: "HS256", typ: "JWT" })}.${jsonParaBase64Url(payload)}`;
  const assinatura = await crypto.subtle.sign("HMAC", await importarChave(), encoder.encode(corpo));
  return `${corpo}.${paraBase64Url(new Uint8Array(assinatura))}`;
}

// Retorna o payload se o token for íntegro e não estiver expirado; caso contrário, null.
export async function verificarToken(token: string): Promise<SessaoPayload | null> {
  try {
    const partes = token.split(".");
    if (partes.length !== 3) return null;
    const [cabecalho, payload, assinatura] = partes;

    const { alg } = JSON.parse(new TextDecoder().decode(deBase64Url(cabecalho))) as { alg?: string };
    if (alg !== "HS256") return null; // rejeita "none" e trocas de algoritmo

    // crypto.subtle.verify compara a assinatura em tempo constante.
    const valido = await crypto.subtle.verify(
      "HMAC",
      await importarChave(),
      deBase64Url(assinatura),
      encoder.encode(`${cabecalho}.${payload}`),
    );
    if (!valido) return null;

    const dados = JSON.parse(new TextDecoder().decode(deBase64Url(payload))) as SessaoPayload;
    if (typeof dados.exp !== "number" || dados.exp <= Math.floor(Date.now() / 1000)) return null;
    return dados;
  } catch {
    return null;
  }
}
