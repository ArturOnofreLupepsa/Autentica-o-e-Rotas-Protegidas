import { dataBrParaIso, soDigitos } from "./mascaras";

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export function emailValido(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email.trim());
}

export function cpfValido(cpf: string): boolean {
  const d = soDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  const digitoVerificador = (qtd: number): number => {
    let soma = 0;
    for (let i = 0; i < qtd; i++) soma += Number(d[i]) * (qtd + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return digitoVerificador(9) === Number(d[9]) && digitoVerificador(10) === Number(d[10]);
}

// DDD (11–99) + celular (9XXXXXXXX) ou fixo (2–5XXXXXXX)
export function telefoneValido(telefone: string): boolean {
  return /^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(soDigitos(telefone));
}

export function cepValido(cep: string): boolean {
  return soDigitos(cep).length === 8;
}

// Data existente, a partir de 1900 e que não esteja no futuro.
export function dataNascimentoValida(dataBr: string): boolean {
  const iso = dataBrParaIso(dataBr);
  if (!iso) return false;
  const hoje = new Date();
  const hojeIso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  return iso >= "1900-01-01" && iso <= hojeIso;
}
