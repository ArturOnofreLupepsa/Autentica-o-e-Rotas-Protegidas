import type { InputHTMLAttributes } from "react";

export function classeInput(erro?: string): string {
  const base =
    "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2";
  return erro
    ? `${base} border-red-400 focus:border-red-500 focus:ring-red-200`
    : `${base} border-slate-300 focus:border-indigo-500 focus:ring-indigo-200`;
}

type CampoProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  erro?: string;
  classeContainer?: string;
};

export default function Campo({ id, label, erro, classeContainer, ...props }: CampoProps) {
  return (
    <div className={classeContainer}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className={classeInput(erro)}
        {...props}
      />
      {erro && (
        <p id={`${id}-erro`} className="mt-1 text-xs text-red-600">
          {erro}
        </p>
      )}
    </div>
  );
}
