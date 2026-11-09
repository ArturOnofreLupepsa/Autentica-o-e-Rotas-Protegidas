export function soDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

// Aplica um padrão onde "#" representa um dígito. Ex.: "###.###.###-##"
function aplicarPadrao(digitos: string, padrao: string): string {
  let i = 0;
  let saida = "";
  for (const caractere of padrao) {
    if (i >= digitos.length) break;
    saida += caractere === "#" ? digitos[i++] : caractere;
  }
  return saida;
}

export function mascaraCPF(valor: string): string {
  return aplicarPadrao(soDigitos(valor).slice(0, 11), "###.###.###-##");
}

export function mascaraTelefone(valor: string): string {
  const digitos = soDigitos(valor).slice(0, 11);
  const padrao = digitos.length > 10 ? "(##) #####-####" : "(##) ####-####";
  return aplicarPadrao(digitos, padrao);
}

export function mascaraCEP(valor: string): string {
  return aplicarPadrao(soDigitos(valor).slice(0, 8), "#####-###");
}

export function mascaraData(valor: string): string {
  return aplicarPadrao(soDigitos(valor).slice(0, 8), "##/##/####");
}

// "1990-05-17" -> "17/05/1990" (sem usar Date, evitando problemas de fuso horário)
export function isoParaDataBr(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : "";
}

// "17/05/1990" -> "1990-05-17" (retorna null se a data não existir)
export function dataBrParaIso(dataBr: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataBr);
  if (!m) return null;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  const ano = Number(m[3]);
  const data = new Date(ano, mes - 1, dia);
  const existe =
    data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
  return existe ? `${m[3]}-${m[2]}-${m[1]}` : null;
}
