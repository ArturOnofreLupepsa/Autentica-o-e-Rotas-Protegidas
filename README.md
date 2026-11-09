This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Cadastro de usuários

O CRUD de usuários (`/usuarios`) consome uma API simulada com [JSON Server](https://github.com/typicode/json-server), que usa o arquivo `db.json`. São necessários dois terminais:

```bash
npm install
npm run api   # API em http://localhost:3001
npm run dev   # aplicação em http://localhost:3000
```

## Autenticação e rotas protegidas

- `POST /api/auth/login` valida e-mail e senha na API (`db.json`) e devolve um **token JWT (HS256, validade de 1 h)** num cookie `httpOnly` + `SameSite=Lax`.
- `src/proxy.ts` intercepta todas as rotas: sem token válido (ausente, adulterado ou expirado), o acesso a `/dashboard`, `/produtos` e `/usuarios` redireciona para o login (`/`). Com token válido, o login redireciona para o dashboard.
- `POST /api/auth/logout` remove o cookie (botão **Sair**).
- Configuração: copie `.env.example` para `.env.local` e defina `AUTH_SECRET` (obrigatório em produção). Em desenvolvimento há um segredo de fallback.
- Usuários de teste (`db.json`): `mariana.ribeiro@exemplo.com` / `senha123`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
