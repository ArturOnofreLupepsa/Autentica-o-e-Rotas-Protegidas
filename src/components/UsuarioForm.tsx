"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Campo, { classeInput } from "./Campo";
import {
  dataBrParaIso,
  isoParaDataBr,
  mascaraCEP,
  mascaraCPF,
  mascaraData,
  mascaraTelefone,
  soDigitos,
} from "../lib/mascaras";
import {
  UFS,
  cepValido,
  cpfValido,
  dataNascimentoValida,
  emailValido,
  telefoneValido,
} from "../lib/validacoes";
import {
  atualizarUsuario,
  criarUsuario,
  verificarDuplicidade,
  type Usuario,
  type UsuarioInput,
} from "../lib/usuarios";

type Valores = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  senha: string;
};

type Campos = keyof Valores;
type Erros = Partial<Record<Campos, string>>;

const mascaras: Partial<Record<Campos, (valor: string) => string>> = {
  cpf: mascaraCPF,
  telefone: mascaraTelefone,
  dataNascimento: mascaraData,
  cep: mascaraCEP,
};

const valoresVazios: Valores = {
  nome: "",
  email: "",
  cpf: "",
  telefone: "",
  dataNascimento: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  senha: "",
};

function valoresDoUsuario(u: Usuario): Valores {
  return {
    nome: u.nome,
    email: u.email,
    cpf: mascaraCPF(u.cpf),
    telefone: mascaraTelefone(u.telefone),
    dataNascimento: isoParaDataBr(u.dataNascimento),
    cep: mascaraCEP(u.endereco.cep),
    logradouro: u.endereco.logradouro,
    numero: u.endereco.numero,
    complemento: u.endereco.complemento,
    bairro: u.endereco.bairro,
    cidade: u.endereco.cidade,
    uf: u.endereco.uf,
    senha: "", // a senha atual nunca é exibida
  };
}

function validar(v: Valores, editando: boolean): Erros {
  const erros: Erros = {};

  if (v.nome.trim().length < 3) erros.nome = "Informe o nome completo.";
  if (!emailValido(v.email)) erros.email = "Informe um e-mail válido.";
  if (!cpfValido(v.cpf)) erros.cpf = "CPF inválido.";
  if (!telefoneValido(v.telefone)) erros.telefone = "Informe um telefone válido com DDD.";
  if (!dataNascimentoValida(v.dataNascimento))
    erros.dataNascimento = "Informe uma data válida (dd/mm/aaaa).";

  if (!cepValido(v.cep)) erros.cep = "CEP inválido.";
  if (!v.logradouro.trim()) erros.logradouro = "Informe o logradouro.";
  if (!v.numero.trim()) erros.numero = "Informe o número.";
  if (!v.bairro.trim()) erros.bairro = "Informe o bairro.";
  if (!v.cidade.trim()) erros.cidade = "Informe a cidade.";
  if (!v.uf) erros.uf = "Selecione o estado.";

  // No cadastro a senha é obrigatória; na edição, em branco significa "manter a atual".
  if (v.senha.length === 0) {
    if (!editando) erros.senha = "Informe uma senha.";
  } else if (v.senha.length < 6) {
    erros.senha = "A senha deve ter pelo menos 6 caracteres.";
  }

  return erros;
}

export default function UsuarioForm({ usuario }: { usuario?: Usuario }) {
  const router = useRouter();
  const editando = Boolean(usuario);

  const [valores, setValores] = useState<Valores>(
    usuario ? valoresDoUsuario(usuario) : valoresVazios,
  );
  const [erros, setErros] = useState<Erros>({});
  const [erroApi, setErroApi] = useState("");
  const [enviando, setEnviando] = useState(false);

  function alterar(campo: Campos) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const aplicar = mascaras[campo];
      const valor = aplicar ? aplicar(e.target.value) : e.target.value;
      setValores((atual) => ({ ...atual, [campo]: valor }));
      setErros((atual) => ({ ...atual, [campo]: undefined }));
    };
  }

  function validarAoSair(campo: Campos) {
    return () => {
      const todos = validar(valores, editando);
      setErros((atual) => ({ ...atual, [campo]: todos[campo] }));
    };
  }

  function propsDoCampo(campo: Campos) {
    return {
      value: valores[campo],
      onChange: alterar(campo),
      onBlur: validarAoSair(campo),
      erro: erros[campo],
    };
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErroApi("");

    const encontrados = validar(valores, editando);
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const cpf = soDigitos(valores.cpf);
      const email = valores.email.trim().toLowerCase();

      const duplicidade = await verificarDuplicidade(cpf, email, usuario?.id);
      if (duplicidade.cpf || duplicidade.email) {
        setErros({
          ...(duplicidade.cpf && { cpf: "Já existe um usuário com este CPF." }),
          ...(duplicidade.email && { email: "Já existe um usuário com este e-mail." }),
        });
        setEnviando(false);
        return;
      }

      const dados: Omit<UsuarioInput, "senha"> = {
        nome: valores.nome.trim(),
        email,
        cpf,
        telefone: soDigitos(valores.telefone),
        dataNascimento: dataBrParaIso(valores.dataNascimento) as string,
        endereco: {
          cep: soDigitos(valores.cep),
          logradouro: valores.logradouro.trim(),
          numero: valores.numero.trim(),
          complemento: valores.complemento.trim(),
          bairro: valores.bairro.trim(),
          cidade: valores.cidade.trim(),
          uf: valores.uf,
        },
      };

      if (usuario) {
        await atualizarUsuario(usuario.id, valores.senha ? { ...dados, senha: valores.senha } : dados);
      } else {
        await criarUsuario({ ...dados, senha: valores.senha });
      }

      router.push("/usuarios");
    } catch {
      setErroApi("Não foi possível salvar. Verifique se a API está em execução (npm run api).");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="mt-6 space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">Dados pessoais</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo
            id="nome"
            label="Nome completo"
            autoComplete="name"
            classeContainer="sm:col-span-2"
            {...propsDoCampo("nome")}
          />
          <Campo
            id="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com"
            {...propsDoCampo("email")}
          />
          <Campo
            id="telefone"
            label="Telefone"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            maxLength={15}
            {...propsDoCampo("telefone")}
          />
          <Campo
            id="cpf"
            label="CPF"
            inputMode="numeric"
            placeholder="000.000.000-00"
            maxLength={14}
            {...propsDoCampo("cpf")}
          />
          <Campo
            id="dataNascimento"
            label="Data de nascimento"
            inputMode="numeric"
            autoComplete="bday"
            placeholder="dd/mm/aaaa"
            maxLength={10}
            {...propsDoCampo("dataNascimento")}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">Endereço</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-6">
          <Campo
            id="cep"
            label="CEP"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            maxLength={9}
            classeContainer="sm:col-span-2"
            {...propsDoCampo("cep")}
          />
          <Campo
            id="logradouro"
            label="Logradouro"
            autoComplete="address-line1"
            classeContainer="sm:col-span-3"
            {...propsDoCampo("logradouro")}
          />
          <Campo id="numero" label="Número" classeContainer="sm:col-span-1" {...propsDoCampo("numero")} />
          <Campo
            id="complemento"
            label="Complemento (opcional)"
            classeContainer="sm:col-span-3"
            {...propsDoCampo("complemento")}
          />
          <Campo id="bairro" label="Bairro" classeContainer="sm:col-span-3" {...propsDoCampo("bairro")} />
          <Campo
            id="cidade"
            label="Cidade"
            autoComplete="address-level2"
            classeContainer="sm:col-span-4"
            {...propsDoCampo("cidade")}
          />
          <div className="sm:col-span-2">
            <label htmlFor="uf" className="block text-sm font-medium">
              Estado
            </label>
            <select
              id="uf"
              name="uf"
              value={valores.uf}
              onChange={alterar("uf")}
              onBlur={validarAoSair("uf")}
              aria-invalid={erros.uf ? true : undefined}
              aria-describedby={erros.uf ? "uf-erro" : undefined}
              className={classeInput(erros.uf)}
            >
              <option value="">Selecione</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
            {erros.uf && (
              <p id="uf-erro" className="mt-1 text-xs text-red-600">
                {erros.uf}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold">Acesso</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo
            id="senha"
            label="Senha"
            type="password"
            autoComplete="new-password"
            placeholder={editando ? "Deixe em branco para manter a atual" : "Mínimo de 6 caracteres"}
            {...propsDoCampo("senha")}
          />
        </div>
      </section>

      {erroApi && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {erroApi}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/usuarios"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar usuário"}
        </button>
      </div>
    </form>
  );
}
