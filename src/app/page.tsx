import FormularioLogin from "../components/FormularioLogin";

type Props = { searchParams: Promise<{ motivo?: string; next?: string }> };

export default async function Login({ searchParams }: Props) {
  const { motivo, next } = await searchParams;
  return <FormularioLogin motivo={motivo} next={next} />;
}
